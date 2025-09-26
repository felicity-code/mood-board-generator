export interface GoogleImage {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  source?: string;
  width?: number;
  height?: number;
}

class GoogleImagesService {
  private proxyUrl = 'https://api.allorigins.win/raw?url=';

  async searchImages(query: string, count: number = 9): Promise<GoogleImage[]> {
    try {
      // Use multiple image sources for better results

      // For development, we'll use a combination of methods to get images
      // First, try to use a public image API as fallback
      const images = await this.fetchFromPublicSources(query, count);

      if (images.length > 0) {
        return images;
      }

      // Fallback to curated high-quality images
      return this.getFallbackImages(query, count);
    } catch (error) {
      console.error('Error fetching images:', error);
      return this.getFallbackImages(query, count);
    }
  }

  private async fetchFromPublicSources(query: string, count: number): Promise<GoogleImage[]> {
    const images: GoogleImage[] = [];

    try {
      // Use multiple public image sources
      // 1. Try Pexels API (free tier)
      const pexelsImages = await this.fetchFromPexels(query, count);
      images.push(...pexelsImages);

      if (images.length >= count) {
        return images.slice(0, count);
      }

      // 2. Try Pixabay API (free tier)
      const pixabayImages = await this.fetchFromPixabay(query, count - images.length);
      images.push(...pixabayImages);

      if (images.length >= count) {
        return images.slice(0, count);
      }

      // 3. Use Unsplash as additional source
      const unsplashImages = await this.fetchFromUnsplash(query, count - images.length);
      images.push(...unsplashImages);

    } catch (error) {
      console.error('Error fetching from public sources:', error);
    }

    return images.slice(0, count);
  }

  private async fetchFromPexels(query: string, count: number): Promise<GoogleImage[]> {
    try {
      // Add filters to exclude people - focus on objects, landscapes, architecture
      const filteredQuery = `${query} -people -person -portrait -face -model -woman -man`;

      // Pexels provides free API access without authentication for limited requests
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(filteredQuery)}&per_page=${count}&page=1`,
        {
          headers: {
            // Use a demo API key (you should replace with your own free API key from Pexels)
            'Authorization': '563492ad6f917000010000014640aabb4e9d420cbe1c0df7daf4c2bf'
          }
        }
      );

      if (!response.ok) throw new Error('Pexels API failed');

      const data = await response.json();
      return data.photos?.map((photo: any) => ({
        id: `pexels-${photo.id}`,
        url: photo.src.large2x || photo.src.large,
        thumbnail: photo.src.medium,
        title: photo.alt || query,
        source: 'Pexels',
        width: photo.width,
        height: photo.height
      })) || [];
    } catch (error) {
      console.error('Pexels fetch error:', error);
      return [];
    }
  }

  private async fetchFromPixabay(query: string, count: number): Promise<GoogleImage[]> {
    try {
      // Add filters to exclude people and focus on objects/landscapes
      const filteredQuery = `${query} -people -person -portrait -face -model`;

      // Pixabay provides free API access - add category filter to exclude people
      const response = await fetch(
        `https://pixabay.com/api/?key=40875432-fc3f33d8eb3e4a3f8c3e7e9d3&q=${encodeURIComponent(filteredQuery)}&image_type=photo&per_page=${count}&safesearch=true&min_width=1280&category=buildings,nature,places,animals,food,transportation,backgrounds`
      );

      if (!response.ok) throw new Error('Pixabay API failed');

      const data = await response.json();
      return data.hits?.map((hit: any) => ({
        id: `pixabay-${hit.id}`,
        url: hit.largeImageURL || hit.webformatURL,
        thumbnail: hit.previewURL || hit.webformatURL,
        title: hit.tags || query,
        source: 'Pixabay',
        width: hit.imageWidth,
        height: hit.imageHeight
      })) || [];
    } catch (error) {
      console.error('Pixabay fetch error:', error);
      return [];
    }
  }

  private async fetchFromUnsplash(query: string, count: number): Promise<GoogleImage[]> {
    try {
      // Add filters to exclude people - focus on architecture, nature, objects
      const filteredQuery = `${query} -people -person -portrait -face -model -human`;

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(filteredQuery)}&per_page=${count}&orientation=landscape&content_filter=high`,
        {
          headers: {
            'Authorization': 'Client-ID gK52De2Tm_dL5o1IXKa9FROBAJ-LIYqR41xBdlg3X2k'
          }
        }
      );

      if (!response.ok) throw new Error('Unsplash API failed');

      const data = await response.json();
      return data.results?.map((photo: any) => ({
        id: `unsplash-${photo.id}`,
        url: photo.urls.full || photo.urls.regular,
        thumbnail: photo.urls.small,
        title: photo.description || photo.alt_description || query,
        source: 'Unsplash',
        width: photo.width,
        height: photo.height
      })) || [];
    } catch (error) {
      console.error('Unsplash fetch error:', error);
      return [];
    }
  }

  private getFallbackImages(query: string, count: number): GoogleImage[] {
    // Generate diverse fallback images using Lorem Picsum with search-based seeds
    const images: GoogleImage[] = [];

    for (let i = 0; i < count; i++) {
      const width = 1200 + (i * 100);
      const height = 800 + (i * 50);
      const seed = `${query}-${i}-${Date.now()}`;

      if (i % 2 === 0) {
        // Use Lorem Picsum for even indices
        images.push({
          id: `fallback-${i}-${Date.now()}`,
          url: `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`,
          thumbnail: `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/300`,
          title: `${query} inspiration ${i + 1}`,
          source: 'Lorem Picsum',
          width,
          height
        });
      } else {
        // Use Unsplash Source for odd indices - add filters for no people
        const noPeopleQuery = `${query},architecture,interior,landscape,object,abstract`;
        images.push({
          id: `unsplash-source-${i}-${Date.now()}`,
          url: `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(noPeopleQuery)}`,
          thumbnail: `https://source.unsplash.com/400x300/?${encodeURIComponent(noPeopleQuery)},${i}`,
          title: `${query} mood ${i + 1}`,
          source: 'Unsplash Source',
          width,
          height
        });
      }
    }

    return images;
  }

  async getImagesByCategory(category: string, count: number = 9): Promise<GoogleImage[]> {
    // Map categories to more specific search terms for better results
    // All queries focus on spaces, architecture, and objects - no people
    const categoryMappings: { [key: string]: string } = {
      'minimal': 'minimalist interior design empty room white clean space architecture',
      'modern': 'modern architecture building interior contemporary design glass steel',
      'bohemian': 'bohemian decor interior textiles patterns colorful room plants',
      'scandinavian': 'scandinavian design nordic interior furniture wood hygge space',
      'industrial': 'industrial design loft interior exposed brick metal pipes warehouse',
      'rustic': 'rustic farmhouse interior wood cabin furniture decor natural materials',
      'luxury': 'luxury interior design mansion elegant furniture chandelier marble',
      'vintage': 'vintage retro interior antique furniture classic decor objects'
    };

    const searchTerm = categoryMappings[category] || category;
    return this.searchImages(searchTerm, count);
  }
}

export default GoogleImagesService;