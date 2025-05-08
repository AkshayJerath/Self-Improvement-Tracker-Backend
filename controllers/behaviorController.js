const Behavior = require('../models/Behavior');
const Todo = require('../models/Todo');
const mongoose = require('mongoose');

// @desc    Get all behaviors
// @route   GET /api/behaviors
// @access  Private
exports.getBehaviors = async (req, res) => {
  try {
    const behaviors = await Behavior.find({ user: req.user.id }).populate('todos');

    res.status(200).json({
      success: true,
      count: behaviors.length,
      data: behaviors
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get top 5 behaviors with most todos
// @route   GET /api/behaviors/top
// @access  Private
exports.getTopBehaviors = async (req, res) => {
  try {
    // Two approaches to handle this - use approach based on your MongoDB version
    
    // APPROACH 1: Direct method - get all behaviors with their todos
    const behaviors = await Behavior.find({ user: req.user.id }).populate('todos');
    
    // Sort by number of todos
    const sortedBehaviors = behaviors.sort((a, b) => {
      return (b.todos?.length || 0) - (a.todos?.length || 0);
    });
    
    // Get top 5
    const topBehaviors = sortedBehaviors.slice(0, 5);
    
    return res.status(200).json({
      success: true,
      count: topBehaviors.length,
      data: topBehaviors
    });
    
    /* 
    // APPROACH 2: Using aggregation - if approach 1 doesn't work, try uncommenting this
    // Make sure userId is a valid ObjectId
    let userId;
    try {
      userId = mongoose.Types.ObjectId(req.user.id);
    } catch (err) {
      userId = req.user.id; // Use as string if conversion fails
    }
    
    // Count todos for each behavior
    const todoCountByBehavior = await Todo.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$behavior', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    if (todoCountByBehavior.length === 0) {
      // If no todos found, just return top 5 behaviors
      const behaviors = await Behavior.find({ user: req.user.id })
        .limit(5)
        .populate('todos');
      
      return res.status(200).json({
        success: true,
        count: behaviors.length,
        data: behaviors
      });
    }
    
    // Extract behavior IDs
    const behaviorIds = todoCountByBehavior.map(result => result._id);
    
    // Find behavior details
    const behaviors = await Behavior.find({
      _id: { $in: behaviorIds },
      user: req.user.id
    }).populate('todos');
    
    // Create a map for quick lookup
    const behaviorMap = {};
    behaviors.forEach(behavior => {
      behaviorMap[behavior._id.toString()] = behavior;
    });
    
    // Sort behaviors by todo count (match the aggregation order)
    const sortedBehaviors = behaviorIds
      .map(id => behaviorMap[id.toString()])
      .filter(Boolean); // Filter out any undefined values
    
    return res.status(200).json({
      success: true,
      count: sortedBehaviors.length,
      data: sortedBehaviors
    });
    */
  } catch (err) {
    console.error('Error in getTopBehaviors:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get top behaviors: ' + err.message
    });
  }
};

// @desc    Get single behavior
// @route   GET /api/behaviors/:id
// @access  Private
exports.getBehavior = async (req, res) => {
  try {
    const behavior = await Behavior.findById(req.params.id).populate('todos');

    if (!behavior) {
      return res.status(404).json({
        success: false,
        error: 'Behavior not found'
      });
    }

    // Make sure user owns the behavior
    if (behavior.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this behavior'
      });
    }

    res.status(200).json({
      success: true,
      data: behavior
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Create new behavior
// @route   POST /api/behaviors
// @access  Private
exports.createBehavior = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    const behavior = await Behavior.create(req.body);

    res.status(201).json({
      success: true,
      data: behavior
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update behavior
// @route   PUT /api/behaviors/:id
// @access  Private
exports.updateBehavior = async (req, res) => {
  try {
    let behavior = await Behavior.findById(req.params.id);

    if (!behavior) {
      return res.status(404).json({
        success: false,
        error: 'Behavior not found'
      });
    }

    // Make sure user owns the behavior
    if (behavior.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this behavior'
      });
    }

    behavior = await Behavior.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: behavior
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete behavior
// @route   DELETE /api/behaviors/:id
// @access  Private
exports.deleteBehavior = async (req, res) => {
  try {
    const behavior = await Behavior.findById(req.params.id);

    if (!behavior) {
      return res.status(404).json({
        success: false,
        error: 'Behavior not found'
      });
    }

    // Make sure user owns the behavior
    if (behavior.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this behavior'
      });
    }

    // Delete all associated todos first
    await Todo.deleteMany({ behavior: req.params.id });
    
    // Then delete the behavior
    await behavior.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};