const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reservedDate: {
    type: Date,
    required: true
  },
  reservedStartTime: {
    type: String,
    required: true
  },
  reservedEndTime: {
    type: String,
    required: true
  },
  estimatedDurationHours: {
    type: Number,
    required: true
  },
  estimatedPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'in-progress', 'completed'],
    default: 'pending'
  },
  specialRequests: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);
