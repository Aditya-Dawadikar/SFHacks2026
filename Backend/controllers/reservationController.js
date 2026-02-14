const Reservation = require('../models/Reservation');

// Create a new reservation
exports.createReservation = async (req, res) => {
  try {
    const newReservation = new Reservation(req.body);
    const savedReservation = await newReservation.save();
    res.status(201).json(savedReservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all reservations
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('listingId', 'title location')
      .populate('tenantId', 'firstName lastName email')
      .populate('ownerId', 'firstName lastName email');
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
      .populate('tenantId', 'firstName lastName email')
      .populate('ownerId', 'firstName lastName email');
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

// Get reservations by owner
exports.getReservationsByOwner = async (req, res) => {
  try {
    const reservations = await Reservation.find({ ownerId: req.params.ownerId })
      .populate('listingId', 'title location')
      .populate('tenantId', 'firstName lastName email');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
