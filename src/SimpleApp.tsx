import React, { useState } from 'react';

function SimpleApp(): React.JSX.Element {
  const [prompt, setPrompt] = useState('');
  const [showBoard, setShowBoard] = useState(false);

  const handleGenerate = () => {
    console.log('Generating with prompt:', prompt);
    setShowBoard(true);
  };

  if (!showBoard) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Mood Board Generator
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Describe your ideal space and create a beautiful mood board
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., modern minimalist bedroom with natural light..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              minHeight: '100px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
          <button
            onClick={handleGenerate}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Generate Mood Board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
          Your Mood Board
        </h1>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          minHeight: '500px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Demo image placeholders */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                width: '300px',
                height: '200px',
                backgroundColor: '#e5e7eb',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280'
              }}
            >
              Image {i}
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowBoard(false)}
          style={{
            marginTop: '2rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Create New Board
        </button>
      </div>
    </div>
  );
}

export default SimpleApp;