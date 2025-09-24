// Pinterest-style image service
// Note: Since Pinterest doesn't provide a public API, we'll use alternative methods

export interface PinterestImage {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
  width: number;
  height: number;
  color?: string;
}

class PinterestService {
  // Using Unsplash as a Pinterest alternative for high-quality images
  private unsplashAccessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY || 'demo-key';

  // Fallback curated images for demo
  private fallbackImages: PinterestImage[] = [
    {
      id: 'fall-1',
      url: 'https://images.unsplash.com/photo-1558603668-6570496b66f8?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1558603668-6570496b66f8?w=400',
      title: 'Modern Living Room',
      description: 'Minimalist design with natural light',
      width: 800,
      height: 600,
      color: '#f5f5f5'
    },
    {
      id: 'fall-2',
      url: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=400',
      title: 'Cozy Bedroom',
      description: 'Warm and inviting bedroom design',
      width: 800,
      height: 600,
      color: '#e8ddd3'
    },
    {
      id: 'fall-3',
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      title: 'Modern Sofa',
      description: 'Contemporary living room furniture',
      width: 800,
      height: 600,
      color: '#d4a574'
    },
    {
      id: 'fall-4',
      url: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=400',
      title: 'Kitchen Design',
      description: 'Modern kitchen with island',
      width: 800,
      height: 600,
      color: '#ffffff'
    },
    {
      id: 'fall-5',
      url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=400',
      title: 'Home Office',
      description: 'Productive workspace design',
      width: 800,
      height: 600,
      color: '#2c3e50'
    },
    {
      id: 'fall-6',
      url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      title: 'Bathroom Oasis',
      description: 'Spa-like bathroom design',
      width: 800,
      height: 600,
      color: '#ecf0f1'
    },
    {
      id: 'fall-7',
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400',
      title: 'Living Space',
      description: 'Open concept living area',
      width: 800,
      height: 600,
      color: '#bdc3c7'
    },
    {
      id: 'fall-8',
      url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400',
      title: 'Scandinavian Style',
      description: 'Clean and minimal interior',
      width: 800,
      height: 600,
      color: '#f8f9fa'
    },
    {
      id: 'fall-9',
      url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400',
      title: 'Bedroom Retreat',
      description: 'Peaceful bedroom design',
      width: 800,
      height: 600,
      color: '#e9ecef'
    }
  ];

  /**
   * Search for Pinterest-style images based on query
   * @param query Search query (e.g., "modern bedroom", "cozy living room")
   * @param count Number of images to return (default 6 for mood boards)
   */
  async searchImages(query: string, count: number = 6): Promise<PinterestImage[]> {
    try {
      // Ensure we always return exactly the requested count
      const targetCount = count || 6;

      // If we have a valid Unsplash key, try to fetch real images
      if (this.unsplashAccessKey && this.unsplashAccessKey !== 'demo-key') {
        const images = await this.fetchUnsplashImages(query, targetCount);
        // Ensure we return exactly the requested number
        return images.slice(0, targetCount);
      }

      // Otherwise, return curated fallback images filtered by query
      return this.getCuratedImages(query, targetCount);
    } catch (error) {
      console.error('Error fetching images:', error);
      return this.getCuratedImages(query, count);
    }
  }

  /**
   * Fetch images from Unsplash API
   */
  private async fetchUnsplashImages(query: string, count: number): Promise<PinterestImage[]> {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait`,
        {
          headers: {
            'Authorization': `Client-ID ${this.unsplashAccessKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.statusText}`);
      }

      const data = await response.json();

      return data.results.map((img: any) => ({
        id: img.id,
        url: img.urls.regular,
        thumbnail: img.urls.small,
        title: img.description || img.alt_description || 'Untitled',
        description: img.alt_description,
        width: img.width,
        height: img.height,
        color: img.color
      }));
    } catch (error) {
      console.error('Unsplash API error:', error);
      throw error;
    }
  }

  /**
   * Get curated images based on query keywords
   */
  private getCuratedImages(query: string, count: number): PinterestImage[] {
    const queryLower = query.toLowerCase();

    // Filter images based on query
    let filtered = this.fallbackImages;

    if (queryLower.includes('bedroom')) {
      filtered = this.fallbackImages.filter(img =>
        img.title.toLowerCase().includes('bedroom') ||
        img.description?.toLowerCase().includes('bedroom')
      );
    } else if (queryLower.includes('living')) {
      filtered = this.fallbackImages.filter(img =>
        img.title.toLowerCase().includes('living') ||
        img.description?.toLowerCase().includes('living')
      );
    } else if (queryLower.includes('kitchen')) {
      filtered = this.fallbackImages.filter(img =>
        img.title.toLowerCase().includes('kitchen')
      );
    } else if (queryLower.includes('office')) {
      filtered = this.fallbackImages.filter(img =>
        img.title.toLowerCase().includes('office')
      );
    }

    // If no specific match or not enough images, use all images
    if (filtered.length < count) {
      filtered = this.fallbackImages;
    }

    // Shuffle and return exactly the requested count
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);

    // If we still don't have enough images, duplicate some
    while (shuffled.length < count) {
      shuffled.push(...shuffled.slice(0, Math.min(count - shuffled.length, shuffled.length)));
    }

    return shuffled.slice(0, count);
  }

  /**
   * Get trending/popular images (always 6 for mood boards)
   */
  async getTrendingImages(count: number = 6): Promise<PinterestImage[]> {
    return this.searchImages('interior design trending', count);
  }

  /**
   * Get images by category (always 6 for mood boards)
   */
  async getImagesByCategory(category: string, count: number = 6): Promise<PinterestImage[]> {
    const categoryQueries: { [key: string]: string } = {
      'minimal': 'minimalist interior design',
      'modern': 'modern home decor',
      'vintage': 'vintage interior style',
      'bohemian': 'bohemian home decor',
      'industrial': 'industrial loft design',
      'scandinavian': 'scandinavian interior',
      'rustic': 'rustic home decor',
      'luxury': 'luxury interior design'
    };

    const query = categoryQueries[category.toLowerCase()] || category;
    return this.searchImages(query, count);
  }
}

export default PinterestService;