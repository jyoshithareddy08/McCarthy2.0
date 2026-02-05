import mongoose from 'mongoose';

const segmentRunSchema = new mongoose.Schema({
  pipelineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pipeline',
    required: [true, 'Pipeline ID is required']
  },
  segmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Segment',
    required: [true, 'Segment ID is required']
  },
  order: {
    type: Number,
    required: [true, 'Order is required'],
    min: [0, 'Order must be a non-negative number']
  },
  inputText: {
    type: String,
    default: null
  },
  inputFiles: [{
    type: String // URLs or file paths
  }],
  outputText: {
    type: String,
    default: null
  },
  outputFiles: [{
    type: String // URLs or file paths
  }],
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
segmentRunSchema.index({ pipelineId: 1, order: 1 });
segmentRunSchema.index({ segmentId: 1 });
segmentRunSchema.index({ pipelineId: 1, status: 1 });

const SegmentRun = mongoose.model('SegmentRun', segmentRunSchema);

export default SegmentRun;

