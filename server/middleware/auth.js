const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).send({ error: 'Authorization header is missing.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(token)
    console.log(decoded._id)
    const admin = await Admin.findOne({ _id: decoded._id });
    console.log(admin)
    if (!admin) {
      return res.status(401).send({ error: 'Invalid authentication token.' });
    }

    req.token = token;
    req.admin = admin;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = auth;
