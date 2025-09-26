import React, { useState } from 'react';
import { Download, X, Image, FileText } from 'lucide-react';
import ExportService, { ExportOptions, ExportProgress } from '../services/exportService';
import { GoogleImage } from '../services/googleImagesService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GoogleImage[];
  title: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, images, title }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 'standard',
    dimensions: 'original'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [customWidth, setCustomWidth] = useState(1200);
  const [customHeight, setCustomHeight] = useState(800);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(null);

    try {
      const exportService = new ExportService((progress) => {
        setExportProgress(progress);
      });

      const options = {
        ...exportOptions,
        customWidth: exportOptions.dimensions === 'custom' ? customWidth : undefined,
        customHeight: exportOptions.dimensions === 'custom' ? customHeight : undefined
      };

      switch (exportOptions.format) {
        case 'png':
          await exportService.exportAsPNG(images, title, options);
          break;
        case 'jpeg':
          await exportService.exportAsJPEG(images, title, options);
          break;
        case 'pdf':
          await exportService.exportAsPDF(images, title, options);
          break;
      }

      // Close modal after successful export
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(null);
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(null);
      alert('Export failed: ' + (error as Error).message);
    }
  };

  const getDimensionInfo = (dimensions: string) => {
    switch (dimensions) {
      case 'instagram':
        return '1080×1080 (Square)';
      case 'pinterest':
        return '1000×1500 (Vertical)';
      case 'custom':
        return `${customWidth}×${customHeight} (Custom)`;
      default:
        return '1200×800 (Original)';
    }
  };

  const getQualityInfo = (quality: string) => {
    switch (quality) {
      case 'high':
        return 'High quality, larger file size';
      case 'standard':
        return 'Balanced quality and file size';
      case 'compressed':
        return 'Smaller file size, good quality';
      default:
        return 'Balanced quality and file size';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Export Mood Board</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isExporting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setExportOptions(prev => ({ ...prev, format: 'png' }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  exportOptions.format === 'png'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={isExporting}
              >
                <Image className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">PNG</div>
                <div className="text-xs text-gray-500">High quality</div>
              </button>
              <button
                onClick={() => setExportOptions(prev => ({ ...prev, format: 'jpeg' }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  exportOptions.format === 'jpeg'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={isExporting}
              >
                <Image className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">JPEG</div>
                <div className="text-xs text-gray-500">Compressed</div>
              </button>
              <button
                onClick={() => setExportOptions(prev => ({ ...prev, format: 'pdf' }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  exportOptions.format === 'pdf'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={isExporting}
              >
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">PDF</div>
                <div className="text-xs text-gray-500">Document</div>
              </button>
            </div>
          </div>

          {/* Quality Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quality
            </label>
            <div className="space-y-2">
              {['high', 'standard', 'compressed'].map((quality) => (
                <label key={quality} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="quality"
                    value={quality}
                    checked={exportOptions.quality === quality}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, quality: e.target.value as any }))}
                    className="text-blue-600"
                    disabled={isExporting}
                  />
                  <div className="flex-1">
                    <div className="font-medium capitalize">{quality}</div>
                    <div className="text-sm text-gray-500">{getQualityInfo(quality)}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Dimensions Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dimensions
            </label>
            <div className="space-y-2">
              {[
                { value: 'original', label: 'Original', desc: '1200×800 (Default)' },
                { value: 'instagram', label: 'Instagram', desc: '1080×1080 (Square)' },
                { value: 'pinterest', label: 'Pinterest', desc: '1000×1500 (Vertical)' },
                { value: 'custom', label: 'Custom', desc: 'Set your own size' }
              ].map((dimension) => (
                <label key={dimension.value} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="dimensions"
                    value={dimension.value}
                    checked={exportOptions.dimensions === dimension.value}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, dimensions: e.target.value as any }))}
                    className="text-blue-600"
                    disabled={isExporting}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{dimension.label}</div>
                    <div className="text-sm text-gray-500">{dimension.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Dimensions */}
          {exportOptions.dimensions === 'custom' && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="100"
                    max="4000"
                    disabled={isExporting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="100"
                    max="4000"
                    disabled={isExporting}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Export Progress */}
          {exportProgress && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-blue-900">{exportProgress.message}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress.progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-blue-700 mt-1">{exportProgress.progress}% complete</div>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Export Summary</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Format: <span className="font-medium uppercase">{exportOptions.format}</span></div>
              <div>Quality: <span className="font-medium capitalize">{exportOptions.quality}</span></div>
              <div>Dimensions: <span className="font-medium">{getDimensionInfo(exportOptions.dimensions)}</span></div>
              <div>Images: <span className="font-medium">{images.length}</span></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || images.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export {exportOptions.format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
