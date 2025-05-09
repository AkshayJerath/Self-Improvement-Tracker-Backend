// Simple in-memory store for rate limiting
const ipRequests = new Map();
let cleanupInterval;

// Function to start the cleanup interval
const startCleanupInterval = () => {
  if (!cleanupInterval) {
    // Clean up old requests every hour
    cleanupInterval = setInterval(() => {
      const now = Date.now();
      ipRequests.forEach((requests, ip) => {
        // Filter out requests older than windowMs for each rate limiter
        // Using the longest window (1 hour) for cleanup
        const expiry = now - (60 * 60 * 1000);
        const recent = requests.filter(timestamp => timestamp > expiry);
        if (recent.length === 0) {
          ipRequests.delete(ip);
        } else {
          ipRequests.set(ip, recent);
        }
      });
    }, 60 * 60 * 1000); // 1 hour
    
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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Too many auth attempts from this IP, please try again after an hour'
});

exports.createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 create operations per hour
  message: 'Too many create operations from this IP, please try again after an hour'
});

// For testing purposes to clean up the interval
exports.stopCleanupInterval = stopCleanupInterval;