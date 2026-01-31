import React from 'react';
import { Globe } from 'lucide-react';

const Navbar = () => {
  return (
    <nav style={{
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          padding: '0.5rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Globe color="white" size={24} />
        </div>
        <span style={{
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: '700',
          letterSpacing: '-0.02em'
        }}>
          GlobalLearn AI
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
