const express = require('express');
const router = express.Router();
const {
  processVideo,
  getJobStatus,
  translateIndexedTranscript,
  testTranslationWithHardcodedData,
  openaiHealthCheck,
} = require('../controllers/videoController');

// Convenience endpoints (helps while FE is still being wired)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Video API',
    endpoints: {
      processVideo: 'POST /api/video/process-video (or POST /api/video)',
      translate: 'POST /api/video/translate',
      testTranslate: 'POST /api/video/test-translate (hardcoded data for testing)',
      jobStatus: 'GET /api/video/job/:id',
    },
  });
});

// Main endpoint (existing - future: peer's transcript/indexing can be added here)
router.post('/process-video', processVideo);

// Alias (so POST /api/video also works)
router.post('/', processVideo);

// New: translate already-indexed transcript
router.post('/translate', translateIndexedTranscript);

// TEST ROUTE: Hardcoded data to test OpenAI translation
router.post('/test-translate', testTranslationWithHardcodedData);

// OpenAI connectivity test
router.get('/openai-health', openaiHealthCheck);


router.get('/job/:id', getJobStatus);

module.exports = router;