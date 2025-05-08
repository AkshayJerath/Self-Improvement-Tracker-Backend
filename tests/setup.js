const { stopCleanupInterval } = require('../middleware/rateLimit');

// Clean up any open handles after all tests complete
afterAll(async () => {
  // Stop the cleanup interval in the rate limiter
  stopCleanupInterval();
});