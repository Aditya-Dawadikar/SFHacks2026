const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'digital_wallet'],
    required: true
  },
  bankTransId: {
    type: String,
    unique: true,
    sparse: true
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
