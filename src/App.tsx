import React, { useState } from 'react';
import './App.css';
import PinterestMoodBoard from './PinterestMoodBoard';
import CanvasMoodBoard from './CanvasMoodBoard';

function App() {
  const [mode, setMode] = useState<'gallery' | 'canvas'>('gallery');

  return (
    <div>
      {/* Mode Switcher */}
      <div style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        zIndex: 100,
        display: 'flex',
        gap: '0.5rem',
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        padding: '0.375rem',
        borderRadius: '0.5rem',
        backdropFilter: 'blur(10px)'
      }}>
        <button
          onClick={() => setMode('gallery')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: mode === 'gallery' ? '#3b82f6' : 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          📌 Gallery Mode
        </button>
        <button
          onClick={() => setMode('canvas')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: mode === 'canvas' ? '#3b82f6' : 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          🎨 Canvas Mode
        </button>
      </div>

      {/* Render selected mode */}
      {mode === 'gallery' ? <PinterestMoodBoard /> : <CanvasMoodBoard />}
    </div>
  );
}

export default App;