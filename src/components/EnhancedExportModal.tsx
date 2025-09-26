import React, { useState, useRef, useEffect } from 'react';
import { X, Download, FileImage, FileText, Share2, Loader } from 'lucide-react';
import EnhancedExportService, {
  ExportFormat,
  ExportOptions,
  ExportQuality,
  ExportProgress,
  SocialMediaPlatform
} from '../services/enhancedExportService';
import Konva from 'konva';

interface EnhancedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage?: Konva.Stage | null;
  element?: HTMLElement | null;
  title?: string;
  description?: string;
}

const EnhancedExportModal: React.FC<EnhancedExportModalProps> = ({
  isOpen,
  onClose,
  stage,
  element,
  title = 'Mood Board',
  description
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [selectedQuality, setSelectedQuality] = useState<ExportQuality>('standard');
  const [selectedSocialMedia, setSelectedSocialMedia] = useState<SocialMediaPlatform | null>(null);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [authorName, setAuthorName] = useState('');

  const exportServiceRef = useRef<EnhancedExportService | null>(null);

  useEffect(() => {
    exportServiceRef.current = new EnhancedExportService((progress) => {
      setExportProgress(progress);
    });

    return () => {
      exportServiceRef.current?.cancelExport();
    };
  }, []);

  if (!isOpen) return null;

  const formats: { value: ExportFormat; label: string; icon: React.ReactElement; description: string }[] = [
    {
      value: 'png',
      label: 'PNG',
      icon: <FileImage className="w-5 h-5" />,
      description: 'High quality, transparent background'
    },
    {
      value: 'jpeg',
      label: 'JPEG',
      icon: <FileImage className="w-5 h-5" />,
      description: 'Smaller file size, no transparency'
    },
    {
      value: 'webp',
      label: 'WebP',
      icon: <FileImage className="w-5 h-5" />,
      description: 'Modern format, best compression'
    },
    {
      value: 'pdf',
      label: 'PDF',
      icon: <FileText className="w-5 h-5" />,
      description: 'Document format, printable'
    },
    {
      value: 'json',
      label: 'JSON',
      icon: <FileText className="w-5 h-5" />,
      description: 'Data only, re-importable'
    }
  ];

  const qualities: { value: ExportQuality; label: string; description: string }[] = [
    { value: 'high', label: 'High Quality', description: '2x resolution, larger file' },
    { value: 'standard', label: 'Standard', description: 'Balanced quality and size' },
    { value: 'compressed', label: 'Compressed', description: 'Smaller file, reduced quality' }
  ];

  const socialMediaPlatforms: { value: SocialMediaPlatform; label: string; dimensions: string }[] = [
    { value: 'instagram-post', label: 'Instagram Post', dimensions: '1080x1080' },
    { value: 'instagram-story', label: 'Instagram Story', dimensions: '1080x1920' },
    { value: 'pinterest', label: 'Pinterest Pin', dimensions: '1000x1500' },
    { value: 'facebook', label: 'Facebook Post', dimensions: '1200x630' },
    { value: 'twitter', label: 'Twitter Post', dimensions: '1200x675' },
    { value: 'linkedin', label: 'LinkedIn Post', dimensions: '1200x627' }
  ];

  const handleExport = async () => {
    if (!exportServiceRef.current || (!stage && !element)) return;

    setIsExporting(true);
    setExportProgress(null);

    const options: ExportOptions = {
      format: selectedFormat,
      quality: selectedQuality,
      socialMedia: selectedSocialMedia || undefined,
      metadata: includeMetadata ? {
        title,
        description,
        author: authorName || undefined,
        date: new Date()
      } : undefined
    };

    try {
      let result;
      if (stage) {
        result = await exportServiceRef.current.exportFromStage(stage, options);
      } else if (element) {
        result = await exportServiceRef.current.exportFromElement(element, options);
      }

      if (result?.success) {
        setTimeout(() => {
          setIsExporting(false);
          setExportProgress(null);
        }, 1000);
      }
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  const cancelExport = () => {
    exportServiceRef.current?.cancelExport();
    setIsExporting(false);
    setExportProgress(null);
  };

  // Check WebP support
  const isWebPSupported = EnhancedExportService.isFormatSupported('webp');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Download className="w-6 h-6" />
            Export Options
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isExporting}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Export Format</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {formats.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value)}
                  disabled={isExporting || (format.value === 'webp' && !isWebPSupported)}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-left
                    ${selectedFormat === format.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                    ${(format.value === 'webp' && !isWebPSupported) ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isExporting ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {format.icon}
                    <span className="font-medium text-gray-900 dark:text-white">{format.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{format.description}</p>
                  {format.value === 'webp' && !isWebPSupported && (
                    <p className="text-xs text-red-500 mt-1">Not supported in this browser</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Selection (not for JSON) */}
          {selectedFormat !== 'json' && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Quality</h3>
              <div className="grid grid-cols-3 gap-3">
                {qualities.map((quality) => (
                  <button
                    key={quality.value}
                    onClick={() => setSelectedQuality(quality.value)}
                    disabled={isExporting}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${selectedQuality === quality.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }
                      ${isExporting ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="font-medium text-gray-900 dark:text-white mb-1">{quality.label}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{quality.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Social Media Templates (for image formats) */}
          {(selectedFormat === 'png' || selectedFormat === 'jpeg' || selectedFormat === 'webp') && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Social Media Templates (Optional)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {socialMediaPlatforms.map((platform) => (
                  <button
                    key={platform.value}
                    onClick={() => setSelectedSocialMedia(
                      selectedSocialMedia === platform.value ? null : platform.value
                    )}
                    disabled={isExporting}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left
                      ${selectedSocialMedia === platform.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }
                      ${isExporting ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{platform.label}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{platform.dimensions}</p>
                  </button>
                ))}
              </div>
              {selectedSocialMedia && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  Image will be resized to fit {socialMediaPlatforms.find(p => p.value === selectedSocialMedia)?.dimensions}
                </p>
              )}
            </div>
          )}

          {/* Metadata Options */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Metadata</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  disabled={isExporting}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">Include metadata in export</span>
              </label>

              {includeMetadata && (
                <input
                  type="text"
                  placeholder="Author name (optional)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  disabled={isExporting}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          {/* Export Progress */}
          {exportProgress && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {exportProgress.message}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {exportProgress.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress.progress}%` }}
                />
              </div>
              {exportProgress.details && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{exportProgress.details}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
              rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={isExporting ? cancelExport : handleExport}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
              ${isExporting
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
            `}
          >
            {isExporting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Cancel Export
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedExportModal;