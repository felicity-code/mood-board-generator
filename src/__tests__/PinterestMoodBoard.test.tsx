import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PinterestMoodBoard from '../PinterestMoodBoard';
import GoogleImagesService from '../services/googleImagesService';

// Mock the GoogleImagesService
jest.mock('../services/googleImagesService');

// Mock ExportModal component
jest.mock('../components/ExportModal', () => {
  return function MockExportModal({ isOpen }: { isOpen: boolean }) {
    return isOpen ? <div data-testid="export-modal">Export Modal</div> : null;
  };
});

describe('PinterestMoodBoard', () => {
  let mockSearchImages: jest.Mock;
  let mockGetImagesByCategory: jest.Mock;

  beforeEach(() => {
    // Mock window.innerWidth for responsive grid
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Mock localStorage to return null for darkMode (uses default true)
    Storage.prototype.getItem = jest.fn().mockReturnValue(null);
    Storage.prototype.setItem = jest.fn();

    // Setup mock functions
    mockSearchImages = jest.fn().mockResolvedValue([
      {
        id: '1',
        url: 'https://test1.jpg',
        thumbnail: 'https://thumb1.jpg',
        title: 'Test Image 1',
        source: 'Pexels',
        width: 1920,
        height: 1080
      }
    ]);

    mockGetImagesByCategory = jest.fn().mockResolvedValue([
      {
        id: '2',
        url: 'https://test2.jpg',
        thumbnail: 'https://thumb2.jpg',
        title: 'Category Image',
        source: 'Pixabay',
        width: 1920,
        height: 1080
      }
    ]);

    (GoogleImagesService as jest.Mock).mockImplementation(() => ({
      searchImages: mockSearchImages,
      getImagesByCategory: mockGetImagesByCategory
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the mood board generator title', () => {
      render(<PinterestMoodBoard />);
      expect(screen.getByText('Universal Mood Board Generator')).toBeInTheDocument();
    });

    it('should render the description', () => {
      render(<PinterestMoodBoard />);
      expect(screen.getByText(/Create beautiful mood boards/i)).toBeInTheDocument();
    });

    it('should render all style categories', () => {
      render(<PinterestMoodBoard />);
      expect(screen.getByText('Minimalist')).toBeInTheDocument();
      expect(screen.getByText('Modern')).toBeInTheDocument();
      expect(screen.getByText('Bohemian')).toBeInTheDocument();
      expect(screen.getByText('Scandinavian')).toBeInTheDocument();
    });

    it('should render the generate button', () => {
      render(<PinterestMoodBoard />);
      const button = screen.getByRole('button', { name: /Generate Mood Board/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('should load dark mode preference from localStorage', () => {
      render(<PinterestMoodBoard />);
      expect(localStorage.getItem).toHaveBeenCalledWith('darkMode');
    });

    it('should save dark mode preference when toggled', () => {
      render(<PinterestMoodBoard />);
      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons[0]; // First button is dark mode toggle

      fireEvent.click(toggleButton);

      expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', expect.any(String));
    });
  });

  describe('Image Service Integration', () => {
    it('should call getImagesByCategory when category is clicked', async () => {
      render(<PinterestMoodBoard />);
      const minimalButton = screen.getByText('Minimalist');

      fireEvent.click(minimalButton);

      await waitFor(() => {
        expect(mockGetImagesByCategory).toHaveBeenCalledWith('minimal', 9);
      });
    });

    it('should call searchImages when generating with text prompt', async () => {
      render(<PinterestMoodBoard />);
      const textarea = screen.getByPlaceholderText(/e\.g\., dark and gloomy/i) as HTMLTextAreaElement;
      const generateButton = screen.getByRole('button', { name: /Generate Mood Board/i });

      fireEvent.change(textarea, { target: { value: 'modern kitchen' } });
      expect(textarea.value).toBe('modern kitchen');

      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockSearchImages).toHaveBeenCalledWith('modern kitchen', 9);
      });
    });
  });

  describe('Button States', () => {
    it('should disable generate button when no input provided', () => {
      render(<PinterestMoodBoard />);
      const generateButton = screen.getByRole('button', { name: /Generate Mood Board/i });
      expect(generateButton).toBeDisabled();
    });

    it('should enable generate button when text is entered', () => {
      render(<PinterestMoodBoard />);
      const textarea = screen.getByPlaceholderText(/e\.g\., dark and gloomy/i);
      const generateButton = screen.getByRole('button', { name: /Generate Mood Board/i });

      fireEvent.change(textarea, { target: { value: 'test' } });

      expect(generateButton).not.toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors with fallback', async () => {
      mockSearchImages
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce([
          {
            id: 'fallback',
            url: 'https://fallback.jpg',
            thumbnail: 'https://fallback-thumb.jpg',
            title: 'Fallback Image',
            source: 'Lorem Picsum',
            width: 1920,
            height: 1080
          }
        ]);

      render(<PinterestMoodBoard />);
      const textarea = screen.getByPlaceholderText(/e\.g\., dark and gloomy/i);
      const generateButton = screen.getByRole('button', { name: /Generate Mood Board/i });

      fireEvent.change(textarea, { target: { value: 'test' } });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockSearchImages).toHaveBeenCalledTimes(2);
        expect(mockSearchImages).toHaveBeenLastCalledWith('interior design', 9);
      });
    });
  });

  describe('Mood Board Display', () => {
    it('should display mood board after successful image fetch', async () => {
      render(<PinterestMoodBoard />);
      const minimalButton = screen.getByText('Minimalist');

      fireEvent.click(minimalButton);

      await waitFor(() => {
        expect(screen.getByText('Your Mood Board')).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching', () => {
      render(<PinterestMoodBoard />);
      const minimalButton = screen.getByText('Minimalist');

      fireEvent.click(minimalButton);

      expect(screen.getByText(/Searching Images.../i)).toBeInTheDocument();
    });
  });
});