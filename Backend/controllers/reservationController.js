const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Listing = require('../models/Listing');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Validation helper for reservation create/update
const validateReservationInput = (data, isCreate = true) => {
  const errors = [];

  if (isCreate) {
    const required = ['tenantId', 'listingId', 'noOfSlots', 'date', 'startTime', 'endTime'];
    for (const field of required) {
      if (data[field] == null || data[field] === '') {
        errors.push(`${field} is required`);
      }
    }
  }

  if (data.listingId != null && !isValidObjectId(data.listingId)) {
    errors.push('Invalid listingId format');
  }
  if (data.tenantId != null && !isValidObjectId(data.tenantId)) {
    errors.push('Invalid tenantId format');
  }

  const noOfSlots = Number(data.noOfSlots);
  if (data.noOfSlots != null && (isNaN(noOfSlots) || noOfSlots < 1)) {
    errors.push('noOfSlots must be a positive integer');
  }

  const price = Number(data.price);
  if (data.price != null && (isNaN(price) || price < 0)) {
    errors.push('price must be a non-negative number');
  }

  if (data.schedules != null && !Array.isArray(data.schedules)) {
    errors.push('schedules must be an array');
  }
  if (data.schedules != null && Array.isArray(data.schedules)) {
    const invalidIds = data.schedules.filter(id => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      errors.push('schedules must contain valid ObjectIds');
    }
  }

  if (data.status != null && !['pending_payment', 'reserved', 'active', 'completed', 'cancelled', 'expired'].includes(data.status)) {
    errors.push('status must be one of: pending_payment, reserved, active, completed, cancelled, expired');
  }

  return errors;
};

// Create a new reservation
exports.createReservation = async (req, res) => {
  try {
    const validationErrors = validateReservationInput(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const reservationData = { ...req.body, schedules: req.body.schedules || [] };
    const newReservation = new Reservation(reservationData);
    const savedReservation = await newReservation.save();
    const populated = await savedReservation.populate([
      { path: 'listingId', select: 'title location ownerId' },
      { path: 'tenantId', select: 'firstName lastName email' }
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all reservations
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('listingId', 'title location ownerId')
      .populate('tenantId', 'firstName lastName email');
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
      .populate('listingId', 'title location ownerId')
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
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid reservation ID' });
    }

    const validationErrors = validateReservationInput(req.body, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('listingId', 'title location ownerId')
      .populate('tenantId', 'firstName lastName email');
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
    if (!isValidObjectId(req.params.tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    const reservations = await Reservation.find({ tenantId: req.params.tenantId })
      .populate('listingId', 'title location ownerId');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservations by owner (via listing's ownerId)
exports.getReservationsByOwner = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.ownerId)) {
      return res.status(400).json({ error: 'Invalid owner ID' });
    }
    const listings = await Listing.find({ ownerId: req.params.ownerId }).select('_id');
    const listingIds = listings.map((l) => l._id);
    const reservations = await Reservation.find({ listingId: { $in: listingIds } })
      .populate('listingId', 'title location ownerId')
      .populate('tenantId', 'firstName lastName email');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
