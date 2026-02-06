import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  apiKey: {
    type: String,
    required: [true, 'API key is required'],
    select: false // Don't return API key by default
  },
  // API Configuration for external LLM services
  apiEndpoint: {
    type: String,
    required: [true, 'API endpoint is required'],
    trim: true
  },
  apiMethod: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH'],
    default: 'POST'
  },
  apiHeaders: {
    type: mongoose.Schema.Types.Mixed, // JSON object for custom headers
    default: null
  },
  requestBodyTemplate: {
    type: mongoose.Schema.Types.Mixed, // JSON template with placeholders
    default: null
  },
  responsePath: {
    type: String, // JSON path to extract output, e.g., "choices[0].message.content" or "content[0].text"
    default: null
  },
  provider: {
    type: String,
    enum: ['openai', 'anthropic', 'google', 'custom'],
    default: 'custom' // Default to custom for flexibility
  },
  models: [{
    type: String, // Array of model names/IDs for the LLM (e.g., ["gpt-4", "gpt-3.5-turbo", "claude-3-opus"])
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  useCases: [{
    type: String,
    trim: true
  }],
  alternatives: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for faster searches
toolSchema.index({ title: 'text', description: 'text', keywords: 'text' });
toolSchema.index({ uploadedBy: 1 });

const Tool = mongoose.model('Tool', toolSchema);

export default Tool;

