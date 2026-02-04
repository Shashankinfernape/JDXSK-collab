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
    let animationId;

    const render = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        }

        const width = rect.width;
        const height = rect.height;
        
        ctx.clearRect(0, 0, width, height);

        // COMPACT SETTINGS
        const barWidth = 3; 
        const gap = 2; 
        const totalBarWidth = barWidth + gap;
        const totalBars = Math.floor(width / totalBarWidth);
        
        const playedColor = isMe 
            ? 'rgba(255, 255, 255, 1.0)' 
            : (theme.colors.primary || '#007AFF');
            
        const pendingColor = isMe
            ? 'rgba(255, 255, 255, 0.4)'
            : (theme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)');

        const progressPercent = duration > 0 ? currentTime / duration : 0;
        
        // Draw Compact Centered Bars
        for (let i = 0; i < totalBars; i++) {
            const patternIndex = i % bars.length;
            const rawHeight = bars[patternIndex];
            const barHeight = Math.max(3, rawHeight * height * 0.85); 
            
            const x = i * totalBarWidth;
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
        
        // Draw Cursor Line & Handle (Knob)
        if (duration > 0) {
            const cursorX = Math.max(0, Math.min(width, progressPercent * width));
            const color = isMe ? '#FFFFFF' : (theme.colors.primary || '#007AFF');
            
            // Handle (Knob) - Made slightly larger and with a subtle glow
            ctx.beginPath();
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.arc(cursorX, height / 2, 5.5, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset
            
            // Center Dot in Knob for premium feel
            ctx.beginPath();
            ctx.arc(cursorX, height / 2, 2, 0, Math.PI * 2);
            ctx.fillStyle = isMe ? (theme.colors.primary || '#007AFF') : '#FFFFFF';
            ctx.fill();
        }

        animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
        cancelAnimationFrame(animationId);
    };
  }, [currentTime, duration, isPlaying, theme, bars, isMe]);

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