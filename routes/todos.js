const express = require('express');
const { 
  getTodos, 
  getTodo,
  addTodo, 
  updateTodo, 
  deleteTodo,
  toggleTodoStatus
} = require('../controllers/todoController');

const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, getTodos)
  .post(protect, addTodo);

router.route('/:id')
  .get(protect, getTodo)
  .put(protect, updateTodo)
  .delete(protect, deleteTodo);

router.route('/:id/toggle')
  .put(protect, toggleTodoStatus);

module.exports = router;