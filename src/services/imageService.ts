// Image Service for fetching and managing images from Unsplash
export interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
  color: string;
  width: number;
  height: number;
  user: {
    name: string;
    username: string;
  };
}

export interface ImageSearchResult {
  images: UnsplashImage[];
  total: number;
  total_pages: number;
}

class ImageService {
  private accessKey: string;

  constructor(accessKey: string) {
    this.accessKey = accessKey;
  }

  /**
   * Search for images on Unsplash
   */
  async searchImages(query: string, perPage: number = 10): Promise<UnsplashImage[]> {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${this.accessKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.statusText}`);
      }

      const data = await response.json();
      // Unsplash API returns results in a 'results' field
      return data.results || [];
    } catch (error) {
      console.error('Error fetching images:', error);
      return this.getFallbackImages();
    }
  }

  /**
   * Get curated images for specific styles
   */
  async getCuratedImages(style: string, count: number = 8): Promise<UnsplashImage[]> {
    const queries = [
      `${style} interior design`,
      `${style} home decor`,
      `${style} room design`,
      `${style} modern space`
    ];

    const allImages: UnsplashImage[] = [];
    
    for (const query of queries) {
      const images = await this.searchImages(query, Math.ceil(count / queries.length));
      allImages.push(...images);
    }

    // Remove duplicates and return requested count
    const uniqueImages = this.removeDuplicates(allImages);
    return uniqueImages.slice(0, count);
  }

  /**
   * Download image and convert to blob
   */
  async downloadImage(url: string): Promise<Blob> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  /**
   * Create image element from blob
   */
  async createImageElement(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Remove duplicate images based on ID
   */
  private removeDuplicates(images: UnsplashImage[]): UnsplashImage[] {
    const seen = new Set();
    return images.filter(img => {
      if (seen.has(img.id)) {
        return false;
      }
      seen.add(img.id);
      return true;
    });
  }

  /**
   * Fallback images for demo purposes
   */
  private getFallbackImages(): UnsplashImage[] {
    return [
      {
        id: 'fallback-1',
        urls: {
          small: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
          regular: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1080',
          full: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920'
        },
        alt_description: 'Modern minimalist living room',
        color: '#f8f9fa',
        width: 1920,
        height: 1080,
        user: {
          name: 'Demo User',
          username: 'demo'
        }
      },
      {
        id: 'fallback-2',
        urls: {
          small: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400',
          regular: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1080',
          full: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920'
        },
        alt_description: 'Cozy bedroom design',
        color: '#e9ecef',
        width: 1920,
        height: 1080,
        user: {
          name: 'Demo User',
          username: 'demo'
        }
      }
    ];
  }
}

export default ImageService;




