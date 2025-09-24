// Enhanced Pinterest-style image service with mood and theme-specific generation
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

interface MoodTheme {
  colors: string[];
  keywords: string[];
  elements: string[];
  styles: string[];
  atmosphere: string[];
}

class EnhancedPinterestService {
  private unsplashAccessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY || 'demo-key';

  // Comprehensive mood and theme mappings
  private moodThemes: { [key: string]: MoodTheme } = {
    minimal: {
      colors: ['white', 'beige', 'gray', 'neutral', 'monochrome'],
      keywords: ['minimalist', 'simple', 'clean', 'uncluttered', 'zen'],
      elements: ['empty space', 'geometric', 'linear', 'basic shapes', 'essentials'],
      styles: ['japanese', 'scandinavian', 'contemporary', 'bauhaus'],
      atmosphere: ['calm', 'serene', 'peaceful', 'organized', 'breathable']
    },
    modern: {
      colors: ['black', 'white', 'chrome', 'glass', 'metallic'],
      keywords: ['modern', 'contemporary', 'cutting-edge', 'sleek', 'innovative'],
      elements: ['steel', 'concrete', 'glass walls', 'open floor', 'tech'],
      styles: ['industrial chic', 'urban loft', 'mid-century modern', 'futuristic'],
      atmosphere: ['sophisticated', 'professional', 'dynamic', 'progressive']
    },
    bohemian: {
      colors: ['terracotta', 'burnt orange', 'jewel tones', 'rich purple', 'warm gold'],
      keywords: ['bohemian', 'boho', 'eclectic', 'artistic', 'free-spirited'],
      elements: ['macrame', 'tapestry', 'plants', 'vintage rugs', 'ethnic patterns'],
      styles: ['moroccan', 'hippie', 'gypsy', 'maximalist', 'global'],
      atmosphere: ['cozy', 'warm', 'creative', 'layered', 'personal']
    },
    scandinavian: {
      colors: ['white', 'light wood', 'soft gray', 'pale blue', 'natural'],
      keywords: ['scandinavian', 'nordic', 'hygge', 'lagom', 'swedish'],
      elements: ['pine wood', 'wool', 'fur throws', 'candles', 'nature'],
      styles: ['danish', 'norwegian', 'finnish', 'ikea', 'minimalist warm'],
      atmosphere: ['cozy', 'bright', 'functional', 'comfortable', 'inviting']
    },
    industrial: {
      colors: ['rust', 'steel gray', 'brick red', 'charcoal', 'copper'],
      keywords: ['industrial', 'warehouse', 'factory', 'urban', 'raw'],
      elements: ['exposed brick', 'metal pipes', 'concrete floors', 'edison bulbs', 'reclaimed wood'],
      styles: ['loft', 'converted warehouse', 'brooklyn style', 'steampunk'],
      atmosphere: ['edgy', 'masculine', 'authentic', 'unfinished', 'bold']
    },
    rustic: {
      colors: ['brown', 'natural wood', 'forest green', 'warm amber', 'stone'],
      keywords: ['rustic', 'farmhouse', 'country', 'cabin', 'lodge'],
      elements: ['barn wood', 'stone fireplace', 'antler', 'burlap', 'wrought iron'],
      styles: ['farmhouse', 'cottage', 'mountain lodge', 'southwestern', 'french country'],
      atmosphere: ['warm', 'welcoming', 'homey', 'natural', 'comfortable']
    },
    luxury: {
      colors: ['gold', 'marble white', 'deep blue', 'emerald', 'champagne'],
      keywords: ['luxury', 'elegant', 'opulent', 'glamorous', 'high-end'],
      elements: ['marble', 'velvet', 'crystal chandelier', 'gold accents', 'silk'],
      styles: ['art deco', 'hollywood regency', 'french', 'baroque', 'palatial'],
      atmosphere: ['sophisticated', 'refined', 'exclusive', 'dramatic', 'lavish']
    },
    vintage: {
      colors: ['dusty rose', 'mint green', 'cream', 'antique brass', 'faded blue'],
      keywords: ['vintage', 'retro', 'antique', 'nostalgic', 'classic'],
      elements: ['vinyl records', 'typewriter', 'old books', 'brass fixtures', 'lace'],
      styles: ['victorian', 'art nouveau', 'mid-century', '1920s', '1950s'],
      atmosphere: ['nostalgic', 'romantic', 'timeless', 'charming', 'storied']
    }
  };

  // Extended fallback images database with mood-specific images
  private moodSpecificImages: { [key: string]: PinterestImage[] } = {
    minimal: [
      {
        id: 'min-1',
        url: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=400',
        title: 'Minimal White Space',
        description: 'Clean minimalist desk setup',
        width: 800, height: 600, color: '#ffffff'
      },
      {
        id: 'min-2',
        url: 'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=400',
        title: 'Zen Minimalism',
        description: 'Japanese-inspired minimal interior',
        width: 800, height: 600, color: '#f5f5f5'
      },
      {
        id: 'min-3',
        url: 'https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=400',
        title: 'Geometric Simplicity',
        description: 'Clean lines and simple forms',
        width: 800, height: 600, color: '#e8e8e8'
      },
      {
        id: 'min-4',
        url: 'https://images.unsplash.com/photo-1496180727794-817822f65950?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1496180727794-817822f65950?w=400',
        title: 'Minimal Kitchen',
        description: 'All-white minimal kitchen design',
        width: 800, height: 600, color: '#fafafa'
      },
      {
        id: 'min-5',
        url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400',
        title: 'Scandinavian Minimal',
        description: 'Light and airy minimal space',
        width: 800, height: 600, color: '#f0f0f0'
      },
      {
        id: 'min-6',
        url: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=400',
        title: 'Minimal Bedroom',
        description: 'Simple and serene bedroom',
        width: 800, height: 600, color: '#ffffff'
      }
    ],
    bohemian: [
      {
        id: 'boh-1',
        url: 'https://images.unsplash.com/photo-1522444690501-eccd1e90f96f?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1522444690501-eccd1e90f96f?w=400',
        title: 'Boho Textiles',
        description: 'Rich patterns and textures',
        width: 800, height: 600, color: '#d2691e'
      },
      {
        id: 'boh-2',
        url: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=400',
        title: 'Macrame Wall Art',
        description: 'Handcrafted bohemian decor',
        width: 800, height: 600, color: '#f4a460'
      },
      {
        id: 'boh-3',
        url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400',
        title: 'Eclectic Living',
        description: 'Colorful bohemian living space',
        width: 800, height: 600, color: '#cd853f'
      },
      {
        id: 'boh-4',
        url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400',
        title: 'Global Inspiration',
        description: 'Moroccan and indian influences',
        width: 800, height: 600, color: '#b22222'
      },
      {
        id: 'boh-5',
        url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400',
        title: 'Plant Paradise',
        description: 'Bohemian space with greenery',
        width: 800, height: 600, color: '#8b4513'
      },
      {
        id: 'boh-6',
        url: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=400',
        title: 'Vintage Boho',
        description: 'Retro bohemian bedroom',
        width: 800, height: 600, color: '#daa520'
      }
    ],
    modern: [
      {
        id: 'mod-1',
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400',
        title: 'Contemporary Living',
        description: 'Sleek modern living room',
        width: 800, height: 600, color: '#2c3e50'
      },
      {
        id: 'mod-2',
        url: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=400',
        title: 'Modern Kitchen',
        description: 'High-tech kitchen design',
        width: 800, height: 600, color: '#34495e'
      },
      {
        id: 'mod-3',
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
        title: 'Glass and Steel',
        description: 'Modern architectural elements',
        width: 800, height: 600, color: '#7f8c8d'
      },
      {
        id: 'mod-4',
        url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
        title: 'Urban Modern',
        description: 'City loft with modern design',
        width: 800, height: 600, color: '#95a5a6'
      },
      {
        id: 'mod-5',
        url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400',
        title: 'Tech-Forward Space',
        description: 'Smart home modern interior',
        width: 800, height: 600, color: '#1abc9c'
      },
      {
        id: 'mod-6',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
        title: 'Modern Luxury',
        description: 'Premium modern design',
        width: 800, height: 600, color: '#2c3e50'
      }
    ]
  };

  /**
   * Generate mood-specific search queries
   */
  private generateMoodQueries(category: string, mood?: string): string[] {
    const theme = this.moodThemes[category.toLowerCase()];
    if (!theme) return [`${category} interior design`];

    const queries: string[] = [];

    // Generate diverse queries combining different aspects
    const randomColor = theme.colors[Math.floor(Math.random() * theme.colors.length)];
    const randomKeyword = theme.keywords[Math.floor(Math.random() * theme.keywords.length)];
    const randomElement = theme.elements[Math.floor(Math.random() * theme.elements.length)];
    const randomStyle = theme.styles[Math.floor(Math.random() * theme.styles.length)];
    const randomAtmosphere = theme.atmosphere[Math.floor(Math.random() * theme.atmosphere.length)];

    // Create 6 unique queries for variety
    queries.push(
      `${randomKeyword} ${randomColor} interior`,
      `${randomStyle} ${randomElement} decor`,
      `${randomAtmosphere} ${category} room`,
      `${randomKeyword} ${randomStyle} design`,
      `${category} ${randomElement} aesthetic`,
      `${randomColor} ${randomAtmosphere} space`
    );

    return queries;
  }

  /**
   * Search for Pinterest-style images with mood-specific variety
   */
  async searchImages(query: string, count: number = 6): Promise<PinterestImage[]> {
    try {
      const targetCount = count || 6;
      const queryLower = query.toLowerCase();

      // Handle specific mood searches - check for dark/gloomy/moody keywords
      if (queryLower.includes('dark') || queryLower.includes('gloomy') || queryLower.includes('moody') ||
          queryLower.includes('gothic') || queryLower.includes('noir') || queryLower.includes('shadowy')) {
        console.log('Detected dark/moody query, returning dark themed images');
        return this.getDarkMoodyImages(targetCount);
      }

      // Check if query matches a category
      const categoryKey = Object.keys(this.moodThemes).find(key =>
        queryLower.includes(key)
      );

      if (categoryKey && this.moodSpecificImages[categoryKey]) {
        // Return mood-specific images
        const moodImages = this.moodSpecificImages[categoryKey];
        // Shuffle for variety
        const shuffled = [...moodImages].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, targetCount);
      }

      // Try to fetch from Unsplash with the actual query
      if (this.unsplashAccessKey && this.unsplashAccessKey !== 'demo-key') {
        return await this.fetchDirectImages(query, targetCount);
      }

      // Fallback to curated images
      return this.getCuratedMoodImages(query, targetCount);
    } catch (error) {
      console.error('Error fetching images:', error);
      return this.getCuratedMoodImages(query, count);
    }
  }

  /**
   * Get dark and moody themed images
   */
  private getDarkMoodyImages(count: number): PinterestImage[] {
    const darkImages: PinterestImage[] = [
      {
        id: 'dark-1',
        url: 'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=400',
        title: 'Dark Gothic Living Room',
        description: 'Moody interior with dark walls and dramatic lighting',
        width: 800, height: 600, color: '#1a1a1a'
      },
      {
        id: 'dark-2',
        url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400',
        title: 'Noir Bedroom Design',
        description: 'All-black bedroom with atmospheric lighting',
        width: 800, height: 600, color: '#0f0f0f'
      },
      {
        id: 'dark-3',
        url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400',
        title: 'Gloomy Industrial Loft',
        description: 'Dark industrial space with exposed beams',
        width: 800, height: 600, color: '#2a2a2a'
      },
      {
        id: 'dark-4',
        url: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=400',
        title: 'Dark Luxury Study',
        description: 'Sophisticated dark wood library with moody lighting',
        width: 800, height: 600, color: '#1c1c1c'
      },
      {
        id: 'dark-5',
        url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400',
        title: 'Shadowy Dining Room',
        description: 'Dark dining space with dramatic shadows',
        width: 800, height: 600, color: '#181818'
      },
      {
        id: 'dark-6',
        url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400',
        title: 'Moody Modern Kitchen',
        description: 'Dark contemporary kitchen with black cabinets',
        width: 800, height: 600, color: '#121212'
      }
    ];

    // Shuffle for variety
    const shuffled = [...darkImages].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Fetch images directly matching the query
   */
  private async fetchDirectImages(query: string, count: number): Promise<PinterestImage[]> {
    try {
      // Enhance the query for interior design context
      const enhancedQuery = `${query} interior design room decor`;

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(enhancedQuery)}&per_page=${count}&orientation=portrait`,
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

      if (!data.results || data.results.length === 0) {
        // If no results, try simpler query
        return this.fetchSimpleQuery(query, count);
      }

      return data.results.map((img: any) => ({
        id: img.id,
        url: img.urls.regular,
        thumbnail: img.urls.small,
        title: img.description || img.alt_description || query,
        description: img.alt_description,
        width: img.width,
        height: img.height,
        color: img.color
      }));
    } catch (error) {
      console.error('Error fetching direct images:', error);
      // If specific query fails, use fallback
      return this.getCuratedMoodImages(query, count);
    }
  }

  /**
   * Fetch with simple query as fallback
   */
  private async fetchSimpleQuery(query: string, count: number): Promise<PinterestImage[]> {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`,
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
        title: img.description || img.alt_description || query,
        description: img.alt_description,
        width: img.width,
        height: img.height,
        color: img.color
      }));
    } catch (error) {
      console.error('Error with simple query:', error);
      return [];
    }
  }

  /**
   * Fetch varied images from multiple queries
   */
  private async fetchVariedImages(baseQuery: string, count: number): Promise<PinterestImage[]> {
    const categoryKey = Object.keys(this.moodThemes).find(key =>
      baseQuery.toLowerCase().includes(key)
    );

    const queries = categoryKey
      ? this.generateMoodQueries(categoryKey)
      : [baseQuery];

    const allImages: PinterestImage[] = [];

    // Fetch 1-2 images per query for variety
    for (let i = 0; i < Math.min(queries.length, count); i++) {
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(queries[i])}&per_page=1&orientation=portrait`,
          {
            headers: {
              'Authorization': `Client-ID ${this.unsplashAccessKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const img = data.results[0];
            allImages.push({
              id: `${img.id}-${i}`,
              url: img.urls.regular,
              thumbnail: img.urls.small,
              title: img.description || img.alt_description || queries[i],
              description: img.alt_description,
              width: img.width,
              height: img.height,
              color: img.color
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching for query "${queries[i]}":`, error);
      }
    }

    // Fill remaining slots if needed
    while (allImages.length < count) {
      const fallback = await this.getCuratedMoodImages(baseQuery, count - allImages.length);
      allImages.push(...fallback);
      break;
    }

    return allImages.slice(0, count);
  }

  /**
   * Get curated images based on mood
   */
  private getCuratedMoodImages(query: string, count: number): PinterestImage[] {
    const queryLower = query.toLowerCase();

    // Try to find matching mood category
    for (const [category, images] of Object.entries(this.moodSpecificImages)) {
      if (queryLower.includes(category)) {
        const shuffled = [...images].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      }
    }

    // Mix different moods for variety
    const allMoods = Object.values(this.moodSpecificImages);
    const randomMood = allMoods[Math.floor(Math.random() * allMoods.length)];
    const shuffled = [...randomMood].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get images by category with unique results each time
   */
  async getImagesByCategory(category: string, count: number = 6): Promise<PinterestImage[]> {
    const theme = this.moodThemes[category.toLowerCase()];

    if (!theme) {
      return this.searchImages(category, count);
    }

    // Generate unique queries for this category
    const queries = this.generateMoodQueries(category);

    // Add randomization by using current timestamp
    const randomizedQuery = queries[Date.now() % queries.length];

    // Try to fetch varied images
    if (this.unsplashAccessKey && this.unsplashAccessKey !== 'demo-key') {
      return await this.fetchVariedImages(randomizedQuery, count);
    }

    // Use mood-specific fallback images
    if (this.moodSpecificImages[category.toLowerCase()]) {
      const images = this.moodSpecificImages[category.toLowerCase()];
      // Randomize order for variety
      const shuffled = [...images].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }

    return this.searchImages(category, count);
  }
}

export default EnhancedPinterestService;