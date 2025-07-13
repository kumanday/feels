import { useEffect, useRef, useContext } from 'react';
import { AudioCtx } from './AudioCapture';

export default function CircularSpectrogram() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const frameCounter = useRef(0);
  const rotationAngle = useRef(0);
  const { analyser, isListening } = useContext(AudioCtx);
  
  // Store frequency data over time for radial time flow
  const spectrogramData = useRef([]);
  const maxTimeSlices = 200; // Number of time slices (radius steps)
  const frameSkip = 4; // Only add new time slice every 4 frames (slower flow)

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY); // Use full canvas radius

    function drawCircularSpectrogram() {
      if (!analyser || !isListening) {
        // Clear canvas and draw empty state
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw reference circles for frequency bands
        ctx.strokeStyle = 'rgba(128, 0, 128, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, (maxRadius / 4) * i, 0, 2 * Math.PI);
          ctx.stroke();
        }
        
        animationRef.current = requestAnimationFrame(drawCircularSpectrogram);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      analyser.getFloatFrequencyData(dataArray);

      // Add current frequency data as new time slice (slower rate for gradual outward flow)
      frameCounter.current++;
      if (frameCounter.current % frameSkip === 0) {
        spectrogramData.current.push([...dataArray]);
        if (spectrogramData.current.length > maxTimeSlices) {
          spectrogramData.current.shift();
        }
      }

      // Clear canvas completely each frame
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply continuous rotation for spinning effect
      rotationAngle.current += 0.06; // Fast constant rotation
      if (rotationAngle.current > 2 * Math.PI) {
        rotationAngle.current -= 2 * Math.PI; // Keep angle in 0-2π range
      }
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle.current); // Constant clockwise rotation
      ctx.translate(-centerX, -centerY);

      // Draw recent time slices with fading (most recent = outer, older = inner)
      const maxRings = Math.min(15, spectrogramData.current.length); // More rings for slower fading
      
      for (let ringIndex = 0; ringIndex < maxRings; ringIndex++) {
        const timeSliceIndex = spectrogramData.current.length - 1 - ringIndex;
        if (timeSliceIndex < 0) continue;
        
        const timeSliceData = spectrogramData.current[timeSliceIndex];
        const ringRadius = (ringIndex / maxRings) * maxRadius; // Fill ENTIRE circle (0% to 100%)
        const alpha = Math.max(0.1, 1 - (ringIndex / maxRings)); // Fade older rings
        
        for (let freqIndex = 0; freqIndex < timeSliceData.length; freqIndex++) {
          const value = timeSliceData[freqIndex];
          
          // Use EXACT same intensity calculation as traditional spectrogram
          const intensity = Math.max(0, Math.min(1, (value + 100) / 70));
          // Draw all frequencies (no threshold) to ensure full circumference coverage
          
          // Apply additional gain boost for visibility
          const boostedIntensity = Math.min(1, intensity * 2.0);
          
          // Map frequency to angle around the circle (ensure full 360° wrapping)
          const angle = (freqIndex / timeSliceData.length) * 2 * Math.PI;
          
          // Position at ring radius
          const x = centerX + Math.cos(angle) * ringRadius;
          const y = centerY + Math.sin(angle) * ringRadius;
          
          // Use intensity-based color mapping like traditional spectrogram
          const hue = 240 - boostedIntensity * 240; // Blue (240) to Red (0)
          const saturation = 100;
          const lightness = 50;
          
          // Apply fading alpha to older rings
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha * 0.9})`;
          ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha * 0.5})`;
          ctx.shadowBlur = boostedIntensity * alpha * 10;
          
          const pointSize = Math.max(2, boostedIntensity * alpha * 6);
          ctx.beginPath();
          ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      
      ctx.shadowBlur = 0;

      // Draw frequency grid lines (optional visual aid)
      ctx.strokeStyle = 'rgba(128, 0, 128, 0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * maxRadius,
          centerY + Math.sin(angle) * maxRadius
        );
        ctx.stroke();
      }

      // Draw concentric circles for time reference
      ctx.strokeStyle = 'rgba(128, 0, 128, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (maxRadius / 4) * i, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Center indicator
      ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 2, 0, 2 * Math.PI);
      ctx.fill();
      
      // Restore canvas transformation to prevent accumulation
      ctx.restore();

      animationRef.current = requestAnimationFrame(drawCircularSpectrogram);
    }

    drawCircularSpectrogram();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isListening]);

  // Clear spectrogram data when audio stops
  useEffect(() => {
    if (!isListening) {
      spectrogramData.current = [];
    }
  }, [isListening]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="w-full h-full"
      data-testid="circular-spectrogram-canvas"
    />
  );
}
