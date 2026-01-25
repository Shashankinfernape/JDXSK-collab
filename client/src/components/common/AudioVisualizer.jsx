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
      
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 64; // Low resolution for bar graph
      }

      const analyser = analyserRef.current;

      // Disconnect old source if exists
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }

      if (isRecording && stream) {
        sourceRef.current = ctx.createMediaStreamSource(stream);
        sourceRef.current.connect(analyser);
      } else if (isPlaying && audioRef && audioRef.current) {
        try {
            // Check if source already exists for this element to avoid errors
            if (!audioRef.current._source) {
                 sourceRef.current = ctx.createMediaElementSource(audioRef.current);
                 audioRef.current._source = sourceRef.current; // Store it
            } else {
                sourceRef.current = audioRef.current._source;
            }
            sourceRef.current.connect(analyser);
            analyser.connect(ctx.destination); // Connect to speakers for playback
        } catch (e) {
            console.error("Audio Source Error:", e);
        }
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
      
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2; // Scale down
        
        // Dynamic color based on theme would be ideal, but hardcoding primary-ish for now
        // Or pass color prop. Let's use a nice gradient or solid.
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`; 
        if (isRecording) ctx.fillStyle = '#EA0038'; // Red for recording
        else ctx.fillStyle = '#4285F4'; // Blue for playback

        // Rounded bars logic is hard in raw canvas, just rects for now
        // Center vertically
        const y = (height - barHeight) / 2;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        x += barWidth + 2;
      }
      
      if (isRecording || isPlaying) {
        animationIdRef.current = requestAnimationFrame(draw);
      }
    };

    if (isRecording || isPlaying) {
        initAudio();
    } else {
        if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
        // Clear canvas
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      // We generally don't close AudioContext to reuse it, but can suspend
    };
  }, [stream, audioRef, isRecording, isPlaying]);

  return <Canvas ref={canvasRef} width={200} height={40} />;
};

export default AudioVisualizer;