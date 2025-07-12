// src/lib/audioHandler.js
// Audio processing utility functions

export async function initializeAudioContext() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();
    return audioContext;
  } catch (error) {
    throw new Error(`Failed to initialize audio context: ${error.message}`);
  }
}

export async function getUserMediaStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  } catch (error) {
    throw new Error(`Failed to get user media: ${error.message}`);
  }
}

export function createAnalyser(audioContext, fftSize = 2048) {
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = 0.8;
  return analyser;
}

export function connectAudioNodes(audioContext, stream, analyser) {
  const source = audioContext.createMediaStreamSource(stream);
  const gainNode = audioContext.createGain();
  
  source.connect(gainNode);
  gainNode.connect(analyser);
  
  return { source, gainNode };
}

export function processAudioData(analyser) {
  const bufferLength = analyser.frequencyBinCount;
  const timeData = new Float32Array(bufferLength);
  const frequencyData = new Float32Array(bufferLength);
  
  analyser.getFloatTimeDomainData(timeData);
  analyser.getFloatFrequencyData(frequencyData);
  
  return { timeData, frequencyData };
}
