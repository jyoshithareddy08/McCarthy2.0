import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['vendor', 'user'],
    required: [true, 'Role is required'],
    default: 'user'
  },
  favouriteTool: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool'
  }],
  profilePic: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Check if password is already hashed (starts with $2a$, $2b$, or $2y$)
  const isHashed = /^\$2[ayb]\$.{56}$/.test(this.password);
  
  if (!isHashed) {
    // If password is plain text (legacy), compare directly
    // This handles existing users with plain text passwords
    return this.password === candidatePassword;
  }
  
  // If password is hashed, use bcrypt to compare
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

