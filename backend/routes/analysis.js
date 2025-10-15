const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Report = require('../models/Report');
const authMiddleware = require('../middleware/auth');
const roboflowService = require('../services/roboflowService');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

// Analyze crop image
router.post('/analyze', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imagePath = req.file.path;
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Analyze image using Roboflow service
    console.log('🔍 Analyzing image with Roboflow:', req.file.filename);
    
    try {
      const result = await roboflowService.analyzeImage(imagePath);

      // Save analysis to database
      const report = await Report.create({
        userId: req.userId,
        imagePath,
        imageUrl,
        originalFilename: req.file.originalname,
        stage: result.stage || 'unknown',
        overallStage: result.overallStage || 'unknown',
        classCounts: result.classCounts || {},
        confidence: (result.confidence * 100) || 0, // Convert to percentage
        detections: result.detections || 0,
        floweringResults: {
          confidence: (result.flowering_results?.confidence * 100) || 0,
          detections: result.flowering_results?.detections || 0
        },
        fruitingResults: {
          confidence: (result.fruiting_results?.confidence * 100) || 0,
          detections: result.fruiting_results?.detections || 0
        },
        allDetections: result.all_detections || [],
        recommendations: result.recommendations || [],
        yieldKg: result.yieldKg || 0,
        estimatedEarnings: result.estimatedEarnings || 0,
        marketPricePerKg: result.marketPricePerKg || 0,
        fullyRipenedCount: result.fullyRipenedCount || 0,
        halfRipenedCount: result.halfRipenedCount || 0,
        greenCount: result.greenCount || 0,
        analysisDate: new Date(),
        processingTime: result.processing_time || 0,
        modelVersion: result.model_version || 'roboflow-v1',
        status: 'completed'
      });

      // Update user stats
      await User.findByIdAndUpdate(req.userId, {
        $inc: { totalAnalyses: 1, totalReports: 1 }
      });

      res.json({
        success: true,
        reportId: report._id,
        stage: report.stage,
        overallStage: report.overallStage,
        classCounts: report.classCounts,
        confidence: report.confidence,
        detections: report.detections,
        floweringResults: report.floweringResults,
        fruitingResults: report.fruitingResults,
        recommendations: report.recommendations,
        yieldKg: report.yieldKg,
        estimatedEarnings: report.estimatedEarnings,
        marketPricePerKg: report.marketPricePerKg,
        fullyRipenedCount: report.fullyRipenedCount,
        halfRipenedCount: report.halfRipenedCount,
        greenCount: report.greenCount,
        imageUrl: report.imageUrl,
        timestamp: report.analysisDate,
        allDetections: report.allDetections
      });

    } catch (mlError) {
      console.error('ML service error:', mlError);
      
      // Clean up uploaded file
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      return res.status(500).json({ 
        error: mlError.message || 'Analysis failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? mlError.stack : undefined
      });
    }

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

// Get user stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const lastReport = await Report.findOne({ userId: req.userId })
      .sort({ analysisDate: -1 })
      .limit(1);

    res.json({
      success: true,
      totalAnalyses: user.totalAnalyses || 0,
      totalReports: user.totalReports || 0,
      lastAnalysisDate: lastReport?.analysisDate || null
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get stats' 
    });
  }
});

// ML Service health check
router.get('/ml-health', async (req, res) => {
  try {
    const health = await roboflowService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
