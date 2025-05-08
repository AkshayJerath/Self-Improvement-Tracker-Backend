""const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');
const cors = require('cors');

// Load env vars
dotenv.config();

// Middleware: CORS setup (Allowing access from anywhere)
app.use(cors({
  origin: '*',
  credentials: true
}));

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
""
