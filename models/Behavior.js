const mongoose = require('mongoose');

const BehaviorSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  color: {
    type: String,
    default: '#DC3545' // Default red color from the screenshot
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with todos
BehaviorSchema.virtual('todos', {
  ref: 'Todo',
  localField: '_id',
  foreignField: 'behavior',
  justOne: false
});

module.exports = mongoose.model('Behavior', BehaviorSchema);