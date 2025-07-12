// src/lib/visualizations.js
// Visualization utility functions

export function drawOscilloscope(canvas, data) {
  if (!canvas || !data) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  const sliceWidth = width / data.length;
  let x = 0;
  
  for (let i = 0; i < data.length; i++) {
    const v = data[i] * height / 2;
    const y = height / 2 + v;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    x += sliceWidth;
  }
  
  ctx.stroke();
}

export function drawSpectrogram(canvas, data) {
  if (!canvas || !data) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, width, height);
  
  // Draw frequency data as vertical bars
  const barWidth = width / data.length;
  
  for (let i = 0; i < data.length; i++) {
    const barHeight = (data[i] + 140) * height / 140; // Normalize dB values
    const hue = (i / data.length) * 360;
    
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
  }
}
