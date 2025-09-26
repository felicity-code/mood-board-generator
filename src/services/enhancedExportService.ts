import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Konva from 'konva';

// ==================== INTERFACES ====================

export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'pdf' | 'json';
export type ExportQuality = 'high' | 'standard' | 'compressed';
export type SocialMediaPlatform = 'instagram-post' | 'instagram-story' | 'pinterest' | 'facebook' | 'twitter' | 'linkedin';

export interface ExportDimensions {
  width: number;
  height: number;
  maintainAspectRatio?: boolean;
}

export interface ExportMetadata {
  title?: string;
  description?: string;
  author?: string;
  date?: Date;
  tags?: string[];
}

export interface ExportOptions {
  format: ExportFormat;
  quality?: ExportQuality;
  dimensions?: ExportDimensions;
  socialMedia?: SocialMediaPlatform;
  metadata?: ExportMetadata;
  backgroundColor?: string;
  padding?: number;
  watermark?: boolean;
}

export interface ExportProgress {
  stage: 'preparing' | 'processing' | 'encoding' | 'downloading' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  details?: string;
}

export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  size?: number;
  dimensions?: ExportDimensions;
  url?: string;
  error?: string;
}

// ==================== SOCIAL MEDIA DIMENSIONS ====================

const SOCIAL_MEDIA_DIMENSIONS: Record<SocialMediaPlatform, ExportDimensions> = {
  'instagram-post': { width: 1080, height: 1080 },
  'instagram-story': { width: 1080, height: 1920 },
  'pinterest': { width: 1000, height: 1500 },
  'facebook': { width: 1200, height: 630 },
  'twitter': { width: 1200, height: 675 },
  'linkedin': { width: 1200, height: 627 }
};

// ==================== QUALITY SETTINGS ====================

const QUALITY_SETTINGS = {
  high: {
    scale: 2,
    jpegQuality: 0.95,
    pngQuality: 1,
    pdfCompression: false
  },
  standard: {
    scale: 1.5,
    jpegQuality: 0.85,
    pngQuality: 0.9,
    pdfCompression: true
  },
  compressed: {
    scale: 1,
    jpegQuality: 0.7,
    pngQuality: 0.8,
    pdfCompression: true
  }
};

// ==================== MAIN EXPORT SERVICE ====================

export class EnhancedExportService {
  private progressCallback?: (progress: ExportProgress) => void;
  private abortController?: AbortController;

  constructor(progressCallback?: (progress: ExportProgress) => void) {
    this.progressCallback = progressCallback;
  }

  // ========== Public Methods ==========

  /**
   * Export from Konva Stage
   */
  async exportFromStage(
    stage: Konva.Stage,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      this.abortController = new AbortController();
      this.updateProgress('preparing', 10, 'Preparing export...');

      // Apply social media dimensions if specified
      if (options.socialMedia) {
        options.dimensions = SOCIAL_MEDIA_DIMENSIONS[options.socialMedia];
      }

      // Get quality settings
      const quality = options.quality || 'standard';
      const qualitySettings = QUALITY_SETTINGS[quality];

      // Export based on format
      switch (options.format) {
        case 'png':
          return await this.exportStageToPNG(stage, options, qualitySettings);

        case 'jpeg':
          return await this.exportStageToJPEG(stage, options, qualitySettings);

        case 'webp':
          return await this.exportStageToWebP(stage, options, qualitySettings);

        case 'pdf':
          return await this.exportStageToPDF(stage, options, qualitySettings);

        case 'json':
          return await this.exportStageToJSON(stage, options);

        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }
    } catch (error) {
      this.updateProgress('error', 0, 'Export failed', error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        format: options.format,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Export from HTML Element
   */
  async exportFromElement(
    element: HTMLElement,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      this.abortController = new AbortController();
      this.updateProgress('preparing', 10, 'Preparing export...');

      const quality = options.quality || 'standard';
      const qualitySettings = QUALITY_SETTINGS[quality];

      // Capture element as canvas
      const canvas = await html2canvas(element, {
        scale: qualitySettings.scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: options.backgroundColor || '#ffffff',
        logging: false
      });

      // Export based on format
      switch (options.format) {
        case 'png':
        case 'jpeg':
        case 'webp':
          return await this.exportCanvasToImage(canvas, options, qualitySettings);

        case 'pdf':
          return await this.exportCanvasToPDF(canvas, options, qualitySettings);

        default:
          throw new Error(`Unsupported format for element export: ${options.format}`);
      }
    } catch (error) {
      this.updateProgress('error', 0, 'Export failed', error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        format: options.format,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Cancel ongoing export
   */
  cancelExport(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.updateProgress('error', 0, 'Export cancelled', 'Export was cancelled by user');
    }
  }

  // ========== Private Methods - Stage Exports ==========

  private async exportStageToPNG(
    stage: Konva.Stage,
    options: ExportOptions,
    qualitySettings: any
  ): Promise<ExportResult> {
    this.updateProgress('processing', 30, 'Generating PNG...');

    const config: any = {
      pixelRatio: qualitySettings.scale,
      mimeType: 'image/png',
      quality: qualitySettings.pngQuality
    };

    // Apply dimensions if specified
    if (options.dimensions) {
      config.width = options.dimensions.width;
      config.height = options.dimensions.height;
    }

    const dataURL = stage.toDataURL(config);

    this.updateProgress('encoding', 60, 'Encoding PNG...');
    const blob = await this.dataURLToBlob(dataURL);

    this.updateProgress('downloading', 90, 'Saving PNG...');
    const filename = this.generateFilename(options.metadata?.title, 'png');
    saveAs(blob, filename);

    this.updateProgress('complete', 100, 'PNG export complete');

    return {
      success: true,
      format: 'png',
      size: blob.size,
      dimensions: options.dimensions || {
        width: stage.width(),
        height: stage.height()
      }
    };
  }

  private async exportStageToJPEG(
    stage: Konva.Stage,
    options: ExportOptions,
    qualitySettings: any
  ): Promise<ExportResult> {
    this.updateProgress('processing', 30, 'Generating JPEG...');

    const config: any = {
      pixelRatio: qualitySettings.scale,
      mimeType: 'image/jpeg',
      quality: qualitySettings.jpegQuality
    };

    if (options.dimensions) {
      config.width = options.dimensions.width;
      config.height = options.dimensions.height;
    }

    const dataURL = stage.toDataURL(config);

    this.updateProgress('encoding', 60, 'Encoding JPEG...');
    const blob = await this.dataURLToBlob(dataURL);

    this.updateProgress('downloading', 90, 'Saving JPEG...');
    const filename = this.generateFilename(options.metadata?.title, 'jpg');
    saveAs(blob, filename);

    this.updateProgress('complete', 100, 'JPEG export complete');

    return {
      success: true,
      format: 'jpeg',
      size: blob.size,
      dimensions: options.dimensions || {
        width: stage.width(),
        height: stage.height()
      }
    };
  }

  private async exportStageToWebP(
    stage: Konva.Stage,
    options: ExportOptions,
    qualitySettings: any
  ): Promise<ExportResult> {
    this.updateProgress('processing', 30, 'Generating WebP...');

    const config: any = {
      pixelRatio: qualitySettings.scale,
      mimeType: 'image/webp',
      quality: qualitySettings.jpegQuality
    };

    if (options.dimensions) {
      config.width = options.dimensions.width;
      config.height = options.dimensions.height;
    }

    const dataURL = stage.toDataURL(config);

    this.updateProgress('encoding', 60, 'Encoding WebP...');
    const blob = await this.dataURLToBlob(dataURL);

    this.updateProgress('downloading', 90, 'Saving WebP...');
    const filename = this.generateFilename(options.metadata?.title, 'webp');
    saveAs(blob, filename);

    this.updateProgress('complete', 100, 'WebP export complete');

    return {
      success: true,
      format: 'webp',
      size: blob.size,
      dimensions: options.dimensions || {
        width: stage.width(),
        height: stage.height()
      }
    };
  }

  private async exportStageToPDF(
    stage: Konva.Stage,
    options: ExportOptions,
    qualitySettings: any
  ): Promise<ExportResult> {
    this.updateProgress('processing', 30, 'Generating PDF...');

    // Get stage as image
    const dataURL = stage.toDataURL({
      pixelRatio: qualitySettings.scale,
      mimeType: 'image/jpeg',
      quality: qualitySettings.jpegQuality
    });

    this.updateProgress('encoding', 50, 'Creating PDF document...');

    // Calculate PDF dimensions
    const stageWidth = options.dimensions?.width || stage.width();
    const stageHeight = options.dimensions?.height || stage.height();

    // Create PDF with appropriate orientation
    const orientation = stageWidth > stageHeight ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: [stageWidth, stageHeight],
      compress: qualitySettings.pdfCompression
    });

    // Add metadata
    if (options.metadata) {
      pdf.setProperties({
        title: options.metadata.title || 'Mood Board',
        author: options.metadata.author || 'Mood Board Generator',
        creator: 'Mood Board Generator App'
      });
    }

    // Add image to PDF
    this.updateProgress('encoding', 70, 'Adding image to PDF...');
    pdf.addImage(dataURL, 'JPEG', 0, 0, stageWidth, stageHeight);

    // Add metadata page if requested
    if (options.metadata?.description) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Description', 20, 30);
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(options.metadata.description, stageWidth - 40);
      pdf.text(lines, 20, 50);
    }

    this.updateProgress('downloading', 90, 'Saving PDF...');
    const filename = this.generateFilename(options.metadata?.title, 'pdf');
    pdf.save(filename);

    this.updateProgress('complete', 100, 'PDF export complete');

    return {
      success: true,
      format: 'pdf',
      dimensions: {
        width: stageWidth,
        height: stageHeight
      }
    };
  }

  private async exportStageToJSON(
    stage: Konva.Stage,
    options: ExportOptions
  ): Promise<ExportResult> {
    this.updateProgress('processing', 30, 'Generating JSON...');

    const stageData = stage.toJSON();
    const exportData = {
      version: '1.0.0',
      metadata: options.metadata,
      stage: stageData,
      exportDate: new Date().toISOString()
    };

    this.updateProgress('encoding', 60, 'Encoding JSON...');
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    this.updateProgress('downloading', 90, 'Saving JSON...');
    const filename = this.generateFilename(options.metadata?.title, 'json');
    saveAs(blob, filename);

    this.updateProgress('complete', 100, 'JSON export complete');

    return {
      success: true,
      format: 'json',
      size: blob.size
    };
  }

  // ========== Private Methods - Canvas Exports ==========

  private async exportCanvasToImage(
    canvas: HTMLCanvasElement,
    options: ExportOptions,
    qualitySettings: any
  ): Promise<ExportResult> {
    this.updateProgress('encoding', 60, `Encoding ${options.format.toUpperCase()}...`);

    const mimeType = `image/${options.format}`;
    const quality = options.format === 'png' ? qualitySettings.pngQuality : qualitySettings.jpegQuality;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        mimeType,
        quality
      );
    });

    this.updateProgress('downloading', 90, `Saving ${options.format.toUpperCase()}...`);
    const filename = this.generateFilename(options.metadata?.title, options.format);
    saveAs(blob, filename);

    this.updateProgress('complete', 100, `${options.format.toUpperCase()} export complete`);

    return {
      success: true,
      format: options.format,
      size: blob.size,
      dimensions: {
        width: canvas.width,
        height: canvas.height
      }
    };
  }

  private async exportCanvasToPDF(
    canvas: HTMLCanvasElement,
    options: ExportOptions,
    qualitySettings: any
  ): Promise<ExportResult> {
    this.updateProgress('encoding', 50, 'Creating PDF document...');

    const imgData = canvas.toDataURL('image/jpeg', qualitySettings.jpegQuality);

    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
      compress: qualitySettings.pdfCompression
    });

    if (options.metadata) {
      pdf.setProperties({
        title: options.metadata.title || 'Export',
        author: options.metadata.author || 'Mood Board Generator'
      });
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);

    this.updateProgress('downloading', 90, 'Saving PDF...');
    const filename = this.generateFilename(options.metadata?.title, 'pdf');
    pdf.save(filename);

    this.updateProgress('complete', 100, 'PDF export complete');

    return {
      success: true,
      format: 'pdf',
      dimensions: {
        width: canvas.width,
        height: canvas.height
      }
    };
  }

  // ========== Utility Methods ==========

  private updateProgress(
    stage: ExportProgress['stage'],
    progress: number,
    message: string,
    details?: string
  ): void {
    if (this.progressCallback) {
      this.progressCallback({
        stage,
        progress,
        message,
        details
      });
    }
  }

  private async dataURLToBlob(dataURL: string): Promise<Blob> {
    const response = await fetch(dataURL);
    return response.blob();
  }

  private generateFilename(title?: string, extension?: string): string {
    const baseTitle = title || 'mood-board';
    const sanitized = baseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = new Date().toISOString().split('T')[0];
    return `${sanitized}-${timestamp}.${extension || 'png'}`;
  }

  /**
   * Get file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Check if export format is supported by browser
   */
  static isFormatSupported(format: ExportFormat): boolean {
    if (format === 'webp') {
      // Check WebP support
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const dataURL = canvas.toDataURL('image/webp');
      return dataURL.indexOf('data:image/webp') === 0;
    }
    return true;
  }
}

export default EnhancedExportService;