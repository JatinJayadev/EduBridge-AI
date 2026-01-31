import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const Story = () => {
  return (
    <section style={{ padding: '6rem 0', overflow: 'hidden' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center'
        }}>
          {/* Left Content */}
          <div>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: 'var(--text-main)',
              lineHeight: '1.2'
            }}>
              Empowering Global Education
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.7',
              marginBottom: '2rem'
            }}>
              EduBridge AI isn't just about translation—it's about creating an inclusive learning experience. Every student deserves access to the world's best educational content, regardless of the language they speak.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { 
                  title: 'Preserve Context & Nuance', 
                  desc: 'Our AI understands educational context to maintain accuracy' 
                },
                { 
                  title: 'Perfect Synchronization', 
                  desc: 'Audio timing matches original speech for seamless learning' 
                },
                { 
                  title: 'Natural Learning Experience', 
                  desc: "Hear, don't just read—learn as if the content was made for you" 
                }
              ].map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{
                    marginTop: '0.25rem',
                    color: '#8B5CF6'
                  }}>
                    <CheckCircle2 size={24} fill="#F3E8FF" /> 
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: 'var(--text-main)',
                      marginBottom: '0.25rem'
                    }}>
                      {item.title}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image Placeholder */}
          <div style={{
            position: 'relative',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            height: '500px'
          }}>
            {/* Using a gradient placeholder that looks like the reference image's warmth */}
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(45deg, #f3f4f6 0%, #e5e7eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
               {/* This is where the classroom image would go. 
                   Using a placeholder text for now. */}
               <img 
                 src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                 alt="Classroom"
                 style={{
                   width: '100%',
                   height: '100%',
                   objectFit: 'cover'
                 }}
               />
            </div>
            
            {/* Decoration blob */}
            <div style={{
              position: 'absolute',
              bottom: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: '#8B5CF6',
              borderRadius: '50%',
              filter: 'blur(80px)',
              opacity: '0.3',
              zIndex: 1
            }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Story;
