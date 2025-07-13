import { useEffect, useRef, useContext } from 'react';
import { AudioCtx } from './AudioCapture';

export default function CircularOscilloscope() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const waveformData = useRef([]); // Store recent waveform samples for trails
  const { analyser, isListening } = useContext(AudioCtx);

  const maxWaveformSamples = 8; // Number of trail samples

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.3; // Much closer to center

    function drawCircularWaveform() {
      if (!analyser || !isListening) {
        // Clear canvas and draw empty circle
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw reference circle
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        animationRef.current = requestAnimationFrame(drawCircularWaveform);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      // Clear the oscilloscope canvas completely (won't affect spectrogram since it's a separate canvas)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Store current waveform data for trails
      waveformData.current.push([...dataArray]);
      if (waveformData.current.length > maxWaveformSamples) {
        waveformData.current.shift();
      }

      // Draw recent waveform samples with fading (most recent = brightest)
      const maxTrails = Math.min(maxWaveformSamples, waveformData.current.length);
      
      for (let trailIndex = 0; trailIndex < maxTrails; trailIndex++) {
        const sampleIndex = waveformData.current.length - 1 - trailIndex;
        if (sampleIndex < 0) continue;
        
        const sampleData = waveformData.current[sampleIndex];
        const alpha = Math.max(0.1, 1 - (trailIndex / maxTrails)); // Fade older trails
        
        // Draw circular waveform with fading transparency
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.7})`; // Cyan with fading alpha
        ctx.shadowColor = `rgba(0, 255, 255, ${alpha * 0.3})`;
        ctx.shadowBlur = 6;
        ctx.beginPath();

        // Draw waveform as a circle
        for (let i = 0; i < sampleData.length; i++) {
          // Convert sample to amplitude (-1 to 1)
          const amplitude = (sampleData[i] - 128) / 128;
          
          // Amplify the signal (like applying gain)
          const amplifiedAmplitude = amplitude * 3.0; // 3x amplification
          
          // Calculate angle around the circle
          const angle = (i / sampleData.length) * 2 * Math.PI;
          
          // Calculate radius with waveform data
          // Base radius + amplitude variation (closer to center)
          const waveRadius = radius + (amplifiedAmplitude * 60);
          
          // Convert polar to cartesian coordinates
          const x = centerX + Math.cos(angle) * waveRadius;
          const y = centerY + Math.sin(angle) * waveRadius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Add semi-transparent center dot
      ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
      ctx.fill();

      // Reset shadow for next frame
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(drawCircularWaveform);
    }

    drawCircularWaveform();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isListening]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="w-full h-full"
      data-testid="circular-oscilloscope-canvas"
    />
  );
}
