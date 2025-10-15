const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Image information
  imagePath: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  originalFilename: {
    type: String,
    required: true
  },
  // Analysis results
  stage: {
    type: String,
    required: true,
    enum: ['flowering', 'fruiting', 'vegetative', 'harvesting', 'unknown', 'both']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  detections: {
    type: Number,
    default: 0
  },
  // Detailed results
  floweringResults: {
    confidence: { type: Number, default: 0 },
    detections: { type: Number, default: 0 }
  },
  fruitingResults: {
    confidence: { type: Number, default: 0 },
    detections: { type: Number, default: 0 }
  },
  // All detections array for detailed breakdown
  allDetections: [{
    class: String,
    confidence: Number,
    bbox: mongoose.Schema.Types.Mixed,
    x: Number,
    y: Number,
    width: Number,
    height: Number
  }],
  // Class breakdown
  classCounts: {
    type: Object,
    default: {}
  },
  // Overall stage (by class count)
  overallStage: {
    type: String,
    default: 'unknown'
  },
  // Yield and earnings
  yieldKg: {
    type: Number,
    default: 0
  },
  estimatedEarnings: {
    type: Number,
    default: 0
  },
  marketPricePerKg: {
    type: Number,
    default: 0
  },
  fullyRipenedCount: {
    type: Number,
    default: 0
  },
  halfRipenedCount: {
    type: Number,
    default: 0
  },
  greenCount: {
    type: Number,
    default: 0
  },
  // Recommendations
  recommendations: [{
    type: String
  }],
  // Additional metadata
  analysisDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  processingTime: {
    type: Number, // in milliseconds
    default: 0
  },
  modelVersion: {
    type: String,
    default: '1.0'
  },
  // Location (optional)
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  // Notes
  notes: {
    type: String,
    maxlength: 500,
    default: ''
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ stage: 1 });
reportSchema.index({ analysisDate: -1 });

// Virtual for getting formatted date
reportSchema.virtual('formattedDate').get(function() {
  return this.analysisDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to get summary
reportSchema.methods.getSummary = function() {
  return {
    id: this._id,
    stage: this.stage,
    confidence: this.confidence,
    detections: this.detections,
    date: this.analysisDate,
    imagePath: this.imagePath
  };
};

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
