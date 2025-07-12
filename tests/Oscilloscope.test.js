// tests/Oscilloscope.test.js

import { render, act } from '@testing-library/react';
import React, { useRef, useEffect } from 'react';
import { AudioCtx } from '../src/components/AudioCapture'; // Adjust path as needed
import Oscilloscope from '../src/components/Oscilloscope'; // Adjust path as needed

// Mock the AudioCtx
const mockAnalyser = {
  frequencyBinCount: 1024,
  getFloatTimeDomainData: jest.fn(),
};

const mockContextValue = {
  analyser: mockAnalyser,
  isListening: true,
};

// Mock requestAnimationFrame
const mockRaf = jest.fn(() => 1);
global.requestAnimationFrame = mockRaf;
global.cancelAnimationFrame = jest.fn();

// Mock canvas context methods
const mockGetContext = jest.fn(() => ({
  fillStyle: '',
  fillRect: jest.fn(),
  lineWidth: 0,
  strokeStyle: '',
  beginPath: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  clearRect: jest.fn(),
}));

describe('Oscilloscope Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.requestAnimationFrame.mockClear();
    global.cancelAnimationFrame.mockClear();
    mockAnalyser.getFloatTimeDomainData.mockImplementation((array) => {
      array.fill(0.5); // Simulate some waveform data
    });
  });

  it('renders canvas element', () => {
    const { container } = render(
      <AudioCtx.Provider value={mockContextValue}>
        <Oscilloscope />
      </AudioCtx.Provider>
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('draws waveform when active', async () => {
    const mockCanvas = {
      getContext: mockGetContext,
      width: 800,
      height: 400,
    };

    jest.mock('react', () => ({
      ...jest.requireActual('react'),
      useRef: () => ({ current: mockCanvas }),
      useEffect: jest.fn((fn) => fn()), // Immediately invoke effect for testing
    }));

    render(
      <AudioCtx.Provider value={mockContextValue}>
        <Oscilloscope />
      </AudioCtx.Provider>
    );

    // Simulate useEffect
    await act(async () => {
      await Promise.resolve(); // Allow effects to run
    });

    expect(mockRaf).toHaveBeenCalled();
  });

  it('does not draw when not active', async () => {
    const inactiveContext = { ...mockContextValue, isListening: false };

    render(
      <AudioCtx.Provider value={inactiveContext}>
        <Oscilloscope />
      </AudioCtx.Provider>
    );

    // Simulate useEffect
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRaf).not.toHaveBeenCalled();
    expect(mockAnalyser.getFloatTimeDomainData).not.toHaveBeenCalled();
  });
});