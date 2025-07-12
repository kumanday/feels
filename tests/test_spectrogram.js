// tests/test_spectrogram.js

import { render, act } from '@testing-library/react';
import React from 'react';
import Spectrogram from '../src/components/Spectrogram'; // Adjust path as needed

// Mock CanvasRenderingContext2D for spectrogram drawing
const mockGetContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillStyle: '',
  fillRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: jest.fn(),
}));

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = mockGetContext;

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));

// Mock analyser node for frequency data
const mockAnalyser = {
  frequencyBinCount: 1024,
  getFloatFrequencyData: jest.fn((array) => {
    array.fill(-100); // Mock low amplitude data
  }),
};

// Mock AudioContext and related nodes
jest.mock('web-audio-api', () => ({
  AudioContext: jest.fn(() => ({
    createAnalyser: () => mockAnalyser,
    createGain: jest.fn(() => ({})),
    createMediaStreamSource: jest.fn(() => ({})),
  })),
}));

describe('Spectrogram Component', () => {
  let component;

  beforeEach(() => {
    component = render(<Spectrogram analyser={mockAnalyser} />);
  });

  it('renders without crashing', () => {
    expect(component).toBeTruthy();
    expect(mockGetContext).toHaveBeenCalledWith('2d');
  });

  it('draws frequency data as a heatmap slice', () => {
    act(() => {
      global.requestAnimationFrame.mock.calls[0][0](); // Simulate frame update
    });

    expect(mockAnalyser.getFloatFrequencyData).toHaveBeenCalled();
    expect(mockGetContext().fillRect).toHaveBeenCalled(); // Expect color fills for amplitude
  });

  it('scrolls the canvas horizontally for time progression', () => {
    const mockCtx = mockGetContext();

    act(() => {
      global.requestAnimationFrame.mock.calls[0][0](); // First frame
      global.requestAnimationFrame.mock.calls[0][0](); // Second frame to trigger scroll
    });

    expect(mockCtx.getImageData).toHaveBeenCalled(); // For scrolling existing data
    expect(mockCtx.putImageData).toHaveBeenCalled(); // Shift image data left
  });

  it('maps amplitude values to correct colors', () => {
    const mockData = new Float32Array(1024);
    mockData.fill(0); // High amplitude mock
    mockAnalyser.getFloatFrequencyData.mockImplementation((array) => array.set(mockData));

    act(() => {
      global.requestAnimationFrame.mock.calls[0][0]();
    });

    expect(mockGetContext().fillStyle).toBeDefined(); // e.g., expect color like 'rgb(255,0,0)' for high amp
    expect(mockGetContext().fillRect).toHaveBeenCalled();
  });

  it('handles different FFT sizes by adjusting bin count', () => {
    mockAnalyser.frequencyBinCount = 512; // Smaller FFT

    act(() => {
      global.requestAnimationFrame.mock.calls[0][0]();
    });

    const dataArray = new Float32Array(512);
    expect(mockAnalyser.getFloatFrequencyData).toHaveBeenCalledWith(expect.objectContaining({ length: 512 }));
  });

  it('stops updates when component unmounts', () => {
    const cancelAnimationFrameSpy = jest.spyOn(global, 'cancelAnimationFrame');

    component.unmount();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });
});