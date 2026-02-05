import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'Session ID is required']
  },
  prompt: {
    type: String,
    required: [true, 'Prompt is required'],
    trim: true
  },
  files: [{
    type: String // URLs or file paths
  }],
  response: {
    type: String,
    default: null
  },
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ sessionId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;

