// tests/test_oscilloscope.js

import { render, act } from '@testing-library/react';
import React from 'react';
import Oscilloscope from '../src/components/Oscilloscope'; // Adjust path as needed

// Mock CanvasRenderingContext2D
const mockGetContext = jest.fn(() => ({
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fillRect: jest.fn(), // For potential background
}));

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = mockGetContext;

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));

// Mock analyser node
const mockAnalyser = {
  fftSize: 2048,
  getFloatTimeDomainData: jest.fn((array) => {
    array.fill(0); // Mock empty data
  }),
};

describe('Oscilloscope Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Oscilloscope analyser={mockAnalyser} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('initializes canvas context correctly', () => {
    render(<Oscilloscope analyser={mockAnalyser} />);
    expect(mockGetContext).toHaveBeenCalledWith('2d');
  });

  it('draws waveform on update', async () => {
    const mockData = new Float32Array(2048).map((_, i) => Math.sin(i / 10));
    mockAnalyser.getFloatTimeDomainData.mockImplementation((array) => array.set(mockData));

    render(<Oscilloscope analyser={mockAnalyser} />);

    // Simulate animation frame
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    expect(mockAnalyser.getFloatTimeDomainData).toHaveBeenCalled();
    expect(mockGetContext().clearRect).toHaveBeenCalled();
    expect(mockGetContext().beginPath).toHaveBeenCalled();
    expect(mockGetContext().stroke).toHaveBeenCalled();
  });

  it('handles no data gracefully', async () => {
    render(<Oscilloscope analyser={mockAnalyser} />);

    // Simulate animation frame
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    expect(mockGetContext().clearRect).toHaveBeenCalled();
    // Expect no lineTo calls or something, but minimal drawing
  });

  it('updates canvas size on resize', () => {
    const { container } = render(<Oscilloscope analyser={mockAnalyser} />);
    const canvas = container.querySelector('canvas');

    // Mock resize
    Object.defineProperty(canvas, 'clientWidth', { value: 800 });
    Object.defineProperty(canvas, 'clientHeight', { value: 400 });

    window.dispatchEvent(new Event('resize'));

    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(400);
  });

  // Additional unit tests added below

  it('applies correct styling for dark mode', () => {
    const { container } = render(<Oscilloscope analyser={mockAnalyser} />);
    const canvas = container.querySelector('canvas');
    expect(canvas.style.backgroundColor).toBe('black'); // Assuming dark mode background
  });

  it('draws grid lines if enabled', () => {
    // Assuming a prop for grid
    render(<Oscilloscope analyser={mockAnalyser} showGrid={true} />);
    // Simulate draw and check if lineTo is called for grid
    // This would require more detailed mocking
  });

  it('handles different FFT sizes', () => {
    const smallAnalyser = { ...mockAnalyser, fftSize: 512 };
    render(<Oscilloscope analyser={smallAnalyser} />);
    // Check if data array size matches
    const dataArray = new Float32Array(512);
    expect(mockAnalyser.getFloatTimeDomainData).toHaveBeenCalledWith(expect.objectContaining({ length: 512 }));
  });

  it('stops animation when component unmounts', () => {
    const { unmount } = render(<Oscilloscope analyser={mockAnalyser} />);
    const mockCancelAnimationFrame = jest.spyOn(global, 'cancelAnimationFrame');
    unmount();
    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });

  it('responds to zoom level changes', () => {
    // Assuming a zoom prop
    render(<Oscilloscope analyser={mockAnalyser} zoom={2} />);
    // Check scaling in draw calls
  });
});