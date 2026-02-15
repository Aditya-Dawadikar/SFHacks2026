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
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  noOfSlots: {
    type: Number,
    required: true,
    min: 1
  },
  schedules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  }],
  price: {
    type: Number,
    min: 0
  },
  date: {
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
  status: {
    type: String,
    enum: ['pending', 'reserved', 'cancelled', 'charging', 'charged'],
    default: 'pending'
  },
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
