const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { couponClaimRateLimit } = require('../middleware/rateLimit');
const auth = require('../middleware/auth');

// Get next available coupon
router.get('/claim',couponClaimRateLimit, async (req, res) => {
  try {
    // Check if user has a cookie indicating recent claim
    // if (req.cookies.coupon_claimed) {
    //   return res.status(400).send({ error: 'You have already claimed a coupon recently.' });
    // }

    const coupon = await Coupon.findOne({ isActive: true, isClaimed: false })
      .sort({ createdAt: 1 });

    if (!coupon) {
      return res.status(404).send({ error: 'No coupons available at the moment.' });
    }

    coupon.isClaimed = true;
    coupon.claimedBy = req.headers['user-agent'];
    coupon.ipAddress = req.ip;
    coupon.claimedAt = new Date();
    await coupon.save();

    // Set cookie to prevent immediate re-claim
    res.cookie('coupon_claimed', 'true', { 
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true 
    });

    res.send({ coupon });
  } catch (e) {
    res.status(500).send();
  }
});


// Get all claimed coupons with claim details (Admin only)
router.get('/admin/claim-history', auth, async (req, res) => {
  try {
    const claimedCoupons = await Coupon.find(
      { isClaimed: true },
      { 
        code: 1,
        value: 1,
        claimedBy: 1,
        claimedAt: 1,
        ipAddress: 1,
        isActive: 1,
        createdAt: 1
      }
    ).sort({ claimedAt: -1 }); // Newest first

    // Transform data for frontend
    const claimHistory = claimedCoupons.map(coupon => ({
      couponCode: coupon.code,
      value: coupon.value,
      claimedAt: coupon.claimedAt,
      ipAddress: coupon.ipAddress,
      userAgent: coupon.claimedBy, // Using claimedBy field for browser info
      status: coupon.isActive ? 'Active' : 'Inactive'
    }));

    res.json(claimHistory);
  } catch (e) {
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