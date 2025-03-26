const rateLimit = require('express-rate-limit');
const { RateLimiterMongo } = require('rate-limiter-flexible');
const mongoose = require('mongoose');

// Basic rate limiting for all API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

let couponClaimLimiter = null;

// Function to initialize rate limiter dynamically
const getRateLimiter = () => {
  if (!couponClaimLimiter && mongoose.connection.readyState === 1) {
    console.log('Initializing RateLimiterMongo...');
    couponClaimLimiter = new RateLimiterMongo({
      storeClient: mongoose.connection,
      points: 2, // Allow 2 claims per hour
      duration: 60 * 60, // 1 hour
      keyPrefix: 'coupon_claim'
    });
  }
  return couponClaimLimiter;
};

// Coupon claim rate limiting middleware
const couponClaimRateLimit = async (req, res, next) => {
  const rateLimiter = getRateLimiter();

  if (!rateLimiter) {
    console.warn('Rate limiter not initialized. Allowing request but logging issue.');
    return next(); // Allow request but warn about missing rate limiter
  }

  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (e) {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ error: 'Too many coupon claims from this IP. Please try again later.' });
  }
};

// Initialize rate limiter when MongoDB is connected
mongoose.connection.once('open', () => {
  console.log('MongoDB connected. Rate limiter is ready.');
  getRateLimiter();
});

module.exports = { apiLimiter, couponClaimRateLimit };
