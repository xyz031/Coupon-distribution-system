const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { couponClaimRateLimit } = require('../middleware/rateLimit');
const auth = require('../middleware/auth');

// Get next available coupon
router.get('/claim', couponClaimRateLimit, async (req, res) => {
  try {
    const userIP = req.ip;

    // Check if user has already claimed using cookies
    if (req.cookies.coupon_claimed) {
      return res.status(400).json({ error: 'You have already claimed a coupon recently.' });
    }

   
    // Find an available coupon
    const coupon = await Coupon.findOne({ isActive: true, isClaimed: false }).sort({ createdAt: 1 });

    if (!coupon) {
      return res.status(404).json({ error: 'No coupons available at the moment.' });
    }

    // Mark coupon as claimed
    coupon.isClaimed = true;
    coupon.claimedBy = req.headers['user-agent']; // Store browser info
    coupon.ipAddress = userIP;
    coupon.claimedAt = new Date();
    await coupon.save();

    // Set a cookie to prevent immediate re-claims
    res.cookie('coupon_claimed', 'true', { 
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true, 
      sameSite: 'Strict' 
    });

    res.json({ success: true, coupon: { code: coupon.code, value: coupon.value } });
  } catch (error) {
    console.error('Error claiming coupon:', error);
    res.status(500).json({ error: 'An error occurred while claiming the coupon. Please try again later.' });
  }
});

// Get all claimed coupons with claim details (Admin only)
router.get('/admin/claim-history', async (req, res) => {
  try {
    const claimedCoupons = await Coupon.find(
      { isClaimed: true },
      { code: 1, value: 1, claimedBy: 1, claimedAt: 1, ipAddress: 1, isActive: 1, createdAt: 1 }
    ).sort({ claimedAt: -1 });

    res.json({
      success: true,
      claimHistory: claimedCoupons.map((coupon) => ({
        couponCode: coupon.code,
        value: coupon.value,
        claimedAt: coupon.claimedAt.toISOString(), // Ensure proper formatting
        ipAddress: coupon.ipAddress,
        userAgent: coupon.claimedBy, // Using claimedBy field for browser info
        status: coupon.isActive ? 'Active' : 'Inactive'
      }))
    });
  } catch (error) {
    console.error('Error fetching claim history:', error);
    res.status(500).json({ error: 'Failed to fetch claim history' });
  }
});

// Admin routes
router.get('/admin', auth, async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.send(coupons);
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/admin', auth, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).send(coupon);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch('/admin/:id', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) {
      return res.status(404).send();
    }
    res.send(coupon);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;