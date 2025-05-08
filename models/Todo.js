const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please add todo text'],
    trim: true,
    maxlength: [200, 'Todo cannot be more than 200 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  behavior: {
    type: mongoose.Schema.ObjectId,
    ref: 'Behavior',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Todo', TodoSchema);