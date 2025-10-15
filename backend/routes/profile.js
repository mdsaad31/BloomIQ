const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user profile (same as /api/auth/me but kept for backward compatibility)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        region: user.region,
        language: user.language,
        profilePicture: user.profilePicture,
        totalAnalyses: user.totalAnalyses,
        totalReports: user.totalReports,
        notifications: user.notifications,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get profile' 
    });
  }
});

// Update user profile (same as /api/auth/profile but kept for backward compatibility)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, region, language, notifications } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (region !== undefined) user.region = region;
    if (language) user.language = language;
    if (notifications !== undefined) user.notifications = notifications;
    
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        region: user.region,
        language: user.language,
        notifications: user.notifications
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile' 
    });
  }
});

module.exports = router;
