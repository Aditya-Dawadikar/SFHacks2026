const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Transaction = require('../models/Transaction');
const Listing = require('../models/Listing');
const Schedule = require('../models/Schedule');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Generate unique transaction ID
const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Simulated payment service
const processPayment = async (paymentDetails) => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate 95% success rate (for demo purposes)
  const isSuccessful = Math.random() < 0.95;
  
  return {
    success: isSuccessful,
    transactionId: generateTransactionId(),
    paymentGateway: 'stripe_simulated',
    message: isSuccessful ? 'Payment processed successfully' : 'Payment failed - insufficient funds'
  };
};

// Validation helper for reservation create/update
const validateReservationInput = (data, isCreate = true) => {
  const errors = [];

  if (isCreate) {
    const required = ['tenantId', 'listingId', 'date', 'reservedStartTime', 'reservedEndTime', 'schedules', 'paymentMethod'];
    for (const field of required) {
      if (data[field] == null || data[field] === '') {
        errors.push(`${field} is required`);
      }
    }
    if (data.schedules && Array.isArray(data.schedules) && data.schedules.length === 0) {
      errors.push('schedules must contain at least one slot ID');
    }
  }

  if (data.listingId != null && !isValidObjectId(data.listingId)) {
    errors.push('Invalid listingId format');
  }
  if (data.tenantId != null && !isValidObjectId(data.tenantId)) {
    errors.push('Invalid tenantId format');
  }

  const price = Number(data.price);
  if (data.price != null && (isNaN(price) || price < 0)) {
    errors.push('price must be a non-negative number');
  }

  if (data.schedules != null && !Array.isArray(data.schedules)) {
    errors.push('schedules must be an array of slot IDs');
  }
  if (data.schedules != null && Array.isArray(data.schedules)) {
    const invalidIds = data.schedules.filter(id => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      errors.push('schedules must contain valid ObjectIds');
    }
  }

  if (data.status != null && !['pending', 'reserved', 'cancelled', 'charging', 'charged'].includes(data.status)) {
    errors.push('status must be one of: pending, reserved, cancelled, charging, charged');
  }

  if (data.paymentMethod != null && !['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'digital_wallet'].includes(data.paymentMethod)) {
    errors.push('paymentMethod must be one of: credit_card, debit_card, paypal, bank_transfer, digital_wallet');
  }

  return errors;
};

// Create a new reservation with payment
exports.createReservation = async (req, res) => {
  try {
    const validationErrors = validateReservationInput(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const { listingId, tenantId, schedules: scheduleIds, price, date, reservedStartTime, reservedEndTime, paymentMethod } = req.body;
    const schedules = scheduleIds || [];

    // Fetch listing to get ownerId and pricePerHour
    const listing = await Listing.findById(listingId).select('ownerId pricePerHour');
    if (!listing) {
      return res.status(404).json({ errors: ['Listing not found'] });
    }

    // Validate slots
    if (scheduleIds && scheduleIds.length > 0) {
      const slots = await Schedule.find({ _id: { $in: scheduleIds } });
      if (slots.length !== scheduleIds.length) {
        return res.status(400).json({ errors: ['One or more schedule IDs do not exist'] });
      }
      const wrongListing = slots.some(s => s.listingId.toString() !== listingId.toString());
      if (wrongListing) {
        return res.status(400).json({ errors: ['All slots must belong to the specified listing'] });
      }
      const unavailable = slots.some(s => !s.isAvailable || s.isBlocked);
      if (unavailable) {
        return res.status(400).json({ errors: ['One or more slots are not available for booking'] });
      }
    }

    // Calculate price if not provided (based on number of slots and listing price)
    const calculatedPrice = price || (schedules.length * (listing.pricePerHour || 0));

    // Create reservation with pending status
    const reservationData = {
      listingId,
      tenantId,
      ownerId: listing.ownerId,
      noOfSlots: schedules.length,
      schedules,
      price: calculatedPrice,
      date,
      reservedStartTime,
      reservedEndTime,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newReservation = new Reservation(reservationData);
    const savedReservation = await newReservation.save();

    // Process payment
    const paymentResult = await processPayment({
      amount: calculatedPrice,
      paymentMethod,
      tenantId
    });

    if (paymentResult.success) {
      // Create transaction with bank transaction ID
      const transactionData = {
        reservationId: savedReservation._id,
        amount: calculatedPrice,
        time: new Date(),
        paymentMethod,
        bankTransId: paymentResult.transactionId
      };

      const newTransaction = new Transaction(transactionData);
      const savedTransaction = await newTransaction.save();

      // Mark slots as unavailable (reserved)
      if (scheduleIds && scheduleIds.length > 0) {
        await Schedule.updateMany(
          { _id: { $in: scheduleIds } },
          { $set: { isAvailable: false, updatedAt: new Date() } }
        );
      }

      // Update reservation to reserved
      savedReservation.status = 'reserved';
      savedReservation.updatedAt = new Date();
      await savedReservation.save();

      const populatedReservation = await Reservation.findById(savedReservation._id)
        .populate('listingId', 'title location ownerId pricePerHour')
        .populate('tenantId', 'firstName lastName email')
        .populate('ownerId', 'firstName lastName email')
        .populate('schedules', 'openingTime closingTime listingId');

      res.status(201).json({
        message: 'Reservation created and payment successful',
        reservation: populatedReservation,
        transaction: savedTransaction
      });
    } else {
      // Payment failed - keep reservation as pending
      res.status(402).json({
        message: 'Reservation created but payment failed',
        reservation: savedReservation,
        paymentError: paymentResult.message
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all reservations
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('listingId', 'title location ownerId pricePerHour')
      .populate('tenantId', 'firstName lastName email')
      .populate('ownerId', 'firstName lastName email')
      .populate('schedules', 'openingTime closingTime listingId isAvailable');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservation by ID
exports.getReservationById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid reservation ID' });
    }
    const reservation = await Reservation.findById(req.params.id)
      .populate('listingId', 'title location ownerId pricePerHour')
      .populate('tenantId', 'firstName lastName email')
      .populate('ownerId', 'firstName lastName email')
      .populate('schedules', 'openingTime closingTime listingId isAvailable');
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update reservation by ID
exports.updateReservation = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid reservation ID' });
    }

    const validationErrors = validateReservationInput(req.body, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const existingReservation = await Reservation.findById(req.params.id);
    if (!existingReservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // If status changed to cancelled, release the slots
    if (req.body.status === 'cancelled' && existingReservation.status !== 'cancelled') {
      if (existingReservation.schedules && existingReservation.schedules.length > 0) {
        await Schedule.updateMany(
          { _id: { $in: existingReservation.schedules } },
          { $set: { isAvailable: true, updatedAt: new Date() } }
        );
      }
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('listingId', 'title location ownerId pricePerHour')
      .populate('tenantId', 'firstName lastName email')
      .populate('ownerId', 'firstName lastName email')
      .populate('schedules', 'openingTime closingTime listingId isAvailable');
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.status(200).json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete reservation by ID
exports.deleteReservation = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid reservation ID' });
    }
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    // Release slots before deleting reservation
    if (reservation.schedules && reservation.schedules.length > 0) {
      await Schedule.updateMany(
        { _id: { $in: reservation.schedules } },
        { $set: { isAvailable: true, updatedAt: new Date() } }
      );
    }
    await Reservation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservations by tenant
exports.getReservationsByTenant = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    const reservations = await Reservation.find({ tenantId: req.params.tenantId })
      .populate('listingId', 'title location ownerId pricePerHour')
      .populate('ownerId', 'firstName lastName email')
      .populate('schedules', 'openingTime closingTime listingId isAvailable');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservations by owner
exports.getReservationsByOwner = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.ownerId)) {
      return res.status(400).json({ error: 'Invalid owner ID' });
    }
    const reservations = await Reservation.find({ ownerId: req.params.ownerId })
      .populate('listingId', 'title location ownerId pricePerHour')
      .populate('tenantId', 'firstName lastName email')
      .populate('schedules', 'openingTime closingTime listingId isAvailable');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservations by listing
exports.getReservationsByListing = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.listingId)) {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }
    const reservations = await Reservation.find({ listingId: req.params.listingId })
      .populate('listingId', 'title location ownerId pricePerHour')
      .populate('tenantId', 'firstName lastName email')
      .populate('ownerId', 'firstName lastName email')
      .populate('schedules', 'openingTime closingTime listingId isAvailable');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
