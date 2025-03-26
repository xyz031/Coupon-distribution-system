const rateLimit = require('express-rate-limit');
const { RateLimiterMongo } = require('rate-limiter-flexible');
const mongoose = require('mongoose');

// Basic rate limiting for all API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// Ensuring MongoDB is ready before using RateLimiterMongo
const initializeRateLimiter = () => {
  if (mongoose.connection.readyState !== 1) {
    console.error('MongoDB not connected. Rate limiter may fail.');
  }
  
  return new RateLimiterMongo({
    storeClient: mongoose.connection,
    points: 1, // 1 claim
    duration: 60 * 60, // per 1 hour
    keyPrefix: 'coupon_claim'
  });
};

const couponClaimLimiter = initializeRateLimiter();

const couponClaimRateLimit = async (req, res, next) => {
  try {
    const ip = req.ip;
    await couponClaimLimiter.consume(ip);
    next();
  } catch (e) {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).send({ error: 'Too many coupon claims from this IP. Please try again later.' });
  }
};

module.exports = { apiLimiter, couponClaimRateLimit };
