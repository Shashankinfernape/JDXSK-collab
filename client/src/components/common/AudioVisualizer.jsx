import React, { useRef, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const VisualizerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  touch-action: none;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const AudioVisualizer = ({ currentTime, duration, isPlaying, onSeek, isMe }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  // RESTORED: Original "Random Bar" Pattern (Compact Look)
  const bars = useMemo(() => {
      const count = 45; // Original count
      const data = [];
      for (let i = 0; i < count; i++) {
          // Original Algorithm: Sine + Random Noise
          const val = Math.sin(i * 0.2) * 0.5 + 0.5; 
          const height = Math.max(0.2, val * Math.random() * 0.8 + 0.2); 
          data.push(height);
      }
      return data;
  }, []);

  const handleInteraction = (clientX) => {
      if (!containerRef.current || duration <= 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.min(1, Math.max(0, x / rect.width));
      onSeek && onSeek(percent * duration);
  };

  const onMouseDown = (e) => { setIsDragging(true); handleInteraction(e.clientX); };
  const onTouchStart = (e) => { setIsDragging(true); handleInteraction(e.touches[0].clientX); };

  useEffect(() => {
      const onMouseMove = (e) => { if (isDragging) handleInteraction(e.clientX); };
      const onTouchMove = (e) => { if (isDragging) handleInteraction(e.touches[0].clientX); };
      const onMouseUp = () => setIsDragging(false);
      const onTouchEnd = () => setIsDragging(false);

      if (isDragging) {
          window.addEventListener('mouseup', onMouseUp);
          window.addEventListener('touchend', onTouchEnd);
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('touchmove', onTouchMove);
      }
      return () => {
          window.removeEventListener('mouseup', onMouseUp);
          window.removeEventListener('touchend', onTouchEnd);
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('touchmove', onTouchMove);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    
    ctx.clearRect(0, 0, width, height);

    // COMPACT SETTINGS
    const barWidth = 2; // Thinner bars for sleek look
    const gap = 2;
    const totalBarWidth = barWidth + gap;
    const totalBars = Math.floor(width / totalBarWidth);
    
    // Colors
    // If isMe (sent message), use White for played, Faint White for pending
    // If !isMe (received), use Primary for played, Faint Gray/White for pending
    const playedColor = isMe 
        ? 'rgba(255, 255, 255, 0.95)' 
        : (theme.colors.primary || '#007AFF');
        
    const pendingColor = isMe
        ? 'rgba(255, 255, 255, 0.4)'
        : (theme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)');

    const progressPercent = duration > 0 ? currentTime / duration : 0;
    
    // Draw Compact Centered Bars
    for (let i = 0; i < totalBars; i++) {
        // Recycle pattern
        const patternIndex = i % bars.length;
        const rawHeight = bars[patternIndex];
        
        // CRITICAL FIX: Scale height to 50% of container to prevent "huge" look
        // Standardize amplitude so it looks like a voice note, not a wall
        const barHeight = Math.max(3, rawHeight * height * 0.5); 
        
        const x = i * totalBarWidth;
        const y = (height - barHeight) / 2; // Perfect vertical center

        const isPlayed = (i / totalBars) < progressPercent;
        
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineWidth = barWidth;
        ctx.moveTo(x + barWidth/2, y);
        ctx.lineTo(x + barWidth/2, y + barHeight);
        ctx.strokeStyle = isPlayed ? playedColor : pendingColor;
        ctx.stroke();
    }
    
    // No Knob - Just clean bars

  }, [currentTime, duration, isPlaying, theme, bars, isDragging, isMe]);

  return (
      <VisualizerContainer 
        ref={containerRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
          <Canvas ref={canvasRef} />
      </VisualizerContainer>
  );
};

export default AudioVisualizer;