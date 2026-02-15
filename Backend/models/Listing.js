const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
  },
  chargerType: {
    type: String,
    enum: ['Level 1', 'Level 2', 'DC Fast Charging'],
    required: true
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  pricePerKwh: {
    type: Number
  },
  maxConnectors: {
    type: Number,
    default: 1
  },
  amenities: [String],
  photos: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      tenantId: mongoose.Schema.Types.ObjectId,
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: Date.now
  }
});

listingSchema.index({ 'location.coordinates': '2dsphere' });
module.exports = mongoose.model('Listing', listingSchema);
