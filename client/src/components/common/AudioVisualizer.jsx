import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const AudioVisualizer = ({ stream, audioRef, isRecording, isPlaying }) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const initAudio = async () => {
      if (!stream && !audioRef) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      
      if (ctx.state === 'suspended') await ctx.resume();

      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 256; // Higher resolution for waveform
        analyserRef.current.smoothingTimeConstant = 0.5; // Smoother
      }

      const analyser = analyserRef.current;

      if (sourceRef.current) sourceRef.current.disconnect();

      if (isRecording && stream) {
        sourceRef.current = ctx.createMediaStreamSource(stream);
        sourceRef.current.connect(analyser);
      } else if (isPlaying && audioRef && audioRef.current) {
        if (!audioRef.current._source) {
             sourceRef.current = ctx.createMediaElementSource(audioRef.current);
             audioRef.current._source = sourceRef.current;
        } else {
            sourceRef.current = audioRef.current._source;
        }
        sourceRef.current.connect(analyser);
        analyser.connect(ctx.destination);
      }

      draw();
    };

    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, width, height);
      
      // WhatsApp Style: Mirrored Bars
      const barWidth = 3;
      const gap = 2;
      const barCount = Math.floor(width / (barWidth + gap));
      const step = Math.floor(bufferLength / barCount);

      ctx.fillStyle = isRecording ? '#ff3b30' : '#4285F4'; // Red recording, Blue playing
      // Use round line caps for drawing
      ctx.lineCap = 'round';
      ctx.lineWidth = barWidth;
      ctx.strokeStyle = isRecording ? '#ff3b30' : '#8e8e93'; // Grey for playback default?
      if (isPlaying) ctx.strokeStyle = '#4285F4'; // Active color

      for (let i = 0; i < barCount; i++) {
        let value = dataArray[i * step];
        
        // Normalize value (0-255) to height (0 - height/2)
        let percent = value / 255;
        // Make it non-linear for better visual
        percent = percent * percent; 
        
        let barHeight = Math.max(4, percent * (height * 0.8)); // Min height 4px
        
        const x = i * (barWidth + gap) + barWidth / 2;
        const yCenter = height / 2;
        
        ctx.beginPath();
        ctx.moveTo(x, yCenter - barHeight / 2);
        ctx.lineTo(x, yCenter + barHeight / 2);
        ctx.stroke();
      }
      
      if (isRecording || isPlaying) {
        animationIdRef.current = requestAnimationFrame(draw);
      }
    };

    if (isRecording || isPlaying) {
        initAudio();
    } else {
        if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
        // Draw static line or clear
        if (canvasRef.current) {
             const ctx = canvasRef.current.getContext('2d');
             ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
             
             // Draw static waveform hint (dots)
             const width = canvasRef.current.width;
             const height = canvasRef.current.height;
             ctx.fillStyle = '#ccc';
             for(let i=0; i<width; i+=5) {
                 ctx.fillRect(i, height/2 - 1, 3, 2);
             }
        }
    }

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [stream, audioRef, isRecording, isPlaying]);

  return <Canvas ref={canvasRef} width={200} height={40} />;
};

export default AudioVisualizer;