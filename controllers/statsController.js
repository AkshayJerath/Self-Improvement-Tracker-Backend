const User = require('../models/User');
const Behavior = require('../models/Behavior');
const Todo = require('../models/Todo');
const mongoose = require('mongoose');

// @desc    Get user statistics
// @route   GET /api/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user and update statistics
    const user = await User.findById(userId);
    
    // Count completed todos
    const completedTodos = await Todo.countDocuments({ 
      user: userId, 
      completed: true 
    });
    
    // Count total todos
    const totalTodos = await Todo.countDocuments({ user: userId });
    
    // Count behaviors
    const totalBehaviors = await Behavior.countDocuments({ user: userId });
    
    // Update user statistics
    user.statistics.totalBehaviors = totalBehaviors;
    user.statistics.totalTodos = totalTodos;
    user.statistics.completedTodos = completedTodos;
    user.statistics.lastActive = Date.now();
    
    await user.save();

    // Calculate completion percentage
    const completionPercentage = totalTodos > 0 
      ? Math.round((completedTodos / totalTodos) * 100) 
      : 0;

    // Get behavior with most todos
    const behaviors = await Behavior.find({ user: userId }).populate('todos');
    let mostActiveBehavior = null;
    let mostTodos = 0;

    behaviors.forEach(behavior => {
      if (behavior.todos.length > mostTodos) {
        mostTodos = behavior.todos.length;
        mostActiveBehavior = behavior;
      }
    });

    // Get recent activity - last 5 modified todos
    const recentActivity = await Todo.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('behavior', 'title');

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBehaviors,
          totalTodos,
          completedTodos,
          incompleteTodos: totalTodos - completedTodos,
          completionPercentage,
          streakDays: user.statistics.streakDays
        },
        mostActiveBehavior: mostActiveBehavior ? {
          id: mostActiveBehavior._id,
          title: mostActiveBehavior.title,
          todoCount: mostTodos
        } : null,
        recentActivity: recentActivity.map(todo => ({
          id: todo._id,
          text: todo.text,
          completed: todo.completed,
          behavior: todo.behavior ? {
            id: todo.behavior._id,
            title: todo.behavior.title
          } : null,
          updatedAt: todo.updatedAt
        }))
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get behavior completion rate
// @route   GET /api/stats/behaviors/:id
// @access  Private
exports.getBehaviorStats = async (req, res) => {
  try {
    const behaviorId = req.params.id;
    const userId = req.user.id;

    // Check if behavior exists and belongs to user
    const behavior = await Behavior.findOne({ 
      _id: behaviorId, 
      user: userId 
    });

    if (!behavior) {
      return res.status(404).json({
        success: false,
        error: 'Behavior not found or does not belong to user'
      });
    }

    // Get todos for this behavior
    const todos = await Todo.find({ behavior: behaviorId, user: userId });
    
    // Count completed todos
    const completedTodos = todos.filter(todo => todo.completed).length;
    
    // Calculate completion percentage
    const completionPercentage = todos.length > 0 
      ? Math.round((completedTodos / todos.length) * 100) 
      : 0;

    // Get completion trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyCompletions = await Todo.aggregate([
      { 
        $match: { 
          behavior: mongoose.Types.ObjectId(behaviorId),
          user: mongoose.Types.ObjectId(userId),
          completed: true,
          updatedAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        behaviorId,
        title: behavior.title,
        totalTodos: todos.length,
        completedTodos,
        incompleteTodos: todos.length - completedTodos,
        completionPercentage,
        dailyCompletions
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get streak data
// @route   GET /api/stats/streak
// @access  Private
exports.getStreakData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get dates of todo completions for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completions = await Todo.aggregate([
      { 
        $match: { 
          user: mongoose.Types.ObjectId(userId),
          completed: true,
          updatedAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate current streak
    let currentStreak = 0;
    let maxStreak = 0;
    
    // Create a set of completion dates for easy lookup
    const completionDates = new Set(completions.map(day => day._id));
    
    // Calculate current streak - count backwards from today
    const today = new Date();
    let checkDate = new Date(today);
    
    while (true) {
      const dateString = checkDate.toISOString().split('T')[0];
      
      if (completionDates.has(dateString)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate max streak in the 30-day period
    let tempStreak = 0;
    let prevDate = null;
    
    // Sort dates to calculate streaks
    const sortedDates = Array.from(completionDates).sort();
    
    for (const dateStr of sortedDates) {
      const currDate = new Date(dateStr);
      
      if (prevDate === null) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(currDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      
      maxStreak = Math.max(maxStreak, tempStreak);
      prevDate = currDate;
    }

    // Update user's streak information
    await User.findByIdAndUpdate(userId, {
      'statistics.streakDays': currentStreak
    });

    res.status(200).json({
      success: true,
      data: {
        currentStreak,
        maxStreak,
        dailyCompletions: completions,
        activeDays: completions.length
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};