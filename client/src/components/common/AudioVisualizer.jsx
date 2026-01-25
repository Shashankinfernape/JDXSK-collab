import React, { useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const AudioVisualizer = ({ currentTime, duration, isPlaying, isRecording }) => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  // Generate a static "fake" waveform pattern once
  // This mimics the look of a pre-analyzed audio file
  const bars = useMemo(() => {
      const count = 45; // Number of bars
      const data = [];
      for (let i = 0; i < count; i++) {
          // Generate a wave-like pattern with some randomness
          // Sine wave base + random noise
          const val = Math.sin(i * 0.2) * 0.5 + 0.5; 
          const height = Math.max(0.2, val * Math.random() * 0.8 + 0.2); 
          data.push(height);
      }
      return data;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.clearRect(0, 0, width, height);

    const barWidth = 3;
    const gap = 2;
    const totalBarWidth = barWidth + gap;
    const totalBars = Math.floor(width / totalBarWidth);
    
    // Colors
    const playedColor = isRecording ? '#ff3b30' : (theme.colors.primary || '#007AFF');
    const pendingColor = isRecording ? 'rgba(255, 59, 48, 0.3)' : (theme.isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)');

    // Calculate Progress
    // If recording, we might just show an animation or full pending
    // If playing, we show progress
    let progressPercent = 0;
    if (duration > 0) {
        progressPercent = currentTime / duration;
    }
    
    // Draw Bars
    for (let i = 0; i < totalBars; i++) {
        // Recycle the static pattern if we have more bars than pattern
        const patternIndex = i % bars.length;
        const barHeightPercent = bars[patternIndex];
        const barHeight = barHeightPercent * height;
        
        const x = i * totalBarWidth;
        const y = (height - barHeight) / 2; // Center vertically

        // Determine color based on progress
        const isPlayed = (i / totalBars) < progressPercent;
        
        ctx.fillStyle = isPlayed ? playedColor : pendingColor;
        
        // Draw rounded pill
        // Since canvas roundRect is not supported everywhere yet, use standard rect or custom path
        // Standard rect for speed/compatibility, looks fine at small scale
        // To make it look rounded, we can draw a path with lineCap
        
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineWidth = barWidth;
        ctx.moveTo(x + barWidth/2, y);
        ctx.lineTo(x + barWidth/2, y + barHeight);
        ctx.strokeStyle = isPlayed ? playedColor : pendingColor;
        ctx.stroke();
    }

  }, [currentTime, duration, isPlaying, isRecording, theme, bars]);

  return <Canvas ref={canvasRef} width={200} height={30} />;
};

export default AudioVisualizer;