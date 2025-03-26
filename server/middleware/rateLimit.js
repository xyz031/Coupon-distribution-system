const rateLimit = require('express-rate-limit');
const { RateLimiterMongo } = require('rate-limiter-flexible');
const mongoose = require('mongoose');

// Basic rate limiting for all API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

let couponClaimLimiter;

// Initialize Rate Limiter only when MongoDB is ready
const initializeRateLimiter = () => {
  if (mongoose.connection.readyState === 1) {
    console.log('Initializing RateLimiterMongo...');
    couponClaimLimiter = new RateLimiterMongo({
      storeClient: mongoose.connection,
      points: 2, // Allow 2 coupon claims per hour
      duration: 60 * 60, // 1 hour
      keyPrefix: 'coupon_claim'
    });
  } else {
    console.error('MongoDB not connected. Rate limiter initialization delayed.');
  }
};

// Listen for MongoDB connection event
mongoose.connection.once('open', initializeRateLimiter);

const couponClaimRateLimit = async (req, res, next) => {
  if (!couponClaimLimiter) {
    console.error('Rate limiter not initialized due to missing MongoDB connection.');
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }

  try {
    await couponClaimLimiter.consume(req.ip);
    next();
  } catch (e) {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ error: 'Too many coupon claims from this IP. Please try again later.' });
  }
};

module.exports = { apiLimiter, couponClaimRateLimit };
