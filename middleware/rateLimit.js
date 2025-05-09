const rateLimit = function (options) {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
  };

  const opts = { ...defaultOptions, ...options };

  // Simple in-memory store for rate limiting
  const ipRequests = new Map();

  // Get current time
  const now = Date.now();

  // Clean up old requests every hour
  setInterval(() => {
    const expiry = Date.now() - opts.windowMs;
    ipRequests.forEach((requests, ip) => {
      // Filter out requests older than windowMs
      const recent = requests.filter(timestamp => timestamp > expiry);
      if (recent.length === 0) {
        ipRequests.delete(ip);
      } else {
        ipRequests.set(ip, recent);
      }
    });
  }, 60 * 60 * 1000); // 1 hour

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    
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