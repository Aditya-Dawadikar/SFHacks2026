const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  profilePicture: {
    type: String
  },
  bio: {
    type: String
  },
  userType: {
    type: String,
    enum: ['owner', 'tenant'],
    required: true
  },
  // Owner specific fields
  owner: {
    totalListings: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalEarnings: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    bankAccount: String,
    businessName: String
  },
  // Tenant specific fields
  tenant: {
    totalSessions: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalSpent: { type: Number, default: 0 },
    defaultPaymentMethod: String,
    subscriptionLevel: {
      type: String,
      enum: ['basic', 'premium', 'vip'],
      default: 'basic'
    }
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

module.exports = mongoose.model('User', userSchema);
