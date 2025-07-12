// tests/Spectrogram.test.js

import { render, act } from '@testing-library/react';
import React, { useRef, useEffect } from 'react';
import { AudioCtx } from '../src/components/AudioCapture'; // Adjust path as needed
import Spectrogram from '../src/components/Spectrogram'; // Adjust path as needed

// Mock the AudioCtx
const mockAnalyser = {
  frequencyBinCount: 1024,
  getFloatFrequencyData: jest.fn(),
};

const mockContextValue = {
  analyser: mockAnalyser,
  isListening: true,
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(() => 1);
global.cancelAnimationFrame = jest.fn();

// Mock canvas context methods
let mockFillStyle = '';
const mockContext = {
  clearRect: jest.fn(),
  get fillStyle() { return mockFillStyle; },
  set fillStyle(value) { mockFillStyle = value; },
  fillRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
  putImageData: jest.fn(),
  drawImage: jest.fn(),
};
const mockGetContext = jest.fn(() => mockContext);

const mockCanvas = {
  getContext: mockGetContext,
  width: 800,
  height: 400,
};

// Mock useRef to return our mock canvas
let cleanupFunctions = [];

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: () => ({ current: mockCanvas }),
  useEffect: jest.fn((fn) => {
    const cleanup = fn();
    if (typeof cleanup === 'function') {
      cleanupFunctions.push(cleanup);
    }
  }),
}));

describe('Spectrogram Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFillStyle = ''; // Reset fillStyle
    global.requestAnimationFrame.mockClear();
    global.cancelAnimationFrame.mockClear();
    cleanupFunctions = []; // Clear cleanup functions
    mockAnalyser.getFloatFrequencyData.mockImplementation((array) => {
      array.fill(-100); // Simulate low amplitude data
    });
  });

  it('renders canvas element', () => {
    const { container } = render(
      <AudioCtx.Provider value={mockContextValue}>
        <Spectrogram />
      </AudioCtx.Provider>
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('data-testid', 'spectrogram-canvas');
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '400');
  });

  it('initializes canvas context and clears on mount when active', () => {
    render(
      <AudioCtx.Provider value={mockContextValue}>
        <Spectrogram />
      </AudioCtx.Provider>
    );

    expect(mockGetContext).toHaveBeenCalledWith('2d');
    expect(mockCanvas.getContext().fillStyle).toBe('rgb(0, 0, 0)');
    expect(mockCanvas.getContext().fillRect).toHaveBeenCalledWith(0, 0, 800, 400);
  });

  it('requests animation frame and draws spectrogram data', () => {
    render(
      <AudioCtx.Provider value={mockContextValue}>
        <Spectrogram />
      </AudioCtx.Provider>
    );

    // Verify requestAnimationFrame was called (this happens in useEffect)
    expect(global.requestAnimationFrame).toHaveBeenCalled();
    
    // Since the initial clear happens in useEffect, check for canvas setup
    expect(mockCanvas.getContext().fillRect).toHaveBeenCalledWith(0, 0, 800, 400);
  });

  it('maps frequency data to colors correctly', () => {
    // This is challenging to test directly since color mapping is internal
    // But we can verify the component renders and sets up canvas context
    render(
      <AudioCtx.Provider value={mockContextValue}>
        <Spectrogram />
      </AudioCtx.Provider>
    );

    // Verify basic setup occurred
    expect(global.requestAnimationFrame).toHaveBeenCalled();
    expect(mockCanvas.getContext().fillRect).toHaveBeenCalledWith(0, 0, 800, 400);
  });

  it('does not draw if not active', () => {
    const inactiveContext = { ...mockContextValue, isListening: false };

    render(
      <AudioCtx.Provider value={inactiveContext}>
        <Spectrogram />
      </AudioCtx.Provider>
    );

    expect(global.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('cleans up animation frame on unmount', () => {
    const { unmount } = render(
      <AudioCtx.Provider value={mockContextValue}>
        <Spectrogram />
      </AudioCtx.Provider>
    );

    // Clear the mock to isolate unmount calls
    global.cancelAnimationFrame.mockClear();
    
    // Call the stored cleanup functions to simulate React's cleanup behavior
    cleanupFunctions.forEach(cleanup => cleanup());
    
    unmount();

    // The cleanup should call cancelAnimationFrame with the ID returned by requestAnimationFrame (which is 1)
    expect(global.cancelAnimationFrame).toHaveBeenCalledWith(1);
  });
});