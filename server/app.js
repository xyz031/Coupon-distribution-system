const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const couponRouter = require('./routes/coupon');
const adminRouter = require('./routes/admin');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'https://coupon-distribution-system-livid.vercel.app/', // Vercel frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));



app.use(express.json());
app.use(cookieParser());
app.use(apiLimiter);

// Routes
app.use('/api/coupons', couponRouter);
app.use('/api/admin', adminRouter);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Database connection error:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});