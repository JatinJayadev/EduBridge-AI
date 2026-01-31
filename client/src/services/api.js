// API base URL - update this based on your backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001/api';

/**
 * Submit a YouTube video URL for processing
 * @param {string} videoUrl - YouTube video URL
 * @param {string} targetLanguage - Target language code (e.g., 'hi', 'es', 'fr')
 * @returns {Promise<Object>} - Response with jobId
 */
export async function submitVideo(videoUrl, targetLanguage) {
  const response = await fetch(`${API_BASE_URL}/transcribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      videoUrl,
      convertLanguage: targetLanguage,
      clientRequestId: `client-${Date.now()}`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit video');
  }

  return response.json();
}

/**
 * Get job status and details
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} - Job details including status, translated transcript, and audio segments
 */
export async function getJobStatus(jobId) {
  const response = await fetch(`${API_BASE_URL}/video/job/${jobId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch job status');
  }

  return response.json();
}

/**
 * Poll job status until completion
 * @param {string} jobId - Job ID
 * @param {Function} onUpdate - Callback for status updates
 * @param {number} interval - Polling interval in ms (default: 2000)
 * @returns {Promise<Object>} - Final job data when completed
 */
export async function pollJobStatus(jobId, onUpdate, interval = 2000) {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const response = await getJobStatus(jobId);
        const job = response.data;

        // Notify caller of status update
        if (onUpdate) {
          onUpdate(job);
        }

        // Check if job is complete
        if (job.status === 'COMPLETED') {
          resolve(job);
        } else if (job.status === 'FAILED') {
          reject(new Error(job.error || 'Job failed'));
        } else {
          // Continue polling
          setTimeout(poll, interval);
        }
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
export function extractYouTubeVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Get YouTube embed URL from video ID
 * @param {string} videoId - YouTube video ID
 * @returns {string} - YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
}

/**
 * Get audio file URL from server
 * @param {string} audioFilePath - Server-side audio file path
 * @returns {string} - Full URL to audio file
 */
export function getAudioUrl(audioFilePath) {
  // For now, we'll need to add a static file serving endpoint on the backend
  // This assumes the backend will serve files from /api/audio/:jobId/:filename
  const filename = audioFilePath.split('/').pop();
  const jobId = audioFilePath.split('/').slice(-2, -1)[0];
  return `${API_BASE_URL}/audio/${jobId}/${filename}`;
}