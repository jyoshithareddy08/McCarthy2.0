import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  prompt: {
    type: String,
    required: [true, 'Prompt is required'],
    trim: true
  },
  toolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool',
    required: [true, 'Tool ID is required']
  },
  order: {
    type: Number,
    required: [true, 'Order is required'],
    min: [0, 'Order must be a non-negative number']
  },
  pipelineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pipeline',
    required: [true, 'Pipeline ID is required']
  },
  inputSource: {
    type: String,
    enum: ['initial', 'previous'],
    default: 'previous'
  },
  model: {
    type: String,
    trim: true,
    default: null // Optional: specific model to use for this segment (must be in tool.models array)
  }
}, {
  timestamps: true
});

// Index for faster queries
segmentSchema.index({ pipelineId: 1, order: 1 });
segmentSchema.index({ toolId: 1 });

const Segment = mongoose.model('Segment', segmentSchema);

export default Segment;

