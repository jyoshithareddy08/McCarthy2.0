import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mccarthy';
    
    // Validate connection string format
    if (!mongoURI || mongoURI.trim() === '') {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // Provide helpful error messages
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('\n⚠️  Connection String Error:');
      console.error('   - Check if your MONGODB_URI in .env file is correct');
      console.error('   - For MongoDB Atlas, use format: mongodb+srv://username:password@cluster.mongodb.net/dbname');
      console.error('   - For local MongoDB, use format: mongodb://localhost:27017/dbname');
      console.error('   - Make sure there are no extra spaces or special characters');
    }
    
    process.exit(1);
  }
};

export default connectDB;

