import React from 'react';
import { Globe2, BrainCircuit, Zap, Users, ShieldCheck, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Globe2,
    title: '100+ Languages',
    description: 'Access content in over 100 languages, from major world languages to regional dialects'
  },
  {
    icon: BrainCircuit,
    title: 'AI-Powered Intelligence',
    description: 'Advanced neural networks ensure accurate transcription and natural translation'
  },
  {
    icon: Zap,
    title: 'Fast Processing',
    description: 'Get your localized videos in minutes, not hours, with optimized AI pipelines'
  },
  {
    icon: Users,
    title: 'Inclusive Learning',
    description: 'Break down language barriers and make education accessible to everyone'
  },
  {
    icon: ShieldCheck,
    title: 'Quality Assured',
    description: 'Context-aware translation maintains accuracy and preserves educational value'
  },
  {
    icon: Sparkles,
    title: 'Natural Voices',
    description: 'State-of-the-art voice synthesis creates authentic, engaging narration'
  }
];

const Features = () => {
  return (
    <section style={{ padding: '6rem 0' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem'
        }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <Icon size={24} color="white" />
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: 'var(--text-main)'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
