import '@testing-library/jest-dom'

// Mock Web Audio API
global.AudioContext = jest.fn(() => ({
  resume: jest.fn(() => Promise.resolve()),
  createMediaStreamSource: jest.fn(() => ({})),
  createAnalyser: jest.fn(() => ({
    fftSize: 2048,
    connect: jest.fn(),
    getFloatTimeDomainData: jest.fn(),
    getFloatFrequencyData: jest.fn(),
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { value: 1 }
  })),
  destination: {}
}))

// Mock canvas getContext with comprehensive 2D context
const mockContext = {
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  arc: jest.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  translate: jest.fn(),
  transform: jest.fn(),
  setTransform: jest.fn(),
};

HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === '2d') {
    return mockContext;
  }
  return null;
});

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: jest.fn(() => Promise.resolve({
    getTracks: jest.fn(() => [{ stop: jest.fn() }])
  })),
}
