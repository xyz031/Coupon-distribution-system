const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin || req.body.password !== admin.password) {
      throw new Error('Invalid login credentials');
    }

    const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET);
    res.send({ admin, token });
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

module.exports = router;