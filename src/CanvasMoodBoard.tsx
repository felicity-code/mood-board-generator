import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Text } from 'react-konva';
import Konva from 'konva';
import GoogleImagesService, { GoogleImage } from './services/googleImagesService';
import EnhancedExportModal from './components/EnhancedExportModal';

const imageService = new GoogleImagesService();

interface CanvasImage {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  googleImage: GoogleImage;
}

function CanvasMoodBoard(): React.JSX.Element {
  const [prompt, setPrompt] = useState('');
  const [fetchedImages, setFetchedImages] = useState<GoogleImage[]>([]);
  const [canvasImages, setCanvasImages] = useState<CanvasImage[]>([]);
  const [showBoard, setShowBoard] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // Update transformer when selection changes
  useEffect(() => {
    if (transformerRef.current && layerRef.current) {
      const selectedNode = layerRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const searchQuery = prompt.trim() || selectedCategory || 'interior design';
      console.log('Searching images from multiple sources for:', searchQuery);

      if (prompt.trim()) {
        setSelectedCategory('');
      }

      const fetchedImgs = await imageService.searchImages(searchQuery, 12);
      setFetchedImages(fetchedImgs);
      setShowBoard(true);
    } catch (error) {
      console.error('Error fetching images:', error);
      const fallbackImages = await imageService.searchImages('interior design', 12);
      setFetchedImages(fallbackImages);
      setShowBoard(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    setPrompt('');
    setIsLoading(true);
    try {
      const fetchedImgs = await imageService.getImagesByCategory(category, 12);
      setFetchedImages(fetchedImgs);
      setShowBoard(true);
    } catch (error) {
      console.error('Error fetching category images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addImageToCanvas = async (googleImage: GoogleImage) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvasImage: CanvasImage = {
        id: `canvas-${Date.now()}-${Math.random()}`,
        image: img,
        x: Math.random() * (canvasSize.width - 200),
        y: Math.random() * (canvasSize.height - 200),
        width: 300,
        height: (300 * img.height) / img.width,
        rotation: 0,
        googleImage
      };
      setCanvasImages(prev => [...prev, canvasImage]);
      setShowCanvas(true);
    };

    img.src = googleImage.url;
  };

  const removeImageFromCanvas = (id: string) => {
    setCanvasImages(prev => prev.filter(img => img.id !== id));
    setSelectedId(null);
  };

  const handleDragEnd = (e: any, id: string) => {
    setCanvasImages(prev => prev.map(img => {
      if (img.id === id) {
        return {
          ...img,
          x: e.target.x(),
          y: e.target.y()
        };
      }
      return img;
    }));
  };

  const handleTransformEnd = (e: any, id: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    setCanvasImages(prev => prev.map(img => {
      if (img.id === id) {
        return {
          ...img,
          x: node.x(),
          y: node.y(),
          width: Math.max(5, img.width * scaleX),
          height: Math.max(5, img.height * scaleY),
          rotation: node.rotation()
        };
      }
      return img;
    }));
  };

  const handleOpenExportModal = () => {
    setShowExportModal(true);
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
            <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>🎨</span>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: colors.text,
              transition: 'color 0.3s ease'
            }}>
              Canvas Mood Board Creator
            </h1>
          </div>

          <p style={{
            color: colors.textSecondary,
            marginBottom: '1.5rem',
            fontSize: '1rem'
          }}>
            Create and edit mood boards with full canvas control
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
                Searching Images...
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

      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: colors.text,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>🎨</span>
              Canvas Mood Board Editor
            </h1>
            <p style={{
              color: colors.textSecondary,
              marginTop: '0.5rem'
            }}>
              Drag images to canvas • Resize and rotate • Export your creation
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {showCanvas && (
              <>
                <button
                  onClick={() => setCanvasImages([])}
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
                  🗑️ Clear Canvas
                </button>
                <button
                  onClick={handleOpenExportModal}
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
                  💾 Export Canvas
                </button>
              </>
            )}
            <button
              onClick={() => {
                setShowBoard(false);
                setPrompt('');
                setSelectedCategory('');
                setFetchedImages([]);
                setCanvasImages([]);
                setShowCanvas(false);
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
              ← New Search
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: showCanvas ? '300px 1fr' : '1fr',
          gap: '2rem'
        }}>
          {/* Image Library */}
          <div style={{
            backgroundColor: colors.bgSecondary,
            padding: '1rem',
            borderRadius: '0.75rem',
            height: 'calc(100vh - 200px)',
            overflowY: 'auto',
            border: darkMode ? `1px solid ${colors.border}` : 'none'
          }}>
            <h3 style={{
              color: colors.text,
              marginBottom: '1rem',
              fontSize: '1.125rem',
              fontWeight: '600'
            }}>
              📚 Image Library
            </h3>
            <p style={{
              color: colors.textSecondary,
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              Click images to add to canvas
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '0.75rem'
            }}>
              {fetchedImages.map((image, index) => (
                <div
                  key={image.id || index}
                  onClick={() => addImageToCanvas(image)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    transform: 'scale(1)',
                    transition: 'all 0.2s ease',
                    border: `2px solid transparent`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.border = `2px solid ${colors.primaryBg}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.border = '2px solid transparent';
                  }}
                >
                  <img
                    src={image.thumbnail || image.url}
                    alt={image.title}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover'
                    }}
                  />
                  {image.source && (
                    <div style={{
                      padding: '0.25rem',
                      backgroundColor: colors.cardBg,
                      fontSize: '0.625rem',
                      color: colors.textSecondary,
                      textAlign: 'center'
                    }}>
                      {image.source}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={async () => {
                setIsLoading(true);
                if (selectedCategory) {
                  await handleCategorySelect(selectedCategory);
                } else {
                  await handleGenerate();
                }
              }}
              disabled={isLoading}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: 'transparent',
                color: colors.text,
                border: `2px solid ${colors.border}`,
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.5 : 1
              }}
            >
              {isLoading ? '⏳ Loading...' : '🔄 Load More'}
            </button>
          </div>

          {/* Canvas Area */}
          {showCanvas ? (
            <div style={{
              backgroundColor: colors.bgSecondary,
              padding: '1rem',
              borderRadius: '0.75rem',
              border: darkMode ? `1px solid ${colors.border}` : 'none',
              position: 'relative'
            }}>
              <div style={{
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  color: colors.text,
                  fontSize: '1.125rem',
                  fontWeight: '600'
                }}>
                  🖼️ Canvas Workspace
                </h3>
                {selectedId && (
                  <button
                    onClick={() => removeImageFromCanvas(selectedId)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Delete Selected
                  </button>
                )}
              </div>

              <div style={{
                border: `2px solid ${colors.border}`,
                borderRadius: '0.5rem',
                overflow: 'hidden',
                backgroundColor: 'white'
              }}>
                <Stage
                  width={canvasSize.width}
                  height={canvasSize.height}
                  ref={stageRef}
                  onClick={(e) => {
                    const clickedOnEmpty = e.target === e.target.getStage();
                    if (clickedOnEmpty) {
                      setSelectedId(null);
                    }
                  }}
                >
                  <Layer ref={layerRef}>
                    {/* Grid background */}
                    {Array.from({ length: Math.ceil(canvasSize.width / 50) }).map((_, i) => (
                      <Rect
                        key={`grid-v-${i}`}
                        x={i * 50}
                        y={0}
                        width={1}
                        height={canvasSize.height}
                        fill="#f3f4f6"
                      />
                    ))}
                    {Array.from({ length: Math.ceil(canvasSize.height / 50) }).map((_, i) => (
                      <Rect
                        key={`grid-h-${i}`}
                        x={0}
                        y={i * 50}
                        width={canvasSize.width}
                        height={1}
                        fill="#f3f4f6"
                      />
                    ))}

                    {/* Canvas Images */}
                    {canvasImages.map((canvasImg) => (
                      <KonvaImage
                        key={canvasImg.id}
                        id={canvasImg.id}
                        image={canvasImg.image}
                        x={canvasImg.x}
                        y={canvasImg.y}
                        width={canvasImg.width}
                        height={canvasImg.height}
                        rotation={canvasImg.rotation}
                        draggable
                        onClick={() => setSelectedId(canvasImg.id)}
                        onTap={() => setSelectedId(canvasImg.id)}
                        onDragEnd={(e) => handleDragEnd(e, canvasImg.id)}
                        onTransformEnd={(e) => handleTransformEnd(e, canvasImg.id)}
                      />
                    ))}

                    {/* Transformer */}
                    <Transformer
                      ref={transformerRef}
                      boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 20 || newBox.height < 20) {
                          return oldBox;
                        }
                        return newBox;
                      }}
                      enabledAnchors={[
                        'top-left',
                        'top-center',
                        'top-right',
                        'middle-right',
                        'middle-left',
                        'bottom-left',
                        'bottom-center',
                        'bottom-right'
                      ]}
                    />
                  </Layer>
                </Stage>
              </div>

              {/* Canvas Instructions */}
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: colors.cardBg,
                borderRadius: '0.375rem'
              }}>
                <p style={{
                  color: colors.textSecondary,
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}>
                  <strong>Tips:</strong> Click to select • Drag to move • Pull corners to resize • Rotate with circular handle
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: colors.bgSecondary,
              padding: '3rem',
              borderRadius: '0.75rem',
              border: darkMode ? `1px solid ${colors.border}` : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100vh - 200px)'
            }}>
              <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎨</span>
              <h3 style={{
                color: colors.text,
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Canvas Ready
              </h3>
              <p style={{
                color: colors.textSecondary,
                textAlign: 'center'
              }}>
                Click on images from the library to start building your mood board
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Enhanced Export Modal */}
      <EnhancedExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        stage={showCanvas ? stageRef.current : null}
        title={prompt || selectedCategory || 'Canvas Mood Board'}
        description={`Created with ${canvasImages.length} images`}
      />
    </div>
  );
}

export default CanvasMoodBoard;