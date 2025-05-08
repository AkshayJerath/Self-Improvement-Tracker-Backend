const User = require('../models/User');

// Middleware to inject user's theme preference into response
exports.injectTheme = async (req, res, next) => {
  // Only apply to routes where user is authenticated
  if (req.user) {
    try {
      const user = await User.findById(req.user.id);
      
      // Store the original json method
      const originalJson = res.json;
      
      // Override the json method
      res.json = function(body) {
        // Add theme preference to the response
        if (body && typeof body === 'object' && !body.theme) {
          body.theme = user.preferences.theme || 'light';
        }
        
        // Call the original json method
        return originalJson.call(this, body);
      };
    } catch (err) {
      console.error('Error in theme middleware:', err.message);
    }
  }
  
  next();
};