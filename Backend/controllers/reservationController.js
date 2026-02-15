const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Transaction = require('../models/Transaction');

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

// Create a new reservation with payment
exports.createReservation = async (req, res) => {
  try {
    const { 
      listingId, tenantId, reservedDate, reservedStartTime, 
      reservedEndTime, estimatedDurationHours, estimatedPrice, 
      paymentMethod, specialRequests 
    } = req.body;

    // Validate required fields
    if (!listingId || !tenantId || !reservedDate || 
        !reservedStartTime || !reservedEndTime || !estimatedDurationHours || 
        !estimatedPrice || !paymentMethod) {
      return res.status(400).json({ 
        error: 'listingId, tenantId, reservedDate, reservedStartTime, reservedEndTime, estimatedDurationHours, estimatedPrice, and paymentMethod are required' 
      });
    }

    // Validate ObjectIds
    if (!isValidObjectId(listingId) || !isValidObjectId(tenantId)) {
      return res.status(400).json({ error: 'Invalid ID format for listingId or tenantId' });
    }

    // Create reservation with pending status
    const reservationData = {
      listingId,
      tenantId,
      reservedDate,
      reservedStartTime,
      reservedEndTime,
      estimatedDurationHours,
      estimatedPrice,
      specialRequests,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newReservation = new Reservation(reservationData);
    const savedReservation = await newReservation.save();

    // Process payment
    const paymentResult = await processPayment({
      amount: estimatedPrice,
      paymentMethod,
      tenantId
    });

    if (paymentResult.success) {
      // Create transaction with bank transaction ID
      const transactionData = {
        reservationId: savedReservation._id,
        amount: estimatedPrice,
        time: new Date(),
        paymentMethod,
        bankTransId: paymentResult.transactionId
      };

      const newTransaction = new Transaction(transactionData);
      const savedTransaction = await newTransaction.save();

      // Update reservation to confirmed
      savedReservation.status = 'confirmed';
      savedReservation.updatedAt = new Date();
      await savedReservation.save();

      const populatedReservation = await Reservation.findById(savedReservation._id)
        .populate('listingId', 'title location')
        .populate('tenantId', 'firstName lastName email');

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
      .populate('listingId', 'title location')
      .populate('tenantId', 'firstName lastName email');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservation by ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('listingId', 'title location')
      .populate('tenantId', 'firstName lastName email');
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
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
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
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservations by tenant
exports.getReservationsByTenant = async (req, res) => {
  try {
    const reservations = await Reservation.find({ tenantId: req.params.tenantId })
      .populate('listingId', 'title location');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservations by listing
exports.getReservationsByListing = async (req, res) => {
  try {
    const reservations = await Reservation.find({ listingId: req.params.listingId })
      .populate('listingId', 'title location')
      .populate('tenantId', 'firstName lastName email');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
