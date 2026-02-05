import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import './models/index.js'; // Import all models to register them

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'McCarthy API is running!' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Routes will be added here
// Example: app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Create empty collections so they appear in MongoDB Compass/Atlas
    const db = mongoose.connection.db;
    if (db) {
      const collections = ['users', 'sessions', 'messages', 'tools', 'pipelines', 'segments', 'segmentruns'];
      for (const collectionName of collections) {
        try {
          const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
          if (!collectionExists) {
            await db.createCollection(collectionName);
            console.log(`✓ Created collection: ${collectionName}`);
          }
        } catch (err) {
          // Collection might already exist, ignore error
        }
      }
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

