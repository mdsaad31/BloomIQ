const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import MongoDB connection
const { connectDB, getDBStatus } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');
const weatherRoutes = require('./routes/weather');
const reportsRoutes = require('./routes/reports');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`📁 Created uploads directory: ${uploadsDir}`);
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/profile', profileRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'BloomIQ Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      analysis: '/api/analysis',
      reports: '/api/reports',
      weather: '/api/weather',
      profile: '/api/profile'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = getDBStatus();

  res.status(dbStatus.connected ? 200 : 503).json({ 
    status: dbStatus.connected ? 'ok' : 'degraded', 
    timestamp: new Date().toISOString(),
    service: 'BloomIQ Backend',
    mongodb: dbStatus.connected ? 'connected' : 'disconnected',
    ...(dbStatus.error && { mongodbError: dbStatus.error }),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const startServer = async () => {
  try {
    await connectDB();

    // Start server - bind to 0.0.0.0 to accept connections from other devices
    app.listen(PORT, '0.0.0.0', () => {
      const isProduction = process.env.NODE_ENV === 'production';
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🌿 BloomIQ Backend Server`);
      console.log(`${'='.repeat(60)}`);
      console.log(`✅ Server running on port ${PORT}`);
      
      if (isProduction) {
        console.log(`🔗 Production URL: https://bloomiq.onrender.com`);
      } else {
        console.log(`🔗 Local: http://localhost:${PORT}`);
        console.log(`🔗 Network: http://10.250.134.24:${PORT}`);
      }
      
      console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🤖 ML Service: Integrated (Roboflow API)`);
      console.log(`📊 Workspace: ${process.env.ROBOFLOW_WORKSPACE}`);
      console.log(`🔄 Workflow: ${process.env.ROBOFLOW_WORKFLOW_ID}`);
      console.log(`${'='.repeat(60)}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server due to MongoDB connection failure:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
