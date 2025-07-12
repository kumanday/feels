import { initializeAudioContext, getUserMediaStream, createAnalyser } from '../src/lib/audioHandler'; // Assuming modular structure as per PRD

// Mock browser APIs for unit testing
global.navigator = {
  mediaDevices: {
    getUserMedia: jest.fn(() => Promise.resolve({})),
  },
};
global.AudioContext = jest.fn().mockImplementation(() => ({
  createAnalyser: () => ({
    fftSize: 2048,
    getFloatTimeDomainData: jest.fn((array) => array.fill(0)),
    getFloatFrequencyData: jest.fn((array) => array.fill(-100)),
    connect: jest.fn(),
  }),
  createMediaStreamSource: jest.fn(),
  resume: jest.fn(),
}));

describe('Audio Processing Functions', () => {
  let audioContext;
  let analyser;

  beforeEach(async () => {
    audioContext = await initializeAudioContext();
    analyser = createAnalyser(audioContext);
    // Mock frequencyBinCount for buffer length calculations
    analyser.frequencyBinCount = 1024;
  });

  test('initAudioContext creates and returns an AudioContext instance', async () => {
    expect(audioContext).toBeDefined();
    expect(audioContext.createAnalyser).toBeDefined();
  });

  test('processAudioData retrieves time-domain data as Float32Array', () => {
    const { timeData } = require('../src/lib/audioHandler').processAudioData(analyser);
    expect(timeData).toBeInstanceOf(Float32Array);
    expect(timeData.length).toBe(1024); // Frequency bin count
  });

  test('processAudioData retrieves frequency-domain data as Float32Array', () => {
    const { frequencyData } = require('../src/lib/audioHandler').processAudioData(analyser);
    expect(frequencyData).toBeInstanceOf(Float32Array);
    expect(frequencyData.length).toBe(1024); // Frequency bin count
  });

  test('handles errors when microphone access is denied', async () => {
    global.navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
    await expect(getUserMediaStream()).rejects.toThrow('Permission denied');
  });
});