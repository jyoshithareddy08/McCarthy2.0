import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

// Hash API key before saving
toolSchema.pre('save', async function(next) {
  if (!this.isModified('apiKey')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.apiKey = await bcrypt.hash(this.apiKey, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Index for faster searches
toolSchema.index({ title: 'text', description: 'text', keywords: 'text' });
toolSchema.index({ uploadedBy: 1 });

const Tool = mongoose.model('Tool', toolSchema);

export default Tool;

