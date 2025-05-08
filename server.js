const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Prepare for serverless
if (process.env.NODE_ENV === 'production') {
  // Export the Express app for Vercel
  module.exports = app;
} else {
  // Start the server normally for local development
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
}