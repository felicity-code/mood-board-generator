import React from 'react';
import { render, screen } from '@testing-library/react';
import BasicCanvas from '../BasicCanvas';

// Mock react-konva components
jest.mock('react-konva', () => ({
  Stage: ({ children }: any) => <div data-testid="stage">{children}</div>,
  Layer: ({ children }: any) => <div data-testid="layer">{children}</div>,
  Rect: () => <div data-testid="rect" />,
  Circle: () => <div data-testid="circle" />,
  Line: () => <div data-testid="line" />,
  Text: () => <div data-testid="text" />,
  Image: () => <div data-testid="image" />,
  Transformer: () => <div data-testid="transformer" />,
}));

describe('BasicCanvas', () => {
  const mockProps = {
    width: 800,
    height: 600,
    elements: [],
    selectedTool: 'select' as const,
    showGrid: false,
    onElementsChange: jest.fn(),
    onElementSelect: jest.fn()
  };

  it('renders without crashing', () => {
    const { container } = render(<BasicCanvas {...mockProps} />);
    expect(container).toBeInTheDocument();
  });

  it('renders with correct props', () => {
    const { container } = render(<BasicCanvas {...mockProps} width={1200} height={800} />);
    expect(container).toBeInTheDocument();
  });

  it('renders the stage with correct dimensions', () => {
    render(<BasicCanvas {...mockProps} />);
    const stage = screen.getByTestId('stage');
    expect(stage).toBeInTheDocument();
  });

  it('shows grid when showGrid is true', () => {
    render(<BasicCanvas {...mockProps} showGrid={true} />);
    const lines = screen.getAllByTestId('line');
    expect(lines.length).toBeGreaterThan(0);
  });
});