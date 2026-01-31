const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Serve audio files
router.get('/:jobId/:filename', (req, res) => {
  const { jobId, filename } = req.params;
  
  // Security: validate jobId and filename
  if (!/^[a-f0-9]{24}$/.test(jobId)) {
    return res.status(400).json({ error: 'Invalid job ID' });
  }
  
  if (!/^segment_\d{4}\.mp3$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const audioPath = path.join(__dirname, '..', 'audio', jobId, filename);

  // Check if file exists
  if (!fs.existsSync(audioPath)) {
    return res.status(404).json({ error: 'Audio file not found' });
  }

  // Set proper headers
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Accept-Ranges', 'bytes');
  
  // Stream the file
  const stream = fs.createReadStream(audioPath);
  stream.pipe(res);
  
  stream.on('error', (err) => {
    console.error('Error streaming audio:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream audio' });
    }
  });
});

module.exports = router;