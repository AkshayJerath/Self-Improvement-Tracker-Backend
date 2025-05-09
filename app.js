const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const { apiLimiter, authLimiter } = require('./middleware/rateLimit');
const { injectTheme } = require('./middleware/theme');
const { protect } = require('./middleware/auth');

// Load env vars
dotenv.config();

// Route files
const auth = require('./routes/auth');
const behaviors = require('./routes/behaviors');
const todos = require('./routes/todos');
const stats = require('./routes/stats');
const achievements = require('./routes/achievements');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Apply rate limiting to all routes
app.use(apiLimiter);

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter);

// Mount routers
app.use('/api/auth', auth);
app.use('/api/behaviors', behaviors);
app.use('/api/todos', todos);
app.use('/api/stats', stats);
app.use('/api/achievements', achievements);

// Apply theme middleware to protected routes
app.use('/api/behaviors', protect, injectTheme);
app.use('/api/todos', protect, injectTheme);
app.use('/api/stats', protect, injectTheme);
app.use('/api/achievements', protect, injectTheme);

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

module.exports = app;