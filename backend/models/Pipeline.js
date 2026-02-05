import mongoose from 'mongoose';

const pipelineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  finalResponse: {
    type: String,
    default: null
  },
  outputFiles: [{
    type: String // URLs or file paths
  }],
  // Sharing fields
  isShared: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
  },
  sharedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
pipelineSchema.index({ userId: 1, createdAt: -1 });
// Note: shareToken already has unique: true, sparse: true in field definition
// No need for separate index - it's automatically created with sparse: true

const Pipeline = mongoose.model('Pipeline', pipelineSchema);

export default Pipeline;

