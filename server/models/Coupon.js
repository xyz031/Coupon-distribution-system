const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: Number,
    required: true
  },
  isClaimed: {
    type: Boolean,
    default: false
  },
  claimedBy: {
    type: String
  },
  claimedAt: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', CouponSchema);