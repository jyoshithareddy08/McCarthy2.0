import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  toolId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool'
  }],
  type: {
    type: String,
    enum: ['normal', 'playground'],
    required: [true, 'Session type is required'],
    default: 'normal'
  },
  chatTitle: {
    type: String,
    trim: true,
    default: 'New Chat'
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }]
}, {
  timestamps: true
});

// Index for faster queries
sessionSchema.index({ userId: 1, createdAt: -1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;

