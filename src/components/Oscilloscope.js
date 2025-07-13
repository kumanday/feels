'use client';

import React, { useContext, useEffect, useRef } from 'react';
import { AudioCtx } from './AudioCapture'; // Assuming AudioCapture.js is in the same directory

const Oscilloscope = ({ transparent = false }) => {
  const { analyser, isListening } = useContext(AudioCtx);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!analyser || !isListening) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    let animationFrameId;

    const draw = () => {
      analyser.getFloatTimeDomainData(dataArray);

      // Clear canvas (only if not in transparent mode)
      if (!transparent) {
        ctx.fillStyle = 'rgb(0, 0, 0)'; // Dark background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Clear with transparency for overlay mode
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(0, 255, 255)'; // Cyan line for visibility in dark mode
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] * (canvas.height / 2) + (canvas.height / 2); // Scale to canvas height
        if (i === 0) {
          ctx.moveTo(x, v);
        } else {
          ctx.lineTo(x, v);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser, isListening]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full bg-black"
      // Set initial dimensions, but can be resized via CSS
      width={800}
      height={400}
      data-testid="oscilloscope-canvas"
    />
  );
};

export default Oscilloscope;