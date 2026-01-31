const express = require('express');
const router = express.Router();
const { processVideo, getJobStatus } = require('../controllers/videoController');

// Convenience endpoints (helps while FE is still being wired)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Video API',
    endpoints: {
      processVideo: 'POST /api/video/process-video (or POST /api/video)',
      jobStatus: 'GET /api/video/job/:id',
    },
  });
});

// Main endpoint
router.post('/process-video', processVideo);

// Alias (so POST /api/video also works)
router.post('/', processVideo);

router.get('/job/:id', getJobStatus);

module.exports = router;