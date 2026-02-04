import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const VisualizerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  touch-action: none;
  display: flex;
  align-items: center;
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

  // KNOB SETTINGS
  const knobRadius = 6;
  const hPadding = knobRadius + 2; // Extra room for shadow/glow

  // RESTORED: Original "Random Bar" Pattern (Compact Look)
  const bars = useMemo(() => {
      const count = 60; // Increased count for smoother look
      const data = [];
      for (let i = 0; i < count; i++) {
          const val = Math.sin(i * 0.2) * 0.5 + 0.5; 
          const height = Math.max(0.2, val * Math.random() * 0.8 + 0.2); 
          data.push(height);
      }
      return data;
  }, []);

  const handleInteraction = useCallback((clientX) => {
      if (!containerRef.current || duration <= 0 || isNaN(duration) || duration === Infinity) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      const x = clientX - rect.left - hPadding;
      const innerWidth = rect.width - (hPadding * 2);
      
      const percent = Math.min(1, Math.max(0, x / innerWidth));
      onSeek && onSeek(percent * duration);
  }, [duration, onSeek, hPadding]);

  const onMouseDown = (e) => { 
      setIsDragging(true); 
      handleInteraction(e.clientX); 
  };
  
  const onTouchStart = (e) => { 
      setIsDragging(true); 
      handleInteraction(e.touches[0].clientX); 
  };

  useEffect(() => {
      if (!isDragging) return;

      const onMouseMove = (e) => handleInteraction(e.clientX);
      const onTouchMove = (e) => handleInteraction(e.touches[0].clientX);
      const onMouseUp = () => setIsDragging(false);
      const onTouchEnd = () => setIsDragging(false);

      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchend', onTouchEnd);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('touchmove', onTouchMove);
      
      return () => {
          window.removeEventListener('mouseup', onMouseUp);
          window.removeEventListener('touchend', onTouchEnd);
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('touchmove', onTouchMove);
      };
  }, [isDragging, handleInteraction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
    }

    const width = rect.width;
    const height = rect.height;
    const innerWidth = width - (hPadding * 2);
    
    ctx.clearRect(0, 0, width, height);

    // COMPACT SETTINGS
    const barWidth = 2.5; 
    const gap = 1.5; 
    const totalBarWidth = barWidth + gap;
    const totalBars = Math.floor(innerWidth / totalBarWidth);
    
    const playedColor = isMe 
        ? 'rgba(255, 255, 255, 1.0)' 
        : (theme.colors.primary || '#007AFF');
        
    const pendingColor = isMe
        ? 'rgba(255, 255, 255, 0.35)'
        : (theme.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)');

    const validDuration = (duration > 0 && !isNaN(duration) && duration !== Infinity) ? duration : 0;
    const progressPercent = validDuration > 0 ? currentTime / validDuration : 0;
    
    // 1. Draw Background Track Line (Subtle)
    ctx.beginPath();
    ctx.moveTo(hPadding, height / 2);
    ctx.lineTo(width - hPadding, height / 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = pendingColor;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // 2. Draw Waveform Bars
    for (let i = 0; i < totalBars; i++) {
        const patternIndex = i % bars.length;
        const rawHeight = bars[patternIndex];
        const barHeight = Math.max(3, rawHeight * height * 0.8); 
        
        const x = hPadding + (i * totalBarWidth);
        const y = (height - barHeight) / 2;

        const isPlayed = (i / totalBars) < progressPercent;
        
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineWidth = barWidth;
        ctx.moveTo(x + barWidth/2, y);
        ctx.lineTo(x + barWidth/2, y + barHeight);
        ctx.strokeStyle = isPlayed ? playedColor : pendingColor;
        ctx.stroke();
    }
    
    // 3. Draw Handle (Knob)
    if (validDuration > 0) {
        const cursorX = hPadding + Math.max(0, Math.min(innerWidth, progressPercent * innerWidth));
        const color = isMe ? '#FFFFFF' : (theme.colors.primary || '#007AFF');
        
        // Shadow for Knob
        ctx.beginPath();
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.arc(cursorX, height / 2, knobRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
        
        // Inner Dot
        ctx.beginPath();
        ctx.arc(cursorX, height / 2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isMe ? (theme.colors.primary || '#007AFF') : '#FFFFFF';
        ctx.fill();
    }

  }, [currentTime, duration, theme, bars, isMe, hPadding, knobRadius]);

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