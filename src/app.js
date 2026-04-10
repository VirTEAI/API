const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();

// Middleware
app.use(express.json());

// Initialize Prisma Client
const prisma = new PrismaClient();

// Routes
// Example route
app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// User routes
app.use('/users', require('./routes/userRoutes'));

// Session ID routes
app.use('/sessions', require('./routes/sessionRoutes.js'));

// Auth routes
app.use('/auth', require('./routes/authRoutes'));

module.exports = app;