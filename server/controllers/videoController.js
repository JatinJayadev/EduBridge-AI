const VideoJob = require('../models/VideoJob');

/**
 * @desc    Initialize a video processing job
 * @route   POST /api/video/process-video
 * @access  Public
 */
exports.processVideo = async (req, res, next) => {
  try {
    const { videoUrl, targetLanguage } = req.body;

    // Simple validation
    if (!videoUrl || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both videoUrl and targetLanguage'
      });
    }

    // Create the job record in MongoDB
    const job = await VideoJob.create({
      videoUrl,
      targetLanguage,
      status: 'PROCESSING'
    });

    res.status(201).json({
      success: true,
      message: 'Video processing job started',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get status of a video job
 * @route   GET /api/video/job/:id
 * @access  Public
 */
exports.getJobStatus = async (req, res, next) => {
  try {
    const job = await VideoJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};