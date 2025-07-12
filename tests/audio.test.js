// tests/audio.test.js

// Mock browser APIs
global.navigator = {
  mediaDevices: {
    getUserMedia: jest.fn(() => Promise.resolve({})),
  },
};

global.AudioContext = jest.fn(() => ({
  createMediaStreamSource: jest.fn(() => ({})),
  createAnalyser: jest.fn(() => ({
    fftSize: 2048,
    getFloatTimeDomainData: jest.fn(),
    getFloatFrequencyData: jest.fn(),
  })),
  resume: jest.fn(),
}));

// Assuming audio functions are in a module, e.g., lib/audio.js
// Functions: initAudio(), stopAudio(), getTimeDomainData(), getFrequencyData()

import { validateFFTSize, getNextValidFFTSize, AudioProcessor } from '../src/lib/audio'; // Adjust path as needed

describe('Audio Processing', () => {
  let audioContext;
  let analyser;

  beforeEach(async () => {
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    // Mock successful initialization
    global.navigator.mediaDevices.getUserMedia.mockResolvedValue({});
  });

  test('validates FFT size correctly', () => {
    expect(validateFFTSize(2048)).toBe(true);
    expect(validateFFTSize(1000)).toBe(false);
    expect(validateFFTSize(4096)).toBe(true);
  });

  test('gets next valid FFT size', () => {
    expect(getNextValidFFTSize(1000)).toBe(1024);
    expect(getNextValidFFTSize(3000)).toBe(2048);
    expect(getNextValidFFTSize(2048)).toBe(2048);
  });

  test('creates AudioProcessor correctly', () => {
    const processor = new AudioProcessor(analyser);
    expect(processor.analyser).toBe(analyser);
    expect(processor.bufferLength).toBe(analyser.frequencyBinCount);
  });

  test('AudioProcessor can get time data', () => {
    const processor = new AudioProcessor(analyser);
    const timeData = processor.getTimeData();
    expect(timeData).toBeInstanceOf(Float32Array);
    expect(analyser.getFloatTimeDomainData).toHaveBeenCalled();
  });

  test('AudioProcessor can get frequency data', () => {
    const processor = new AudioProcessor(analyser);
    const frequencyData = processor.getFrequencyData();
    expect(frequencyData).toBeInstanceOf(Float32Array);
    expect(analyser.getFloatFrequencyData).toHaveBeenCalled();
  });

  test('AudioProcessor handles invalid analyser gracefully', () => {
    const invalidAnalyser = null;
    expect(() => new AudioProcessor(invalidAnalyser)).toThrow();
  });
});