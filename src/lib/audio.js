// src/lib/audio.js
// Audio utility functions and constants

export const AUDIO_CONSTANTS = {
  SAMPLE_RATE: 44100,
  FFT_SIZES: [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768],
  DEFAULT_FFT_SIZE: 2048,
  DEFAULT_SMOOTHING: 0.8,
  MIN_DB: -100,
  MAX_DB: -30,
};

export function validateFFTSize(fftSize) {
  return AUDIO_CONSTANTS.FFT_SIZES.includes(fftSize);
}

export function getNextValidFFTSize(fftSize) {
  const sizes = AUDIO_CONSTANTS.FFT_SIZES;
  const closest = sizes.reduce((prev, curr) => 
    Math.abs(curr - fftSize) < Math.abs(prev - fftSize) ? curr : prev
  );
  return closest;
}

export function normalizeAudioLevel(value, minDb = AUDIO_CONSTANTS.MIN_DB, maxDb = AUDIO_CONSTANTS.MAX_DB) {
  return Math.max(0, Math.min(1, (value - minDb) / (maxDb - minDb)));
}

export function dbToLinear(db) {
  return Math.pow(10, db / 20);
}

export function linearToDb(linear) {
  return 20 * Math.log10(Math.max(0.000001, linear));
}

export class AudioProcessor {
  constructor(analyser) {
    this.analyser = analyser;
    this.bufferLength = analyser.frequencyBinCount;
    this.timeDataArray = new Float32Array(this.bufferLength);
    this.frequencyDataArray = new Float32Array(this.bufferLength);
  }

  getTimeData() {
    this.analyser.getFloatTimeDomainData(this.timeDataArray);
    return this.timeDataArray;
  }

  getFrequencyData() {
    this.analyser.getFloatFrequencyData(this.frequencyDataArray);
    return this.frequencyDataArray;
  }

  getRMS() {
    const timeData = this.getTimeData();
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      sum += timeData[i] * timeData[i];
    }
    return Math.sqrt(sum / timeData.length);
  }

  getPeak() {
    const timeData = this.getTimeData();
    return Math.max(...timeData);
  }
}
