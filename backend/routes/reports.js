const express = require('express');
const Report = require('../models/Report');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all reports for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0, stage, sortBy = 'analysisDate', order = 'desc' } = req.query;

    const query = { userId: req.userId };
    
    // Filter by stage if provided
    if (stage && stage !== 'all') {
      query.stage = stage;
    }

    const reports = await Report.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      reports: reports.map(report => ({
        _id: report._id,
        imageUrl: report.imageUrl,
        originalFilename: report.originalFilename,
        stage: report.stage,
        overallStage: report.overallStage,
        confidence: report.confidence,
        detections: report.detections,
        classCounts: report.classCounts,
        all_detections: report.allDetections || [],
        yieldKg: report.yieldKg,
        estimatedEarnings: report.estimatedEarnings,
        marketPricePerKg: report.marketPricePerKg,
        recommendations: report.recommendations,
        createdAt: report.createdAt,
        analysisDate: report.analysisDate
      })),
      total,
      page: Math.floor(offset / limit) + 1,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get reports' 
    });
  }
});

// Get single report details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: 'Report not found' 
      });
    }

    res.json({
      success: true,
      report: {
        id: report._id,
        imageUrl: report.imageUrl,
        originalFilename: report.originalFilename,
        stage: report.stage,
        confidence: report.confidence,
        detections: report.detections,
        floweringResults: report.floweringResults,
        fruitingResults: report.fruitingResults,
        recommendations: report.recommendations,
        analysisDate: report.analysisDate,
        processingTime: report.processingTime,
        modelVersion: report.modelVersion,
        notes: report.notes,
        location: report.location
      }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get report' 
    });
  }
});

// Delete report
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: 'Report not found' 
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete report' 
    });
  }
});

module.exports = router;
