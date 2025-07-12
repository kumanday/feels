'use client';

import React, { useContext, useEffect, useRef } from 'react';
import { AudioCtx } from './AudioCapture'; // Assuming AudioCapture.js is in the same directory

const Spectrogram = () => {
  const { analyser, isListening } = useContext(AudioCtx);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!analyser || !isListening) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const binCount = analyser.frequencyBinCount;
    const dataArray = new Float32Array(binCount);

    // Initial clear
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);

    let animationFrameId;

    const draw = () => {
      analyser.getFloatFrequencyData(dataArray);

      // Shift the canvas left by 1 pixel
      ctx.drawImage(canvas, 1, 0, width - 1, height, 0, 0, width - 1, height);

      // Draw new vertical slice on the right
      for (let y = 0; y < height; y++) {
        // Map y to bin (low freq at bottom, high at top)
        const bin = Math.floor((height - 1 - y) / (height - 1) * (binCount - 1));
        const value = dataArray[bin];
        const intensity = Math.max(0, Math.min(1, (value + 100) / 70));
        ctx.fillStyle = intensity === 0 ? 'rgb(0, 0, 0)' : `hsl(${240 - intensity * 240}, 100%, 50%)`;
        ctx.fillRect(width - 1, y, 1, 1);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser, isListening]);

  return <canvas ref={canvasRef} className="w-full h-64 bg-black" width="800" height="400" data-testid="spectrogram-canvas" />;
};

export default Spectrogram;