import React, { createContext, useState } from 'react';

export const AudioCtx = createContext();

const AudioCapture = ({ children }) => {
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [gainNode, setGainNode] = useState(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const start = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support microphone access');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(mediaStream);
      const gain = ctx.createGain();
      const anal = ctx.createAnalyser();
      anal.fftSize = 2048; // Default FFT size

      source.connect(gain);
      gain.connect(anal);

      setAudioContext(ctx);
      setGainNode(gain);
      setAnalyser(anal);
      setStream(mediaStream);
      setIsListening(true);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to start audio capture');
    }
  };

  const stop = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    setAudioContext(null);
    setAnalyser(null);
    setGainNode(null);
    setStream(null);
    setIsListening(false);
    setError(null);
  };

  const setGain = (value) => {
    if (gainNode) {
      gainNode.gain.value = value;
    }
  };

  const setFftSize = (value) => {
    if (analyser) {
      // Ensure value is a power of 2 and within valid range (32 to 32768)
      const validSizes = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
      const closestSize = validSizes.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      analyser.fftSize = closestSize;
    }
  };

  return (
    <AudioCtx.Provider value={{ start, stop, analyser, gainNode, setGain, setFftSize, error, isListening }}>
      {children}
    </AudioCtx.Provider>
  );
};

export default AudioCapture;