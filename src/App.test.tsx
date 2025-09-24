import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders pinterest mood board generator', () => {
  render(<App />);
  const titleElement = screen.getByText('Pinterest Mood Board Generator');
  expect(titleElement).toBeInTheDocument();
});

test('renders style category selection', () => {
  render(<App />);
  const categoryElement = screen.getByText(/choose a style category/i);
  expect(categoryElement).toBeInTheDocument();
});
