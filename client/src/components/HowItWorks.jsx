import React from 'react';
import { Volume2, Languages, Wand2, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: Volume2,
    title: 'Transcribe',
    description: 'Advanced AI extracts and transcribes the original audio with high accuracy'
  },
  {
    icon: Languages,
    title: 'Translate',
    description: 'Context-aware translation maintains meaning and nuance across languages'
  },
  {
    icon: Wand2,
    title: 'Synthesize',
    description: 'Natural voice synthesis creates authentic-sounding narration in the target language'
  },
  {
    icon: CheckCircle2,
    title: 'Deliver',
    description: 'Perfectly synchronized audio seamlessly overlays the original video'
  }
];

const HowItWorks = () => {
  return (
    <section style={{ padding: '6rem 0', background: 'white' }}>
      <div className="container">
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '1rem',
          color: '#111827'
        }}>
          How It Works
        </h2>
        <p style={{
          textAlign: 'center',
          fontSize: '1.25rem',
          color: '#4B5563',
          marginBottom: '5rem',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Four powerful AI steps transform any educational video into an accessible learning experience in your language
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
          position: 'relative'
        }}>
          {/* Connecting Line */}
          <div style={{
            position: 'absolute',
            top: '40px',
            left: 'calc(12.5% + 20px)',
            right: 'calc(12.5% + 20px)',
            height: '2px',
            background: '#E5E7EB',
            zIndex: 0
          }} />

          {steps.map((step, index) => {
            const Icon = step.icon;
            
            // Step colors based on the image: Blue, Pink, Orange, Green
            const colors = [
              '#0EA5E9', // Blue
              '#E879F9', // Pink (approx)
              '#F97316', // Orange
              '#22C55E'  // Green
            ];
            const color = colors[index];
            const bgGradient = `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;

            return (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: bgGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  position: 'relative'
                }}>
                   {/* Number Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '28px',
                    height: '28px',
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.875rem',
                    color: '#111827',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {index + 1}
                  </div>
                  <Icon size={36} color="white" />
                </div>
                
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem',
                  color: '#111827'
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#6B7280',
                  lineHeight: '1.5'
                }}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
