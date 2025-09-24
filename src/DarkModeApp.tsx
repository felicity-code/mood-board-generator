import React, { useState, useEffect } from 'react';

function DarkModeApp(): React.JSX.Element {
  const [prompt, setPrompt] = useState('');
  const [showBoard, setShowBoard] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // Save dark mode preference
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const handleGenerate = () => {
    console.log('Generating with prompt:', prompt);
    setShowBoard(true);
  };

  const colors = {
    bg: darkMode ? '#0f172a' : '#f9fafb',
    bgSecondary: darkMode ? '#1e293b' : 'white',
    text: darkMode ? '#f1f5f9' : '#111827',
    textSecondary: darkMode ? '#94a3b8' : '#6b7280',
    border: darkMode ? '#334155' : '#d1d5db',
    primaryBg: darkMode ? '#3b82f6' : '#2563eb',
    primaryHover: darkMode ? '#2563eb' : '#1d4ed8',
    placeholder: darkMode ? '#475569' : '#9ca3af',
    cardBg: darkMode ? '#334155' : '#e5e7eb'
  };

  if (!showBoard) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: 'background-color 0.3s ease'
      }}>
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            padding: '0.5rem',
            backgroundColor: colors.bgSecondary,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1.5rem',
            width: '3rem',
            height: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <div style={{
          backgroundColor: colors.bgSecondary,
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: darkMode
            ? '0 4px 6px rgba(0, 0, 0, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)'
            : '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%',
          border: darkMode ? `1px solid ${colors.border}` : 'none',
          transition: 'all 0.3s ease'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: colors.text,
            transition: 'color 0.3s ease'
          }}>
            🎨 Mood Board Generator
          </h1>
          <p style={{
            color: colors.textSecondary,
            marginBottom: '1.5rem',
            transition: 'color 0.3s ease'
          }}>
            Describe your ideal space and create a beautiful mood board
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., modern minimalist bedroom with natural light..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.375rem',
              minHeight: '100px',
              fontSize: '1rem',
              resize: 'vertical',
              backgroundColor: darkMode ? '#0f172a' : 'white',
              color: colors.text,
              transition: 'all 0.3s ease'
            }}
          />
          <div style={{ marginTop: '1rem' }}>
            <p style={{
              fontSize: '0.875rem',
              color: colors.textSecondary,
              marginBottom: '0.5rem'
            }}>
              Quick prompts:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['modern bedroom', 'cozy living room', 'home office'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: colors.cardBg,
                    color: colors.text,
                    border: 'none',
                    borderRadius: '1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: prompt.trim() ? colors.primaryBg : colors.border,
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: prompt.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              opacity: prompt.trim() ? 1 : 0.5
            }}
          >
            Generate Mood Board ✨
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.bg,
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          padding: '0.5rem',
          backgroundColor: colors.bgSecondary,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '1.5rem',
          width: '3rem',
          height: '3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 10
        }}
        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: colors.text,
            transition: 'color 0.3s ease'
          }}>
            Your Mood Board: "{prompt}"
          </h1>
        </div>

        <div style={{
          backgroundColor: colors.bgSecondary,
          borderRadius: '0.5rem',
          boxShadow: darkMode
            ? '0 4px 6px rgba(0, 0, 0, 0.3)'
            : '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          minHeight: '500px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          border: darkMode ? `1px solid ${colors.border}` : 'none',
          transition: 'all 0.3s ease'
        }}>
          {/* Demo image placeholders with gradient backgrounds */}
          {[
            { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', emoji: '🌅' },
            { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', emoji: '🏠' },
            { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', emoji: '🛋️' },
            { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', emoji: '🪴' },
            { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', emoji: '💡' },
            { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', emoji: '🖼️' }
          ].map((item, i) => (
            <div
              key={i}
              style={{
                height: '200px',
                background: item.bg,
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '3rem',
                cursor: 'pointer',
                transform: 'scale(1)',
                transition: 'transform 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '2rem',
          display: 'flex',
          gap: '1rem'
        }}>
          <button
            onClick={() => setShowBoard(false)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: colors.primaryBg,
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ← Create New Board
          </button>
          <button
            onClick={() => alert('Board exported! (This is a demo)')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: colors.text,
              border: `2px solid ${colors.border}`,
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Export Board 📥
          </button>
        </div>
      </div>
    </div>
  );
}

export default DarkModeApp;