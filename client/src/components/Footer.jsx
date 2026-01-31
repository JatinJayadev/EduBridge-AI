import React from 'react';
import { Globe, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: '#111827', padding: '4rem 0', color: 'white' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '0.5rem',
            borderRadius: '10px'
          }}>
            <Globe color="white" size={24} />
          </div>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            letterSpacing: '-0.02em'
          }}>
            GlobalLearn AI
          </span>
        </div>

        <p style={{
          color: '#9CA3AF',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Breaking language barriers in education, one video at a time.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem' }}>
          {[Twitter, Linkedin, Github].map((Icon, i) => (
            <a key={i} href="#" style={{ 
              color: '#9CA3AF', 
              transition: 'color 0.2s' 
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
            >
              <Icon size={24} />
            </a>
          ))}
        </div>

        <div style={{ 
          borderTop: '1px solid #374151', 
          width: '100%', 
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'center',
          color: '#6B7280',
          fontSize: '0.875rem'
        }}>
          © 2026 GlobalLearn AI. Empowering global education through AI.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
