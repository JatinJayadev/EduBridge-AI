const path = require('path');
const fs = require('fs');
const elevenlabsClient = require('../clients/elevenlabsClient');
const logger = require('../utils/logger');
const { retryWithBackoff } = require('../utils/retry');

// Audio storage directory
const AUDIO_DIR = path.join(__dirname, '..', 'audio');

/**
 * Ensure audio directory exists
 */
function ensureAudioDirectory() {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
    logger.info('Created audio directory:', AUDIO_DIR);
  }
}

/**
 * Generate a unique filename for audio segment
 * @param {string} jobId - Job ID
 * @param {number} segmentIndex - Segment index
 * @returns {string} - Full path to audio file
 */
function generateAudioFilePath(jobId, segmentIndex) {
  ensureAudioDirectory();
  const jobDir = path.join(AUDIO_DIR, jobId.toString());
  
  if (!fs.existsSync(jobDir)) {
    fs.mkdirSync(jobDir, { recursive: true });
  }

  const filename = `segment_${segmentIndex.toString().padStart(4, '0')}.mp3`;
  return path.join(jobDir, filename);
}

/**
 * Generate audio for a single translated segment
 * @param {string} text - Translated text
 * @param {string} jobId - Job ID
 * @param {number} segmentIndex - Segment index
 * @param {number} start - Start timestamp
 * @param {number} duration - Duration
 * @returns {Promise<Object>} - Audio segment object
 */
async function generateAudioForSegment(text, jobId, segmentIndex, start, duration) {
  const outputPath = generateAudioFilePath(jobId, segmentIndex);

  logger.info(`Generating audio for segment ${segmentIndex}`, {
    jobId,
    segmentIndex,
    textLength: text.length,
    outputPath,
  });

  try {
    // Generate audio with retry logic
    const result = await retryWithBackoff(
      () => elevenlabsClient.textToSpeech(text, outputPath),
      {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      }
    );

    logger.info(`Audio generated successfully for segment ${segmentIndex}`, {
      jobId,
      segmentIndex,
      filePath: result.filePath,
      fileSize: result.fileSize,
    });

    return {
      audioFilePath: result.filePath,
      start: start,
      duration: duration,
      segmentIndex: segmentIndex,
    };
  } catch (error) {
    logger.error(`Failed to generate audio for segment ${segmentIndex}`, {
      jobId,
      segmentIndex,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Generate audio for all translated transcript segments
 * @param {Array} translatedTranscript - Array of translated segments
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} - Array of audio segment objects
 */
async function generateAudioForAllSegments(translatedTranscript, jobId) {
  logger.info(`Starting TTS generation for job ${jobId}`, {
    totalSegments: translatedTranscript.length,
  });

  const audioSegments = [];
  const errors = [];

  // Process segments sequentially to avoid rate limiting
  for (let i = 0; i < translatedTranscript.length; i++) {
    const segment = translatedTranscript[i];
    
    try {
      const audioSegment = await generateAudioForSegment(
        segment.text,
        jobId,
        i,
        segment.start,
        segment.duration
      );
      
      audioSegments.push(audioSegment);

      logger.info(`Progress: ${i + 1}/${translatedTranscript.length} segments completed`, {
        jobId,
        progress: `${Math.round(((i + 1) / translatedTranscript.length) * 100)}%`,
      });

      // Optional: Add small delay between requests to avoid rate limiting
      if (i < translatedTranscript.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      errors.push({
        segmentIndex: i,
        text: segment.text,
        error: error.message,
      });

      logger.error(`Failed to generate audio for segment ${i}`, {
        jobId,
        segmentIndex: i,
        error: error.message,
      });

      // Continue with other segments even if one fails
      // You can change this behavior to stop on first error if needed
    }
  }

  if (errors.length > 0) {
    logger.warn(`TTS generation completed with errors`, {
      jobId,
      totalSegments: translatedTranscript.length,
      successCount: audioSegments.length,
      errorCount: errors.length,
    });

    // Throw error if all segments failed
    if (audioSegments.length === 0) {
      throw new Error(`All TTS segments failed. First error: ${errors[0].error}`);
    }

    // Throw error if more than 20% failed
    if (errors.length / translatedTranscript.length > 0.2) {
      throw new Error(
        `Too many TTS failures: ${errors.length}/${translatedTranscript.length} segments failed`
      );
    }
  }

  logger.info(`TTS generation completed successfully for job ${jobId}`, {
    totalSegments: translatedTranscript.length,
    successCount: audioSegments.length,
    errorCount: errors.length,
  });

  return audioSegments;
}

/**
 * Delete audio files for a job
 * @param {string} jobId - Job ID
 */
async function deleteAudioForJob(jobId) {
  const jobDir = path.join(AUDIO_DIR, jobId.toString());

  if (fs.existsSync(jobDir)) {
    try {
      fs.rmSync(jobDir, { recursive: true, force: true });
      logger.info(`Deleted audio files for job ${jobId}`);
    } catch (error) {
      logger.error(`Failed to delete audio files for job ${jobId}`, {
        error: error.message,
      });
    }
  }
}

/**
 * Get audio file stats
 * @param {string} filePath - Path to audio file
 * @returns {Object} - File stats
 */
function getAudioFileStats(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const stats = fs.statSync(filePath);
  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
  };
}

module.exports = {
  generateAudioForSegment,
  generateAudioForAllSegments,
  deleteAudioForJob,
  getAudioFileStats,
  ensureAudioDirectory,
};