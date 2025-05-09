""// Simple in-memory store for rate limiting
const ipRequests = new Map();
let cleanupInterval;

// Function to start the cleanup interval
const startCleanupInterval = () => {
  if (!cleanupInterval) {
    // Clean up old requests every second (1 second)
    cleanupInterval = setInterval(() => {
      const now = Date.now();
      ipRequests.forEach((requests, ip) => {
        const expiry = now - 1000; // 1 second
        const recent = requests.filter(timestamp => timestamp > expiry);
        if (recent.length === 0) {
          ipRequests.delete(ip);
        } else {
          ipRequests.set(ip, recent);
        }
      });
    }, 1000); // 1 second
    
    // Make sure the interval doesn't keep the process alive
    cleanupInterval.unref();
  }
};

// Function to stop the cleanup interval (for testing)
const stopCleanupInterval = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};

const rateLimit = function (options) {
  const defaultOptions = {
    windowMs: 1000, // 1 second
    max: 5, // limit each IP to 5 requests per second
    message: 'Network connection error, kindly try again.'
  };

  const opts = { ...defaultOptions, ...options };

  // Start the cleanup interval if it's not already running
  startCleanupInterval();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Initialize or get existing timestamps for this IP
    const timestamps = ipRequests.get(ip) || [];
    
    // Filter out old requests outside the window
    const recentTimestamps = timestamps.filter(timestamp => timestamp > now - opts.windowMs);
    
    // Check if max requests exceeded
    if (recentTimestamps.length >= opts.max) {
      return res.status(429).json({
        success: false,
        error: opts.message
      });
    }

    // Add this request timestamp
    recentTimestamps.push(now);
    ipRequests.set(ip, recentTimestamps);

    next();
  };
};

// Different rate limits for different routes
exports.apiLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 5, // 5 requests per second
  message: 'Network connection error, kindly try again.'
});

exports.authLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 3, // 3 auth attempts per second
  message: 'Network connection error, kindly try again.'
});

exports.createLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 2, // 2 create operations per second
  message: 'Network connection error, kindly try again.'
});

// For testing purposes to clean up the interval
exports.stopCleanupInterval = stopCleanupInterval;
""
