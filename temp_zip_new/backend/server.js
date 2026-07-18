const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Set security headers using Helmet
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to API routes
app.use('/api/', apiLimiter);

// Import Routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chats');
const uploadRoutes = require('./routes/upload');

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Express server error:', err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Express server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
