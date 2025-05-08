const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const behaviors = require('./routes/behaviors');
const todos = require('./routes/todos');
const stats = require('./routes/stats');
const achievements = require('./routes/achievements');

const app = express();

// Body parser
app.use(express.json());

// CORS configuration - Allow specific origins with credentials
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://self-improvement-tracker-frontend.vercel.app' 
    : ['http://localhost:3000', 'http://localhost:3001'], // Support local development
  credentials: true, // This is critical for cookies/auth to work
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', auth);
app.use('/api/behaviors', behaviors);
app.use('/api/todos', todos);
app.use('/api/stats', stats);
app.use('/api/achievements', achievements);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    data: {
      name: 'Self Improvement Tracker API',
      version: '1.0.0',
      author: 'Akshay Jerath',
      endpoints: {
        auth: '/api/auth',
        behaviors: '/api/behaviors',
        todos: '/api/todos',
        stats: '/api/stats',
        achievements: '/api/achievements'
      }
    }
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
