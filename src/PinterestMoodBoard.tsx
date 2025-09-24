import React, { useState, useEffect } from 'react';
import RealPinterestService, { PinterestImage } from './services/realPinterestService';
import ExportModal from './components/ExportModal';

const pinterestService = new RealPinterestService();

function PinterestMoodBoard(): React.JSX.Element {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<PinterestImage[]>([]);
  const [showBoard, setShowBoard] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState<PinterestImage | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // Use the custom prompt if provided, otherwise use selected category
      const searchQuery = prompt.trim() || selectedCategory || 'interior design';
      console.log('Searching Pinterest-style images for:', searchQuery);

      // Clear category selection when using custom prompt
      if (prompt.trim()) {
        setSelectedCategory('');
      }

      // Fetch 9 images for a better Pinterest-like grid
      const fetchedImages = await pinterestService.searchImages(searchQuery, 9);
      setImages(fetchedImages);
      setShowBoard(true);
    } catch (error) {
      console.error('Error fetching images:', error);
      // Use fallback images on error
      const fallbackImages = await pinterestService.searchImages('interior design', 9);
      setImages(fallbackImages);
      setShowBoard(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    setPrompt(''); // Clear custom prompt when selecting category
    setIsLoading(true);
    try {
      // Fetch 9 images for better variety
      const fetchedImages = await pinterestService.getImagesByCategory(category, 9);
      setImages(fetchedImages);
      setShowBoard(true);
    } catch (error) {
      console.error('Error fetching category images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const colors = {
    bg: darkMode ? '#0f172a' : '#f9fafb',
    bgSecondary: darkMode ? '#1e293b' : 'white',
    text: darkMode ? '#f1f5f9' : '#111827',
    textSecondary: darkMode ? '#94a3b8' : '#6b7280',
    border: darkMode ? '#334155' : '#d1d5db',
    primaryBg: darkMode ? '#3b82f6' : '#2563eb',
    primaryHover: darkMode ? '#2563eb' : '#1d4ed8',
    cardBg: darkMode ? '#334155' : '#e5e7eb'
  };

  const categories = [
    { id: 'minimal', label: 'Minimalist', emoji: '⚪' },
    { id: 'modern', label: 'Modern', emoji: '🏙️' },
    { id: 'bohemian', label: 'Bohemian', emoji: '🌺' },
    { id: 'scandinavian', label: 'Scandinavian', emoji: '🌲' },
    { id: 'industrial', label: 'Industrial', emoji: '🏭' },
    { id: 'rustic', label: 'Rustic', emoji: '🪵' },
    { id: 'luxury', label: 'Luxury', emoji: '💎' },
    { id: 'vintage', label: 'Vintage', emoji: '📻' }
  ];

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
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <div style={{
          backgroundColor: colors.bgSecondary,
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: darkMode
            ? '0 4px 6px rgba(0, 0, 0, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)'
            : '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          width: '100%',
          border: darkMode ? `1px solid ${colors.border}` : 'none',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>📌</span>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: colors.text,
              transition: 'color 0.3s ease'
            }}>
              Pinterest Mood Board Generator
            </h1>
          </div>

          <p style={{
            color: colors.textSecondary,
            marginBottom: '1.5rem',
            fontSize: '1rem'
          }}>
            Create beautiful mood boards with Pinterest-style images
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: colors.textSecondary,
              marginBottom: '0.5rem'
            }}>
              Choose a style category:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  disabled={isLoading}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: selectedCategory === cat.id ? colors.primaryBg : colors.cardBg,
                    color: selectedCategory === cat.id ? 'white' : colors.text,
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{cat.emoji}</span>
                  <span style={{ fontSize: '0.75rem' }}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: colors.textSecondary,
              marginBottom: '0.5rem'
            }}>
              Or describe your ideal space:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., dark and gloomy, cozy reading nook, modern minimalist..."
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                minHeight: '80px',
                fontSize: '1rem',
                resize: 'vertical',
                backgroundColor: darkMode ? '#0f172a' : 'white',
                color: colors.text,
                transition: 'all 0.3s ease'
              }}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || (!prompt.trim() && !selectedCategory)}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: (prompt.trim() || selectedCategory) && !isLoading
                ? colors.primaryBg
                : colors.border,
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: (prompt.trim() || selectedCategory) && !isLoading
                ? 'pointer'
                : 'not-allowed',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                Fetching Pinterest Images...
              </>
            ) : (
              <>
                Generate Mood Board
                <span>✨</span>
              </>
            )}
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
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: colors.text,
              transition: 'color 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>📌</span>
              Your Pinterest Mood Board
            </h1>
            <p style={{
              color: colors.textSecondary,
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontWeight: '600' }}>Mood:</span>
              {selectedCategory ? (
                <>
                  <span style={{
                    backgroundColor: colors.primaryBg,
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.875rem',
                    textTransform: 'capitalize'
                  }}>
                    {selectedCategory}
                  </span>
                  <span style={{ fontSize: '0.875rem' }}>
                    {categories.find(c => c.id === selectedCategory)?.emoji}
                  </span>
                </>
              ) : (
                prompt || 'Interior Design Inspiration'
              )}
            </p>
          </div>
        </div>

        {/* Pinterest-style grid optimized for 6 images */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          {images.map((image, index) => (
            <div
              key={image.id || index}
              onClick={() => setSelectedImage(image)}
              style={{
                backgroundColor: colors.bgSecondary,
                borderRadius: '0.75rem',
                overflow: 'hidden',
                cursor: 'pointer',
                transform: 'scale(1)',
                transition: 'all 0.3s ease',
                boxShadow: darkMode
                  ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: darkMode ? `1px solid ${colors.border}` : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = darkMode
                  ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                  : '0 8px 24px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = darkMode
                  ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                position: 'relative',
                paddingBottom: '133%', // 4:3 aspect ratio
                backgroundColor: image.color || colors.cardBg
              }}>
                <img
                  src={image.thumbnail || image.url}
                  alt={image.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // Fallback for broken images
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              {image.title && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: colors.bgSecondary
                }}>
                  <p style={{
                    color: colors.text,
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    lineHeight: '1.4'
                  }}>
                    {image.title}
                  </p>
                  {image.description && (
                    <p style={{
                      color: colors.textSecondary,
                      fontSize: '0.75rem',
                      marginTop: '0.25rem'
                    }}>
                      {image.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => {
              setShowBoard(false);
              setPrompt('');
              setSelectedCategory('');
              setImages([]);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: colors.primaryBg,
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ← Create New Board
          </button>
          <button
            onClick={async () => {
              setIsLoading(true);
              // Force refresh with new images
              if (selectedCategory) {
                await handleCategorySelect(selectedCategory);
              } else {
                await handleGenerate();
              }
            }}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: colors.text,
              border: `2px solid ${colors.border}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            {isLoading ? '⏳ Loading...' : '🔄 Refresh Images'}
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: colors.text,
              border: `2px solid ${colors.border}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📥 Export Board
          </button>
        </div>
      </div>

      {/* Image modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '2rem'
          }}
        >
          <img
            src={selectedImage.url}
            alt={selectedImage.title}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '0.5rem'
            }}
          />
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              padding: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        images={images}
        title={prompt || selectedCategory || 'Mood Board'}
      />
    </div>
  );
}

export default PinterestMoodBoard;