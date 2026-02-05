import mongoose from 'mongoose';

const pipelineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  sessionId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }],
  outputFile: {
    type: String,
    default: null
  },
  finalResponse: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
pipelineSchema.index({ userId: 1, createdAt: -1 });
pipelineSchema.index({ sessionId: 1 });

const Pipeline = mongoose.model('Pipeline', pipelineSchema);

export default Pipeline;

