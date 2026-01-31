import { useState } from 'react';
import { submitVideo, pollJobStatus, extractYouTubeVideoId } from '../services/api';
import VideoPlayer from './VideoPlayer';

const VideoTranslator = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [audioSegments, setAudioSegments] = useState([]);

  const languages = [
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setJobStatus(null);
    setAudioSegments([]);

    try {
      // Validate YouTube URL
      const extractedVideoId = extractYouTubeVideoId(videoUrl);
      if (!extractedVideoId) {
        throw new Error('Invalid YouTube URL');
      }
      setVideoId(extractedVideoId);

      // Submit video for processing
      const response = await submitVideo(videoUrl, targetLanguage);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to submit video');
      }

      const newJobId = response.jobId;
      setJobId(newJobId);
      setJobStatus({ status: 'PENDING', message: 'Job submitted successfully' });

      // Start polling for job status
      pollJobStatus(
        newJobId,
        (job) => {
          // Update status on each poll
          setJobStatus({
            status: job.status,
            message: getStatusMessage(job.status),
            progress: getProgress(job),
          });

          // If completed, set audio segments
          if (job.status === 'COMPLETED' && job.audioSegments) {
            setAudioSegments(job.audioSegments);
          }
        },
        2000 // Poll every 2 seconds
      )
        .then((completedJob) => {
          setJobStatus({
            status: 'COMPLETED',
            message: 'Translation and audio generation completed!',
          });
          setAudioSegments(completedJob.audioSegments || []);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setJobStatus({ status: 'FAILED', message: err.message });
          setLoading(false);
        });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Waiting to start...';
      case 'PROCESSING':
        return 'Processing translation and generating audio...';
      case 'COMPLETED':
        return 'Completed successfully!';
      case 'FAILED':
        return 'Processing failed';
      default:
        return 'Unknown status';
    }
  };

  const getProgress = (job) => {
    if (job.status === 'COMPLETED') return 100;
    if (job.status === 'PROCESSING') return 50;
    if (job.status === 'PENDING') return 10;
    return 0;
  };

  const handleReset = () => {
    setVideoUrl('');
    setJobId(null);
    setJobStatus(null);
    setError(null);
    setVideoId(null);
    setAudioSegments([]);
    setLoading(false);
  };

  return (
    <div className="video-translator">
      <div className="container">
        <h1>EduBridge AI - Video Translator</h1>
        <p className="subtitle">
          Translate YouTube videos to any language with AI-powered voice-over
        </p>

        {/* Submission Form */}
        {!jobId && (
          <form onSubmit={handleSubmit} className="submission-form">
            <div className="form-group">
              <label htmlFor="videoUrl">YouTube Video URL</label>
              <input
                type="text"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="targetLanguage">Target Language</label>
              <select
                id="targetLanguage"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                disabled={loading}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Processing...' : 'Translate Video'}
            </button>

            {error && <div className="error-message">{error}</div>}
          </form>
        )}

        {/* Job Status */}
        {jobStatus && (
          <div className="job-status">
            <div className="status-header">
              <h3>Job Status</h3>
              <span className={`status-badge ${jobStatus.status.toLowerCase()}`}>
                {jobStatus.status}
              </span>
            </div>

            <p className="status-message">{jobStatus.message}</p>

            {jobStatus.progress !== undefined && jobStatus.status !== 'FAILED' && (
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${jobStatus.progress}%` }}
                />
              </div>
            )}

            {jobId && (
              <p className="job-id">
                Job ID: <code>{jobId}</code>
              </p>
            )}

            {jobStatus.status === 'COMPLETED' && (
              <div className="success-info">
                <p>✓ {audioSegments.length} audio segments generated</p>
                <button onClick={handleReset} className="reset-btn">
                  Translate Another Video
                </button>
              </div>
            )}

            {jobStatus.status === 'FAILED' && (
              <button onClick={handleReset} className="reset-btn">
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Video Player */}
        {videoId && jobStatus?.status === 'COMPLETED' && audioSegments.length > 0 && (
          <div className="player-section">
            <h2>Translated Video</h2>
            <VideoPlayer videoId={videoId} audioSegments={audioSegments} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoTranslator;