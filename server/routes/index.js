const express = require('express');
const router = express.Router();

/**
 * @route   GET /api
 * @desc    API health check and welcome message
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to EduBridge-AI API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
    },
  });
});

/**
 * @route   GET /api/health
 * @desc    Check API health status
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;