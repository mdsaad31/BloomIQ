const mongoose = require('mongoose');

const RETRY_DELAY_MS = 5000;
const MAX_RETRIES = 5;
let connectionListenersInitialized = false;
let isConnected = false;
let lastConnectionError = null;

const initializeConnectionListeners = () => {
  if (connectionListenersInitialized) return;
  connectionListenersInitialized = true;

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    lastConnectionError = err.message;
    console.error('❌ MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.log('⚠️  MongoDB disconnected');
  });
};

const connectDB = async (retryCount = 0) => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required but not set');
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    isConnected = true;
    lastConnectionError = null;
    initializeConnectionListeners();

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    isConnected = false;
    lastConnectionError = error.message;
    console.error('❌ Error connecting to MongoDB:', error.message);

    if (retryCount < MAX_RETRIES) {
      const nextRetry = retryCount + 1;
      const waitTime = RETRY_DELAY_MS * nextRetry;
      console.log(`🔄 Retrying MongoDB connection (${nextRetry}/${MAX_RETRIES}) in ${waitTime / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return connectDB(nextRetry);
    }

    throw error;
  }
};

const getDBStatus = () => ({
  connected: isConnected,
  error: lastConnectionError
});

module.exports = { connectDB, getDBStatus };
