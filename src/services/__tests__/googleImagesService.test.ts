import GoogleImagesService, { GoogleImage } from '../googleImagesService';

// Mock fetch globally
global.fetch = jest.fn();

describe('GoogleImagesService', () => {
  let service: GoogleImagesService;

  beforeEach(() => {
    service = new GoogleImagesService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('searchImages', () => {
    it('should return images from multiple sources', async () => {
      // Mock successful responses from APIs
      const mockPexelsResponse = {
        photos: [
          {
            id: 1,
            src: { large2x: 'https://pexels.com/large.jpg', medium: 'https://pexels.com/thumb.jpg' },
            alt: 'Test image',
            width: 1920,
            height: 1080
          }
        ]
      };

      const mockPixabayResponse = {
        hits: [
          {
            id: 2,
            largeImageURL: 'https://pixabay.com/large.jpg',
            previewURL: 'https://pixabay.com/thumb.jpg',
            tags: 'test tags',
            imageWidth: 1920,
            imageHeight: 1080
          }
        ]
      };

      const mockUnsplashResponse = {
        results: [
          {
            id: '3',
            urls: { full: 'https://unsplash.com/large.jpg', small: 'https://unsplash.com/thumb.jpg' },
            description: 'Test description',
            width: 1920,
            height: 1080
          }
        ]
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPexelsResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPixabayResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUnsplashResponse
        });

      const images = await service.searchImages('test query', 3);

      expect(images).toHaveLength(3);
      expect(images[0].source).toBe('Pexels');
      expect(images[1].source).toBe('Pixabay');
      expect(images[2].source).toBe('Unsplash');
    });

    it('should exclude people from search queries', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ photos: [], hits: [], results: [] })
      });

      await service.searchImages('portrait', 3);

      // Check that Pexels was called with filters
      const pexelsCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(pexelsCall).toContain('-people');
      expect(pexelsCall).toContain('-person');
      expect(pexelsCall).toContain('-portrait');
      expect(pexelsCall).toContain('-face');
    });

    it('should return fallback images when APIs fail', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const images = await service.searchImages('test', 3);

      expect(images).toHaveLength(3);
      expect(images[0].source).toMatch(/Lorem Picsum|Unsplash Source/);
    });
  });

  describe('getImagesByCategory', () => {
    it('should map categories to appropriate search terms', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ photos: [], hits: [], results: [] })
      });

      await service.getImagesByCategory('minimal', 3);

      // Check that the search includes category-specific terms
      const calls = (global.fetch as jest.Mock).mock.calls;
      const searchQuery = calls[0][0];
      expect(searchQuery).toContain('minimalist');
      expect(searchQuery).toContain('interior');
      expect(searchQuery).toContain('design');
    });

    it('should handle unknown categories', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ photos: [], hits: [], results: [] })
      });

      await service.getImagesByCategory('unknown-category', 3);

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('API-specific methods', () => {
    it('should handle Pexels API errors gracefully', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false }) // Pexels fails
        .mockResolvedValueOnce({ ok: true, json: async () => ({ hits: [] }) }) // Pixabay succeeds
        .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) }); // Unsplash succeeds

      const images = await service.searchImages('test', 3);

      // Should still return images from other sources or fallbacks
      expect(images).toBeDefined();
      expect(images.length).toBeGreaterThan(0);
    });

    it('should handle Pixabay category filters', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ photos: [], hits: [], results: [] })
      });

      await service.searchImages('test', 3);

      // Find the Pixabay API call
      const pixabayCall = (global.fetch as jest.Mock).mock.calls.find(
        call => call[0].includes('pixabay.com')
      );

      expect(pixabayCall[0]).toContain('category=');
      expect(pixabayCall[0]).toContain('buildings');
    });

    it('should add content filter to Unsplash requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ photos: [], hits: [], results: [] })
      });

      await service.searchImages('test', 3);

      // Find the Unsplash API call
      const unsplashCall = (global.fetch as jest.Mock).mock.calls.find(
        call => call[0].includes('unsplash.com')
      );

      expect(unsplashCall[0]).toContain('content_filter=high');
      expect(unsplashCall[0]).toContain('-human');
    });
  });

  describe('Image structure', () => {
    it('should return images with correct structure', async () => {
      const mockResponse = {
        photos: [
          {
            id: 1,
            src: { large2x: 'https://test.jpg', medium: 'https://thumb.jpg' },
            alt: 'Test',
            width: 1920,
            height: 1080
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const images = await service.searchImages('test', 1);
      const image = images[0];

      expect(image).toHaveProperty('id');
      expect(image).toHaveProperty('url');
      expect(image).toHaveProperty('thumbnail');
      expect(image).toHaveProperty('title');
      expect(image).toHaveProperty('source');
      expect(image).toHaveProperty('width');
      expect(image).toHaveProperty('height');
    });
  });
});