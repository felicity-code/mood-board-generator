import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders universal mood board generator', () => {
  render(<App />);
  const titleElement = screen.getByText('Universal Mood Board Generator');
  expect(titleElement).toBeInTheDocument();
});

test('renders style category selection', () => {
  render(<App />);
  const categoryElement = screen.getByText(/choose a style category/i);
  expect(categoryElement).toBeInTheDocument();
});
