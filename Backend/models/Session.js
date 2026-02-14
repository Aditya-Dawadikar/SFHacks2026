const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
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
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  durationMinutes: Number,
  energyConsumedKwh: Number,
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'stopped'],
    default: 'ongoing'
  },
  meterReadingStart: Number,
  meterReadingEnd: Number,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChargingSession', sessionSchema);
