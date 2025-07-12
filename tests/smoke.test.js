// tests/smoke.test.js

import { render, screen } from '@testing-library/react';
import React from 'react';
import HomePage from '../src/pages/index'; // Using Pages Router

// Mock browser APIs to prevent errors in test environment
global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({ /* mock stream */ }),
};

global.AudioContext = jest.fn().mockImplementation(() => ({
  createMediaStreamSource: jest.fn(),
  createAnalyser: jest.fn(() => ({
    getFloatTimeDomainData: jest.fn(),
    getFloatFrequencyData: jest.fn(),
  })),
}));

describe('Smoke Tests for Feels App', () => {
  test('renders without crashing', () => {
    render(<HomePage />);
    expect(screen.getByText(/feels/i)).toBeInTheDocument(); // Assuming app has a title or header with "feels"
  });

  test('renders key components: oscilloscope and spectrogram canvases', () => {
    render(<HomePage />);
    expect(screen.getByTestId('oscilloscope-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('spectrogram-canvas')).toBeInTheDocument();
  });

  test('renders start/stop button and status display', () => {
    render(<HomePage />);
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    expect(screen.getByText(/standby/i)).toBeInTheDocument(); // Initial status
  });

  test('app layout is responsive (basic check)', () => {
    render(<HomePage />);
    const container = document.querySelector('.grid');
    expect(container).toBeInTheDocument();
  });
});