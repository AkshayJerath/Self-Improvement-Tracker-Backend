const express = require('express');
const { 
  getBehaviors, 
  getBehavior, 
  createBehavior, 
  updateBehavior, 
  deleteBehavior,
  getTopBehaviors
} = require('../controllers/behaviorController');

const { protect } = require('../middleware/auth');

// Include todo router
const todoRouter = require('./todos');

const router = express.Router();

// Re-route into other resource routers
router.use('/:behaviorId/todos', todoRouter);

router.route('/top')
  .get(protect, getTopBehaviors);

router.route('/')
  .get(protect, getBehaviors)
  .post(protect, createBehavior);

router.route('/:id')
  .get(protect, getBehavior)
  .put(protect, updateBehavior)
  .delete(protect, deleteBehavior);

module.exports = router;