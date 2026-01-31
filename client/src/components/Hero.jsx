import React from 'react';
import { Globe, Wand2, Play } from 'lucide-react';

const Hero = () => {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)',
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '80px' // Space for navbar
    }}>
      {/* Background Abstract Shapes - optional decoration */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                YouTube Video URL
              </label>
              <input 
                type="text" 
                placeholder="https://www.youtube.com/watch?v=..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #E5E7EB',
                  background: '#F9FAFB',
                  fontSize: '0.925rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Target Language
              </label>
              <select style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #E5E7EB',
                background: '#F9FAFB',
                fontSize: '0.925rem',
                outline: 'none',
                color: '#4B5563',
                appearance: 'none', // simplifying visual for now
                cursor: 'pointer'
              }}>
                <option>Select a language</option>
                <option>Portuguese (Brazil)</option>
                <option>Spanish (Spain)</option>
                <option>French (France)</option>
                <option>Hindi (India)</option>
              </select>
            </div>

            <button style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '1rem',
              background: '#C084FC', // A lighter purple to match screenshot
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s'
            }}>
              <Play size={20} fill="white" />
              Process Video
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
