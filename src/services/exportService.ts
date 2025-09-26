import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { GoogleImage } from './googleImagesService';

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'pdf';
  quality: 'high' | 'standard' | 'compressed';
  dimensions: 'original' | 'instagram' | 'pinterest' | 'custom';
  customWidth?: number;
  customHeight?: number;
}

export interface ExportProgress {
  stage: 'preparing' | 'rendering' | 'processing' | 'downloading' | 'complete';
  progress: number; // 0-100
  message: string;
}

class ExportService {
  private progressCallback?: (progress: ExportProgress) => void;

  constructor(progressCallback?: (progress: ExportProgress) => void) {
    this.progressCallback = progressCallback;
  }

  /**
   * Export mood board as PNG image
   */
  async exportAsPNG(
    images: GoogleImage[],
    title: string,
    options: ExportOptions
  ): Promise<void> {
    this.updateProgress('preparing', 10, 'Preparing PNG export...');

    try {
      // Create a temporary container for the mood board
      const container = await this.createMoodBoardContainer(images, title, options);
      
      this.updateProgress('rendering', 30, 'Rendering images...');
      
      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: this.getScaleValue(options.quality),
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      this.updateProgress('processing', 70, 'Processing image...');

      // Convert canvas to PNG blob
      const blob = await this.canvasToBlob(canvas, 'image/png');
      
      this.updateProgress('downloading', 90, 'Downloading PNG...');

      // Download the file
      this.downloadBlob(blob, `${title.replace(/[^a-zA-Z0-9]/g, '_')}_mood_board.png`);

      // Cleanup
      document.body.removeChild(container);
      
      this.updateProgress('complete', 100, 'PNG export complete!');

    } catch (error) {
      console.error('PNG export error:', error);
      throw new Error('Failed to export PNG: ' + (error as Error).message);
    }
  }

  /**
   * Export mood board as JPEG image
   */
  async exportAsJPEG(
    images: GoogleImage[],
    title: string,
    options: ExportOptions
  ): Promise<void> {
    this.updateProgress('preparing', 10, 'Preparing JPEG export...');

    try {
      // Create a temporary container for the mood board
      const container = await this.createMoodBoardContainer(images, title, options);
      
      this.updateProgress('rendering', 30, 'Rendering images...');
      
      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: this.getScaleValue(options.quality),
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      this.updateProgress('processing', 70, 'Processing image...');

      // Convert canvas to JPEG blob
      const blob = await this.canvasToBlob(canvas, 'image/jpeg', 0.9);
      
      this.updateProgress('downloading', 90, 'Downloading JPEG...');

      // Download the file
      this.downloadBlob(blob, `${title.replace(/[^a-zA-Z0-9]/g, '_')}_mood_board.jpg`);

      // Cleanup
      document.body.removeChild(container);
      
      this.updateProgress('complete', 100, 'JPEG export complete!');

    } catch (error) {
      console.error('JPEG export error:', error);
      throw new Error('Failed to export JPEG: ' + (error as Error).message);
    }
  }

  /**
   * Export mood board as PDF document
   */
  async exportAsPDF(
    images: GoogleImage[],
    title: string,
    options: ExportOptions
  ): Promise<void> {
    this.updateProgress('preparing', 10, 'Preparing PDF export...');

    try {
      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: this.getPDFFormat(options.dimensions)
      });

      this.updateProgress('rendering', 30, 'Rendering images...');

      // Add title page
      pdf.setFontSize(24);
      pdf.text(title, 20, 30);
      pdf.setFontSize(12);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 40);
      pdf.text(`Images: ${images.length}`, 20, 50);

      // Add images to PDF
      const imagesPerPage = 6;
      const totalPages = Math.ceil(images.length / imagesPerPage);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const startIndex = page * imagesPerPage;
        const endIndex = Math.min(startIndex + imagesPerPage, images.length);
        const pageImages = images.slice(startIndex, endIndex);

        this.updateProgress('processing', 50 + (page / totalPages) * 30, `Processing page ${page + 1}...`);

        // Add images to current page
        await this.addImagesToPDFPage(pdf, pageImages, page + 1, totalPages);
      }

      this.updateProgress('downloading', 90, 'Generating PDF...');

      // Download the PDF
      pdf.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}_mood_board.pdf`);
      
      this.updateProgress('complete', 100, 'PDF export complete!');

    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('Failed to export PDF: ' + (error as Error).message);
    }
  }

  /**
   * Create a temporary container for the mood board
   */
  private async createMoodBoardContainer(
    images: GoogleImage[],
    title: string,
    options: ExportOptions
  ): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.backgroundColor = '#ffffff';
    container.style.padding = '40px';
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    // Set dimensions based on options
    const dimensions = this.getExportDimensions(options);
    container.style.width = `${dimensions.width}px`;
    container.style.height = `${dimensions.height}px`;

    // Add title
    const titleEl = document.createElement('h1');
    titleEl.textContent = title;
    titleEl.style.fontSize = '32px';
    titleEl.style.fontWeight = 'bold';
    titleEl.style.color = '#111827';
    titleEl.style.marginBottom = '20px';
    titleEl.style.textAlign = 'center';
    container.appendChild(titleEl);

    // Create grid for images
    const gridEl = document.createElement('div');
    gridEl.style.display = 'grid';
    gridEl.style.gridTemplateColumns = 'repeat(3, 1fr)';
    gridEl.style.gap = '20px';
    gridEl.style.marginTop = '20px';

    // Add images to grid
    for (const image of images) {
      const imgEl = document.createElement('img');
      imgEl.src = image.url;
      imgEl.alt = image.title;
      imgEl.style.width = '100%';
      imgEl.style.height = 'auto';
      imgEl.style.borderRadius = '8px';
      imgEl.style.objectFit = 'cover';
      imgEl.style.aspectRatio = '4/3';

      // Wait for image to load
      await new Promise((resolve) => {
        imgEl.onload = resolve;
        imgEl.onerror = resolve; // Continue even if image fails to load
      });

      gridEl.appendChild(imgEl);
    }

    container.appendChild(gridEl);
    document.body.appendChild(container);

    return container;
  }

  /**
   * Add images to a PDF page
   */
  private async addImagesToPDFPage(
    pdf: jsPDF,
    images: GoogleImage[],
    pageNumber: number,
    totalPages: number
  ): Promise<void> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const imageWidth = (pageWidth - 3 * margin) / 2;
    const imageHeight = imageWidth * 0.75; // 4:3 aspect ratio

    // Add page number
    pdf.setFontSize(10);
    pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 30, pageHeight - 10);

    // Add images in 2x3 grid
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const row = Math.floor(i / 2);
      const col = i % 2;
      
      const x = margin + col * (imageWidth + margin);
      const y = margin + row * (imageHeight + margin);

      try {
        // Convert image to base64
        const base64 = await this.imageToBase64(image.url);
        
        // Add image to PDF
        pdf.addImage(base64, 'JPEG', x, y, imageWidth, imageHeight);
        
        // Add image title
        pdf.setFontSize(8);
        pdf.text(image.title.substring(0, 30), x, y + imageHeight + 5);
        
      } catch (error) {
        console.warn(`Failed to add image ${image.title} to PDF:`, error);
        // Add placeholder text
        pdf.setFontSize(10);
        pdf.text(`Image ${i + 1}`, x, y + imageHeight / 2);
      }
    }
  }

  /**
   * Convert image URL to base64
   */
  private async imageToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx?.drawImage(img, 0, 0);
        
        try {
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }

  /**
   * Convert canvas to blob
   */
  private async canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, type, quality);
    });
  }

  /**
   * Download blob as file
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get quality value for html2canvas
   */
  private getQualityValue(quality: string): number {
    switch (quality) {
      case 'high': return 1;
      case 'standard': return 0.8;
      case 'compressed': return 0.6;
      default: return 0.8;
    }
  }

  /**
   * Get scale value for html2canvas
   */
  private getScaleValue(quality: string): number {
    switch (quality) {
      case 'high': return 2;
      case 'standard': return 1.5;
      case 'compressed': return 1;
      default: return 1.5;
    }
  }

  /**
   * Get PDF format based on dimensions option
   */
  private getPDFFormat(dimensions: string): string {
    switch (dimensions) {
      case 'instagram': return 'a4';
      case 'pinterest': return 'a4';
      case 'custom': return 'a4';
      default: return 'a4';
    }
  }

  /**
   * Get export dimensions
   */
  private getExportDimensions(options: ExportOptions): { width: number; height: number } {
    switch (options.dimensions) {
      case 'instagram':
        return { width: 1080, height: 1080 };
      case 'pinterest':
        return { width: 1000, height: 1500 };
      case 'custom':
        return { 
          width: options.customWidth || 1200, 
          height: options.customHeight || 800 
        };
      default:
        return { width: 1200, height: 800 };
    }
  }

  /**
   * Update progress callback
   */
  private updateProgress(stage: ExportProgress['stage'], progress: number, message: string): void {
    if (this.progressCallback) {
      this.progressCallback({ stage, progress, message });
    }
  }
}

export default ExportService;
