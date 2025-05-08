const Todo = require('../models/Todo');
const Behavior = require('../models/Behavior');

// @desc    Get todos for a behavior
// @route   GET /api/behaviors/:behaviorId/todos
// @access  Private
exports.getTodos = async (req, res) => {
  try {
    // Check if behavior exists and belongs to user
    const behavior = await Behavior.findById(req.params.behaviorId);
    if (!behavior) {
      return res.status(404).json({
        success: false,
        error: 'Behavior not found'
      });
    }

    if (behavior.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access todos for this behavior'
      });
    }

    const todos = await Todo.find({ 
      behavior: req.params.behaviorId,
      user: req.user.id
    }).sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single todo
// @route   GET /api/todos/:id
// @access  Private
exports.getTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    // Make sure user owns the todo
    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this todo'
      });
    }

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Add todo to behavior
// @route   POST /api/behaviors/:behaviorId/todos
// @access  Private
exports.addTodo = async (req, res) => {
  try {
    // Check if behavior exists and belongs to user
    const behavior = await Behavior.findById(req.params.behaviorId);
    if (!behavior) {
      return res.status(404).json({
        success: false,
        error: 'Behavior not found'
      });
    }

    if (behavior.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to add todos to this behavior'
      });
    }

    // Add behavior and user to request body
    req.body.behavior = req.params.behaviorId;
    req.body.user = req.user.id;

    const todo = await Todo.create(req.body);

    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Private
exports.updateTodo = async (req, res) => {
  try {
    let todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    // Make sure user owns the todo
    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this todo'
      });
    }

    todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Toggle todo completion status
// @route   PUT /api/todos/:id/toggle
// @access  Private
exports.toggleTodoStatus = async (req, res) => {
  try {
    let todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    // Make sure user owns the todo
    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this todo'
      });
    }

    // Toggle the completed status
    todo = await Todo.findByIdAndUpdate(
      req.params.id, 
      { completed: !todo.completed }, 
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Private
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    // Make sure user owns the todo
    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this todo'
      });
    }

    await todo.deleteOne();

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