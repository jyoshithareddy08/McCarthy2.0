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
  finalResponse: {
    type: String,
    default: null
  },
  outputFiles: [{
    type: String // URLs or file paths
  }]
}, {
  timestamps: true
});

// Index for faster queries
pipelineSchema.index({ userId: 1, createdAt: -1 });

const Pipeline = mongoose.model('Pipeline', pipelineSchema);

export default Pipeline;

