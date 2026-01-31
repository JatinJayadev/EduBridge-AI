import React, { useState } from 'react';
import { Globe, Wand2, Play, Loader2 } from 'lucide-react';
import { submitVideo, pollJobStatus, extractYouTubeVideoId } from '../services/api';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

const Hero = ({ onJobStarted }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate YouTube URL
      const videoId = extractYouTubeVideoId(videoUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please enter a valid YouTube link.');
      }

      // Submit video for processing
      const response = await submitVideo(videoUrl, targetLanguage);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to submit video');
      }

      const jobId = response.jobId;

      // Notify parent component with job details
      if (onJobStarted) {
        onJobStarted({
          jobId,
          videoId,
          targetLanguage,
          videoUrl,
        });
      }

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <section style={{
      background: '#313131',
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '80px',
      borderBottom: '3px solid #7c7c7cff'
    }}>

      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Left Content */}
        <div style={{ color: 'white' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '100px',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Wand2 size={16} />
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>AI-Powered Video Localization</span>
          </div>
          
          <h1 style={{
            fontSize: '4rem',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em'
          }}>
            Breaking Barriers in Global Education
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '2.5rem',
            maxWidth: '540px'
          }}>
            Imagine Maria, a brilliant student in Brazil, eager to learn data science from a top English-speaking professor on YouTube. With EduBridge AI, language barriers crumble.
          </p>

          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={20} />
              <span>100+ Languages</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wand2 size={20} />
              <span>Natural Voice Synthesis</span>
            </div>
          </div>
        </div>

        {/* Right Content - The Interaction Card */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          color: '#111827'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '0.5rem'
          }}>
            Transform Any Video into Your Language
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '0.925rem',
            marginBottom: '2rem'
          }}>
            Paste a YouTube link and select your preferred language to get started
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                YouTube Video URL
              </label>
              <input 
                type="text" 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #E5E7EB',
                  background: loading ? '#F3F4F6' : '#F9FAFB',
                  fontSize: '0.925rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  cursor: loading ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => e.target.style.borderColor = '#C084FC'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Target Language
              </label>
              <select 
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #E5E7EB',
                  background: loading ? '#F3F4F6' : '#F9FAFB',
                  fontSize: '0.925rem',
                  outline: 'none',
                  color: '#4B5563',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.region})
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem',
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: '0.5rem',
                color: '#991B1B',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '1rem',
                background: loading ? '#D1D5DB' : '#C084FC',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.background = '#A855F7';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.background = '#C084FC';
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="spin-animation" />
                  Processing...
                </>
              ) : (
                <>
                  <Play size={20} fill="white" />
                  Process Video
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Add spinning animation for loader */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
