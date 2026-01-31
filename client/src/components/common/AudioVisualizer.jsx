import React, { useRef, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const VisualizerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  touch-action: none; /* Prevent scroll while dragging */
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const AudioVisualizer = ({ currentTime, duration, isPlaying, onSeek }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  // Generate a pleasing static waveform pattern
  const bars = useMemo(() => {
      const count = 50; 
      const data = [];
      for (let i = 0; i < count; i++) {
          // Symmetric mirroring for a nicer look
          const x = i / count * Math.PI * 4; // 2 periods
          const noise = Math.random() * 0.3;
          const val = Math.abs(Math.sin(x)) * 0.6 + 0.2 + noise;
          data.push(Math.min(1.0, val));
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

  const onMouseDown = (e) => {
      setIsDragging(true);
      handleInteraction(e.clientX);
  };

  const onTouchStart = (e) => {
      setIsDragging(true);
      handleInteraction(e.touches[0].clientX);
  };

  // Add global listeners for drag release
  useEffect(() => {
      const onMouseMove = (e) => {
          if (isDragging) handleInteraction(e.clientX);
      };

      const onTouchMove = (e) => {
          if (isDragging) handleInteraction(e.touches[0].clientX);
      };

      const onMouseUp = () => {
          setIsDragging(false);
      };

      const onTouchEnd = () => {
          setIsDragging(false);
      };

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
      // Disable dependency warning for handleInteraction as it's stable enough or we can't wrap it easily without refactoring
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]); 

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Handle High DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    
    ctx.clearRect(0, 0, width, height);

    const barCount = bars.length;
    const gap = 2;
    const barWidth = (width - (gap * (barCount - 1))) / barCount;
    
    // Colors
    const playedColor = theme.colors.primary || '#007AFF';
    const pendingColor = theme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
    // Removed unused knobColor

    const progressPercent = duration > 0 ? currentTime / duration : 0;
    
    // 1. Draw Bars
    bars.forEach((heightPct, i) => {
        const barHeight = heightPct * height * 0.8; // 80% height max
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;
        
        // Check if this bar is "played"
        // Use center of bar for comparison
        const barCenterPercent = (i + 0.5) / barCount;
        const isPlayed = barCenterPercent <= progressPercent;

        ctx.fillStyle = isPlayed ? playedColor : pendingColor;
        
        // Rounded Rect
        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight - radius);
        ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
        ctx.lineTo(x + radius, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();
    });

    // 2. Draw Knob (Scrubber Head)
    const knobX = progressPercent * width;
    const knobY = height / 2;
    
    // Only draw knob if we have started playing or dragging
    if (progressPercent > 0 || isDragging) {
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 4;
        
        ctx.beginPath();
        ctx.arc(knobX, knobY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF'; // Always white for contrast
        ctx.fill();
        
        // Ring
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = playedColor;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }

  }, [currentTime, duration, isPlaying, theme, bars, isDragging]);

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