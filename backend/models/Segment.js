import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: [true, 'Prompt is required'],
    trim: true
  },
  response: {
    type: String,
    default: null
  },
  toolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool',
    required: [true, 'Tool ID is required']
  },
  inputFiles: [{
    type: String // URLs or file paths
  }],
  outputFiles: [{
    type: String // URLs or file paths
  }],
  order: {
    type: Number,
    required: [true, 'Order is required'],
    min: [0, 'Order must be a non-negative number']
  },
  pipelineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pipeline',
    required: [true, 'Pipeline ID is required']
  }
}, {
  timestamps: true
});

// Index for faster queries
segmentSchema.index({ pipelineId: 1, order: 1 });
segmentSchema.index({ toolId: 1 });

const Segment = mongoose.model('Segment', segmentSchema);

export default Segment;

