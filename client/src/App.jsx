import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import Story from './components/Story'
import VideoPlayer from './components/VideoPlayer'
import { pollJobStatus } from './services/api'
import { getLanguageDisplayName } from './constants/languages'
import './components/VideoTranslator.css'

const App = () => {
  const [jobData, setJobData] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)
  const [audioSegments, setAudioSegments] = useState([])

  const handleJobStarted = (data) => {
    setJobData(data)
    setJobStatus({ status: 'PENDING', message: 'Job submitted successfully' })

    // Start polling for job status
    pollJobStatus(
      data.jobId,
      (job) => {
        // Update status on each poll
        setJobStatus({
          status: job.status,
          message: getStatusMessage(job.status),
          progress: getProgress(job),
        })

        // If completed, set audio segments
        if (job.status === 'COMPLETED' && job.audioSegments) {
          setAudioSegments(job.audioSegments)
        }
      },
      2000 // Poll every 2 seconds
    )
      .then((completedJob) => {
        setJobStatus({
          status: 'COMPLETED',
          message: 'Translation and audio generation completed!',
        })
        setAudioSegments(completedJob.audioSegments || [])
      })
      .catch((err) => {
        setJobStatus({ 
          status: 'FAILED', 
          message: err.message || 'Processing failed' 
        })
      })
  }

  const getStatusMessage = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Waiting to start...'
      case 'PROCESSING':
        return 'Processing translation and generating audio...'
      case 'COMPLETED':
        return 'Completed successfully!'
      case 'FAILED':
        return 'Processing failed'
      default:
        return 'Unknown status'
    }
  }

  const getProgress = (job) => {
    if (job.status === 'COMPLETED') return 100
    if (job.status === 'PROCESSING') return 50
    if (job.status === 'PENDING') return 10
    return 0
  }

  const handleReset = () => {
    setJobData(null)
    setJobStatus(null)
    setAudioSegments([])
  }

  return (
    <div className="app">
      <Navbar />
      <Hero onJobStarted={handleJobStarted} />

      {/* Job Status Section */}
      {jobStatus && (
        <section style={{
          background: '#f9fafb',
          padding: '3rem 1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
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

              {jobData?.jobId && (
                <p className="job-id">
                  Job ID: <code>{jobData.jobId}</code>
                </p>
              )}

              {jobStatus.status === 'COMPLETED' && audioSegments.length > 0 && (
                <div className="success-info">
                  <p>✓ {audioSegments.length} audio segments generated</p>
                  <p style={{ fontSize: '0.9rem', color: '#6B7280', marginTop: '0.5rem' }}>
                    Scroll down to watch your translated video
                  </p>
                </div>
              )}

              {jobStatus.status === 'FAILED' && (
                <button onClick={handleReset} className="reset-btn">
                  Try Again
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Video Player Section */}
      {jobData && jobStatus?.status === 'COMPLETED' && audioSegments.length > 0 && (
        <section style={{
          background: '#ffffff',
          padding: '4rem 1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '0.5rem'
              }}>
                Your Translated Video
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#6B7280'
              }}>
                Watch your video with AI-generated voiceover in {getLanguageDisplayName(jobData.targetLanguage)}
              </p>
            </div>

            <VideoPlayer 
              videoId={jobData.videoId} 
              audioSegments={audioSegments} 
            />

            <div style={{ 
              marginTop: '2rem', 
              textAlign: 'center' 
            }}>
              <button 
                onClick={handleReset} 
                className="reset-btn"
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1rem'
                }}
              >
                Translate Another Video
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Show other sections only if no job is in progress */}
      {!jobStatus && (
        <>
          <HowItWorks />
          <Story />
          <Features />
        </>
      )}
    </div>
  )
}

export default App
