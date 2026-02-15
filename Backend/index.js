const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const listingsRouter = require('./routes/listings');
const reservationsRouter = require('./routes/reservations');
const schedulesRouter = require('./routes/schedules');
const usersRouter = require('./routes/users');
const sessionsRouter = require('./routes/sessions');
const transactionsRouter = require('./routes/transactions');
const chatRouter = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evbnb';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to EVBnB Backend API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// API Routes
app.use('/api/listings', listingsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/chat', chatRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export app for testing
module.exports = app;

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
