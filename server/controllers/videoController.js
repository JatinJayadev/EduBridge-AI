const VideoJob = require('../models/VideoJob');
const logger = require('../utils/logger');
const { translateIndexedLines } = require('../services/openaiTranslateService');
const { mergeTranslatedWithTiming } = require('../utils/transcriptMerger');
const OpenAI = require('openai');

/**
 * Background runner: translate and update DB.
 * Kept in same file for simplicity/debuggability.
 */
async function runTranslationJob(jobId) {
  const job = await VideoJob.findById(jobId);
  if (!job) return;

  if (!job.indexedLines || job.indexedLines.length === 0) {
    await VideoJob.findByIdAndUpdate(jobId, {
      status: 'FAILED',
      error: 'No indexedLines provided for translation',
    });
    return;
  }

  try {
    await VideoJob.findByIdAndUpdate(jobId, { status: 'PROCESSING', error: null });

    const translatedLines = await translateIndexedLines({
      indexedLines: job.indexedLines,
      targetLanguage: job.targetLanguage,
    });

    // Merge translated text with original timing (for TTS)
    const translatedTranscript = mergeTranslatedWithTiming(
      job.transcript,
      translatedLines
    );

    await VideoJob.findByIdAndUpdate(jobId, {
      status: 'COMPLETED',
      translatedLines,
      translatedTranscript,
      openai: {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      },
    });
  } catch (err) {
    logger.warn('Translation job failed', {
      jobId,
      status: err?.status || err?.statusCode,
      message: err?.message,
    });

    await VideoJob.findByIdAndUpdate(jobId, {
      status: 'FAILED',
      error: err?.message || 'Translation failed',
      openai: {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        lastError: err?.message || 'Translation failed',
      },
    });
  }
}

/**
 * @desc    Initialize a video processing job (existing)
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
        error: 'Please provide both videoUrl and targetLanguage',
      });
    }

    // Create the job record in MongoDB
    const job = await VideoJob.create({
      videoUrl,
      targetLanguage,
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Video job created (transcript indexing not wired yet)',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start translation using already-indexed lines
 * @route   POST /api/video/translate
 * @access  Public
 */
exports.translateIndexedTranscript = async (req, res, next) => {
  try {
    const { indexedLines, targetLanguage, clientRequestId, videoUrl, transcript } = req.body;

    if (!targetLanguage) {
      return res.status(400).json({ success: false, error: 'targetLanguage is required' });
    }
    if (!Array.isArray(indexedLines) || indexedLines.length === 0) {
      return res.status(400).json({ success: false, error: 'indexedLines (non-empty array) is required' });
    }

    // Idempotency: if FE sends same clientRequestId again, return same job
    if (clientRequestId) {
      const existing = await VideoJob.findOne({ clientRequestId });
      if (existing) {
        return res.status(200).json({
          success: true,
          message: 'Job already exists for this clientRequestId',
          data: { jobId: existing._id, status: existing.status },
        });
      }
    }

    const job = await VideoJob.create({
      videoUrl: videoUrl || null,
      clientRequestId: clientRequestId || null,
      targetLanguage,
      indexedLines,
      transcript: transcript || [], // Store original timing
      status: 'PENDING',
    });

    // Start async (resolver-like) processing; return immediately
    setImmediate(() => runTranslationJob(job._id));

    return res.status(201).json({
      success: true,
      message: 'Translation job started',
      data: { jobId: job._id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    TEST ROUTE - Hardcoded data to verify OpenAI translation works
 * @route   POST /api/video/test-translate
 * @access  Public
 */
exports.testTranslationWithHardcodedData = async (req, res, next) => {
  try {
    // Get target language from request, or default to Hindi
    const { targetLanguage = 'hi' } = req.body;

    // Hardcoded indexed lines (your peer will generate these later)
    const hardcodedIndexedLines = [
      '1. After years of war,',
      '2. no one could stand between my men',
      '3. and home.',
      '4. Not even me.',
      '5. Promise me you will come back.',
      '6. What if I cannot?',
    ];

    // Hardcoded original transcript with timing (simulates YouTube API response)
    const hardcodedTranscript = [
      { text: 'After years of war,', start: 24, duration: 3.625 },
      { text: 'no one could stand between my men', start: 35, duration: 2.75 },
      { text: 'and home.', start: 42, duration: 3.791 },
      { text: 'Not even me.', start: 49, duration: 3.208 },
      { text: 'Promise me you will come back.', start: 99, duration: 2.792 },
      { text: 'What if I cannot?', start: 102, duration: 2.458 },
    ];

    logger.info('TEST: Creating translation job with hardcoded data', {
      targetLanguage,
      linesCount: hardcodedIndexedLines.length,
    });

    const job = await VideoJob.create({
      videoUrl: 'https://youtube.com/watch?v=TEST_HARDCODED',
      clientRequestId: `test-${Date.now()}`,
      targetLanguage,
      indexedLines: hardcodedIndexedLines,
      transcript: hardcodedTranscript,
      status: 'PENDING',
    });

    // Start async translation
    setImmediate(() => runTranslationJob(job._id));

    return res.status(201).json({
      success: true,
      message: 'TEST: Translation job started with hardcoded data',
      data: {
        jobId: job._id,
        indexedLines: hardcodedIndexedLines,
        targetLanguage,
        note: 'Poll GET /api/video/job/:id to check status',
      },
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
        error: 'Job not found',
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Quick OpenAI connectivity test (no DB, no jobs)
 * @route   GET /api/video/openai-health
 * @access  Public
 */
exports.openaiHealthCheck = async (req, res, next) => {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Smallest request: list models (fast and simple)
    const result = await client.models.list({}, { timeout: 10000 });

    const firstModelId = result?.data?.[0]?.id || null;

    return res.status(200).json({
      success: true,
      canConnect: true,
      modelConfigured: process.env.OPENAI_MODEL || null,
      firstModelId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Important: show low-level cause (DNS/timeout/etc)
    return res.status(200).json({
      success: true,
      canConnect: false,
      modelConfigured: process.env.OPENAI_MODEL || null,
      error: {
        name: err?.name,
        message: err?.message,
        status: err?.status || err?.statusCode,
        causeCode: err?.cause?.code,
        causeMessage: err?.cause?.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
};