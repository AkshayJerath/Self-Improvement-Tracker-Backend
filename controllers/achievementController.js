const User = require('../models/User');
const Todo = require('../models/Todo');
const Behavior = require('../models/Behavior');

// Achievement definitions
const ACHIEVEMENTS = [
  {
    id: 'first_behavior',
    name: 'First Steps',
    description: 'Create your first behavior',
    icon: '🌱',
    check: async (userId) => {
      const count = await Behavior.countDocuments({ user: userId });
      return count >= 1;
    }
  },
  {
    id: 'five_behaviors',
    name: 'Habit Builder',
    description: 'Create five different behaviors',
    icon: '🏆',
    check: async (userId) => {
      const count = await Behavior.countDocuments({ user: userId });
      return count >= 5;
    }
  },
  {
    id: 'first_todo',
    name: 'Baby Steps',
    description: 'Create your first todo item',
    icon: '📝',
    check: async (userId) => {
      const count = await Todo.countDocuments({ user: userId });
      return count >= 1;
    }
  },
  {
    id: 'first_completed',
    name: 'Mission Accomplished',
    description: 'Complete your first todo item',
    icon: '✅',
    check: async (userId) => {
      const count = await Todo.countDocuments({ user: userId, completed: true });
      return count >= 1;
    }
  },
  {
    id: 'ten_completed',
    name: 'Getting Things Done',
    description: 'Complete 10 todo items',
    icon: '🚀',
    check: async (userId) => {
      const count = await Todo.countDocuments({ user: userId, completed: true });
      return count >= 10;
    }
  },
  {
    id: 'fifty_completed',
    name: 'Productivity Master',
    description: 'Complete 50 todo items',
    icon: '💯',
    check: async (userId) => {
      const count = await Todo.countDocuments({ user: userId, completed: true });
      return count >= 50;
    }
  },
  {
    id: 'three_day_streak',
    name: 'Consistent',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    check: async (userId) => {
      const user = await User.findById(userId);
      return user.statistics.streakDays >= 3;
    }
  },
  {
    id: 'seven_day_streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '📅',
    check: async (userId) => {
      const user = await User.findById(userId);
      return user.statistics.streakDays >= 7;
    }
  },
  {
    id: 'behavior_completion',
    name: 'Behavior Master',
    description: 'Complete all todos in a behavior',
    icon: '🌟',
    check: async (userId) => {
      // Get all behaviors for the user
      const behaviors = await Behavior.find({ user: userId }).populate('todos');
      
      // Check if any behavior has all todos completed and at least 5 todos
      for (const behavior of behaviors) {
        if (behavior.todos.length >= 5) {
          const allCompleted = behavior.todos.every(todo => todo.completed);
          if (allCompleted) {
            return true;
          }
        }
      }
      
      return false;
    }
  },
  {
    id: 'diverse_improvement',
    name: 'Renaissance Person',
    description: 'Complete at least one todo in each of 5 different behaviors',
    icon: '🎭',
    check: async (userId) => {
      // Get all completed todos
      const completedTodos = await Todo.find({ 
        user: userId, 
        completed: true 
      }).distinct('behavior');
      
      return completedTodos.length >= 5;
    }
  }
];

// @desc    Check and award new achievements
// @route   POST /api/achievements/check
// @access  Private
exports.checkAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    // Get IDs of existing achievements
    const existingAchievementIds = user.achievements.map(a => a.name);
    
    // Array to store newly earned achievements
    const newAchievements = [];
    
    // Check each achievement
    for (const achievement of ACHIEVEMENTS) {
      // Skip if already earned
      if (existingAchievementIds.includes(achievement.name)) {
        continue;
      }
      
      // Check if achievement condition is met
      const isEarned = await achievement.check(userId);
      
      if (isEarned) {
        // Add to user's achievements
        user.achievements.push({
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon
        });
        
        // Add to new achievements list
        newAchievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon
        });
      }
    }
    
    // Save user with new achievements
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        newAchievements,
        allAchievements: user.achievements
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get all user achievements
// @route   GET /api/achievements
// @access  Private
exports.getAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get all available achievements with earned status
    const allAchievements = ACHIEVEMENTS.map(achievement => {
      const earned = user.achievements.some(a => a.name === achievement.name);
      
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        earned,
        dateEarned: earned ? user.achievements.find(a => a.name === achievement.name).dateEarned : null
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        earned: user.achievements.length,
        total: ACHIEVEMENTS.length,
        achievements: allAchievements
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};