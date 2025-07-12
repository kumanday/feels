// tests/visualization.test.js

// Mock Canvas API for testing
const mockCanvas = {
  getContext: jest.fn(() => ({
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fillRect: jest.fn(),
  })),
  width: 800,
  height: 400,
};

global.document = {
  createElement: jest.fn((type) => {
    if (type === 'canvas') return mockCanvas;
    return {};
  }),
};

// Assuming visualization functions are in a module, e.g., lib/visualizations.js
// For oscilloscope: drawOscilloscope(canvas, data)
// For spectrogram: drawSpectrogram(canvas, data)

import { drawOscilloscope, drawSpectrogram } from '../src/lib/visualizations'; // Adjust path as per structure

describe('Visualization Functions', () => {
  let canvas;
  let ctx;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
  });

  test('drawOscilloscope clears and draws waveform', () => {
    const data = new Float32Array(2048).fill(0); // Mock time-domain data
    drawOscilloscope(canvas, data);

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  test('drawSpectrogram draws frequency slices', () => {
    const data = new Float32Array(1024).fill(-100); // Mock frequency data
    drawSpectrogram(canvas, data);

    expect(ctx.clearRect).toHaveBeenCalled(); // Or whatever the function does, e.g., scrolling
    expect(ctx.fillRect).toHaveBeenCalled(); // Assuming it draws rects for heatmap
  });

  test('drawOscilloscope handles empty data gracefully', () => {
    const data = new Float32Array(0);
    expect(() => drawOscilloscope(canvas, data)).not.toThrow();
  });

  test('drawSpectrogram maps amplitudes to colors correctly', () => {
    // More detailed test would mock color mapping, but basic call check
    const data = new Float32Array([ -Infinity, -50, 0 ]); // Various amplitudes
    drawSpectrogram(canvas, data);
    expect(typeof ctx.fillStyle).toBe('string'); // fillStyle is a property, not a function
    expect(ctx.fillRect).toHaveBeenCalled(); // Check if fillRect was called
  });
});