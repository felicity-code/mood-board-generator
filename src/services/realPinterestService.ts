// Real Pinterest-like service with multiple image sources for maximum variety
export interface PinterestImage {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
  width: number;
  height: number;
  color?: string;
  source?: string;
}

class RealPinterestService {
  private unsplashAccessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY || '';
  private pexelsApiKey = process.env.REACT_APP_PEXELS_API_KEY || '';
  private pixabayApiKey = process.env.REACT_APP_PIXABAY_API_KEY || '';

  // Use multiple free image APIs to get Pinterest-like variety
  async searchImages(query: string, count: number = 6): Promise<PinterestImage[]> {
    console.log(`Searching for: "${query}" - fetching ${count} images`);

    try {
      // Try multiple sources in parallel for best variety
      const promises = [];

      // Always try Unsplash first (best quality)
      if (this.unsplashAccessKey && this.unsplashAccessKey !== 'demo-key') {
        promises.push(this.fetchFromUnsplash(query, count));
      }

      // Add Pexels for more variety
      if (this.pexelsApiKey) {
        promises.push(this.fetchFromPexels(query, count));
      }

      // Add Pixabay for even more variety
      if (this.pixabayApiKey) {
        promises.push(this.fetchFromPixabay(query, count));
      }

      // If no API keys, use high-quality stock photo services
      if (promises.length === 0) {
        return this.fetchFromPublicSources(query, count);
      }

      // Fetch from all sources
      const results = await Promise.allSettled(promises);
      const allImages: PinterestImage[] = [];

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          allImages.push(...result.value);
        }
      });

      // Mix and shuffle for variety
      const shuffled = this.shuffleArray(allImages);

      // Return exactly the requested count
      return shuffled.slice(0, count);

    } catch (error) {
      console.error('Error fetching images:', error);
      return this.fetchFromPublicSources(query, count);
    }
  }

  // Fetch from Unsplash
  private async fetchFromUnsplash(query: string, count: number): Promise<PinterestImage[]> {
    try {
      // Add randomization to get different results each time
      const page = Math.floor(Math.random() * 5) + 1;

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count * 2}&page=${page}&order_by=relevant`,
        {
          headers: {
            'Authorization': `Client-ID ${this.unsplashAccessKey}`,
          },
        }
      );

      if (!response.ok) throw new Error('Unsplash API error');

      const data = await response.json();

      return data.results.map((img: any) => ({
        id: `unsplash-${img.id}`,
        url: img.urls.regular || img.urls.full,
        thumbnail: img.urls.small || img.urls.thumb,
        title: img.description || img.alt_description || query,
        description: img.alt_description,
        width: img.width,
        height: img.height,
        color: img.color,
        source: 'unsplash'
      }));
    } catch (error) {
      console.error('Unsplash error:', error);
      return [];
    }
  }

  // Fetch from Pexels
  private async fetchFromPexels(query: string, count: number): Promise<PinterestImage[]> {
    try {
      const page = Math.floor(Math.random() * 5) + 1;

      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count * 2}&page=${page}`,
        {
          headers: {
            'Authorization': this.pexelsApiKey,
          },
        }
      );

      if (!response.ok) throw new Error('Pexels API error');

      const data = await response.json();

      return data.photos.map((img: any) => ({
        id: `pexels-${img.id}`,
        url: img.src.large || img.src.original,
        thumbnail: img.src.medium || img.src.small,
        title: img.alt || query,
        description: img.photographer,
        width: img.width,
        height: img.height,
        color: img.avg_color,
        source: 'pexels'
      }));
    } catch (error) {
      console.error('Pexels error:', error);
      return [];
    }
  }

  // Fetch from Pixabay
  private async fetchFromPixabay(query: string, count: number): Promise<PinterestImage[]> {
    try {
      const page = Math.floor(Math.random() * 3) + 1;

      const response = await fetch(
        `https://pixabay.com/api/?key=${this.pixabayApiKey}&q=${encodeURIComponent(query)}&per_page=${count * 2}&page=${page}&image_type=photo`
      );

      if (!response.ok) throw new Error('Pixabay API error');

      const data = await response.json();

      return data.hits.map((img: any) => ({
        id: `pixabay-${img.id}`,
        url: img.largeImageURL || img.webformatURL,
        thumbnail: img.webformatURL || img.previewURL,
        title: img.tags || query,
        description: img.user,
        width: img.imageWidth,
        height: img.imageHeight,
        color: null,
        source: 'pixabay'
      }));
    } catch (error) {
      console.error('Pixabay error:', error);
      return [];
    }
  }

  // Use public stock photo URLs (no API needed)
  private async fetchFromPublicSources(query: string, count: number): Promise<PinterestImage[]> {
    const queryWords = query.toLowerCase().split(' ');

    // Generate varied image URLs from free stock photo services
    const sources = [
      'https://source.unsplash.com/800x600/?',
      'https://picsum.photos/800/600?random=',
      'https://loremflickr.com/800/600/',
    ];

    const images: PinterestImage[] = [];

    for (let i = 0; i < count; i++) {
      const sourceIndex = i % sources.length;
      const randomId = Math.random().toString(36).substring(7);

      let imageUrl = '';
      let thumbnailUrl = '';

      if (sourceIndex === 0) {
        // Unsplash Source
        imageUrl = `${sources[0]}${encodeURIComponent(query)}&sig=${randomId}`;
        thumbnailUrl = `${sources[0]}${encodeURIComponent(query)}&w=400&sig=${randomId}`;
      } else if (sourceIndex === 1) {
        // Lorem Picsum
        const seed = Math.floor(Math.random() * 1000);
        imageUrl = `${sources[1]}${seed}`;
        thumbnailUrl = `https://picsum.photos/400/300?random=${seed}`;
      } else {
        // Lorem Flickr
        imageUrl = `${sources[2]}${queryWords[0] || 'design'}?random=${i}`;
        thumbnailUrl = `https://loremflickr.com/400/300/${queryWords[0] || 'design'}?random=${i}`;
      }

      images.push({
        id: `stock-${randomId}-${i}`,
        url: imageUrl,
        thumbnail: thumbnailUrl,
        title: `${query} - Image ${i + 1}`,
        description: `Stock photo for ${query}`,
        width: 800,
        height: 600,
        source: 'stock'
      });
    }

    // Add some variety by fetching from different categories
    const relatedTerms = this.getRelatedSearchTerms(query);

    relatedTerms.forEach((term, index) => {
      if (images.length < count * 2) {
        const randomId = Math.random().toString(36).substring(7);
        images.push({
          id: `related-${randomId}-${index}`,
          url: `https://source.unsplash.com/800x600/?${encodeURIComponent(term)}&sig=${randomId}`,
          thumbnail: `https://source.unsplash.com/400x300/?${encodeURIComponent(term)}&sig=${randomId}`,
          title: `${term} - Related to ${query}`,
          description: `Related image for ${query}`,
          width: 800,
          height: 600,
          source: 'unsplash-source'
        });
      }
    });

    // Shuffle and return
    return this.shuffleArray(images).slice(0, count);
  }

  // Get related search terms for more variety
  private getRelatedSearchTerms(query: string): string[] {
    const queryLower = query.toLowerCase();
    const related: string[] = [];

    // Interior design related
    if (queryLower.includes('interior') || queryLower.includes('room') || queryLower.includes('home')) {
      related.push('interior design', 'home decor', 'furniture', 'architecture', 'living space');
    }

    // Mood-based
    if (queryLower.includes('dark') || queryLower.includes('gloomy')) {
      related.push('noir', 'gothic', 'dramatic', 'shadows', 'moody lighting');
    }

    if (queryLower.includes('bright') || queryLower.includes('light')) {
      related.push('airy', 'sunshine', 'white space', 'natural light', 'minimalist');
    }

    if (queryLower.includes('cozy')) {
      related.push('warm', 'comfortable', 'hygge', 'soft lighting', 'cushions');
    }

    // Style-based
    if (queryLower.includes('modern')) {
      related.push('contemporary', 'sleek', 'minimalist', 'clean lines', 'urban');
    }

    if (queryLower.includes('vintage')) {
      related.push('retro', 'antique', 'classic', 'nostalgic', 'old-fashioned');
    }

    if (queryLower.includes('bohemian') || queryLower.includes('boho')) {
      related.push('eclectic', 'artistic', 'colorful', 'patterns', 'textures');
    }

    // Nature related
    if (queryLower.includes('nature') || queryLower.includes('plant')) {
      related.push('greenery', 'botanical', 'forest', 'natural', 'organic');
    }

    // If no specific matches, add general design terms
    if (related.length === 0) {
      related.push('design', 'aesthetic', 'style', 'decor', 'inspiration');
    }

    return related;
  }

  // Get images by category with maximum variety
  async getImagesByCategory(category: string, count: number = 6): Promise<PinterestImage[]> {
    // Create varied search queries for the category
    const queries = this.getCategoryQueries(category);

    // Pick a random query for variety
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];

    console.log(`Category: ${category}, Query: ${randomQuery}`);

    return this.searchImages(randomQuery, count);
  }

  // Generate varied queries for each category
  private getCategoryQueries(category: string): string[] {
    const categoryQueries: { [key: string]: string[] } = {
      'minimal': [
        'minimalist interior design',
        'simple clean space',
        'white minimal room',
        'japanese minimalism',
        'scandinavian minimal',
        'empty space design',
        'less is more interior',
        'minimal home decor'
      ],
      'modern': [
        'modern interior design',
        'contemporary living space',
        'sleek modern home',
        'urban loft design',
        'modern architecture interior',
        'futuristic home design',
        'modern luxury interior',
        'tech smart home'
      ],
      'bohemian': [
        'bohemian interior design',
        'boho chic decor',
        'eclectic home style',
        'moroccan inspired interior',
        'colorful bohemian room',
        'artistic living space',
        'global decor style',
        'vintage bohemian design'
      ],
      'scandinavian': [
        'scandinavian interior design',
        'nordic home style',
        'hygge cozy room',
        'swedish interior design',
        'danish modern style',
        'norwegian cabin interior',
        'finnish design aesthetic',
        'scandi minimal decor'
      ],
      'industrial': [
        'industrial interior design',
        'warehouse loft style',
        'exposed brick interior',
        'urban industrial decor',
        'factory conversion home',
        'raw industrial space',
        'brooklyn loft style',
        'steampunk interior design'
      ],
      'rustic': [
        'rustic interior design',
        'farmhouse style decor',
        'country home interior',
        'cabin in the woods',
        'barn conversion interior',
        'reclaimed wood design',
        'mountain lodge style',
        'rustic modern blend'
      ],
      'luxury': [
        'luxury interior design',
        'elegant home decor',
        'opulent living space',
        'high-end interior design',
        'mansion interior style',
        'glamorous home decor',
        'designer luxury space',
        'premium interior design'
      ],
      'vintage': [
        'vintage interior design',
        'retro home decor',
        'antique furniture style',
        'mid-century modern',
        '1920s art deco interior',
        '1950s retro design',
        'victorian era interior',
        'classic vintage style'
      ]
    };

    return categoryQueries[category.toLowerCase()] || [`${category} interior design`];
  }

  // Utility function to shuffle array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export default RealPinterestService;