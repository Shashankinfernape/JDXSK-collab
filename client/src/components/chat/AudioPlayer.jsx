import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause } from 'react-icons/fa';
import AudioVisualizer from '../common/AudioVisualizer';

const PlayerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 240px; 
  padding: 8px 4px 6px 4px;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$isMe ? 'rgba(255,255,255,0.95)' : props.theme.colors.textBubbleOther};
  cursor: pointer;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  
  &:hover { opacity: 0.9; transform: scale(1.05); }
  transition: all 0.2s ease;
`;

const VisualizerWrapper = styled.div`
  flex: 1;
  height: 30px; 
  display: flex;
  align-items: center;
  margin: 0;
`;

const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  flex: 1;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 2px; 
  padding-right: 2px;
`;

const Duration = styled.span`
  font-size: 0.7rem;
  color: ${props => props.$isMe ? 'rgba(255,255,255,0.8)' : props.theme.colors.textSecondary};
  line-height: 1;
  font-weight: 400;
  min-width: 35px;
  margin-left: 2px;
`;

const FooterContainer = styled.div`
    display: flex;
    align-items: center;
    line-height: 1;
    opacity: 0.8;
    transform: scale(0.9);
`;

const AudioPlayer = ({ src, isMe, footer, duration: initialDuration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const audioRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (initialDuration) setDuration(initialDuration);
  }, [initialDuration]);

  // Handle Seek Logic
  const handleSeek = (newTime) => {
      if (audioRef.current) {
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
      }
  };

  const updateProgress = useCallback(() => {
      if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          animationRef.current = requestAnimationFrame(updateProgress);
      }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset
    if (!isPlaying) {
        cancelAnimationFrame(animationRef.current);
    }

    const updateDuration = () => {
        if (audio.duration && audio.duration !== Infinity && !isNaN(audio.duration)) {
            setDuration(audio.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        cancelAnimationFrame(animationRef.current);
    };

    const handlePlay = () => {
        setIsPlaying(true);
        animationRef.current = requestAnimationFrame(updateProgress);
    };

    const handlePause = () => {
        setIsPlaying(false);
        cancelAnimationFrame(animationRef.current);
    };

    // Events
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    if (audio.readyState >= 1) updateDuration();

    return () => {
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('durationchange', updateDuration);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        cancelAnimationFrame(animationRef.current);
    };
  }, [src, isPlaying, updateProgress]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) audio.pause();
    else audio.play().catch(e => console.error("Playback failed", e));
  };

  const formatTime = (time) => {
    if (!time || time === Infinity || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <PlayerContainer>
      <audio 
        ref={audioRef} 
        src={src} 
        preload="metadata" 
        crossOrigin="anonymous" 
        onError={(e) => {
            console.error("Audio Playback Error:", src, e.currentTarget.error);
            setIsPlaying(false);
        }}
      />
      
      <ControlButton onClick={togglePlay} $isMe={isMe}>
        {isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: '4px' }} />}
      </ControlButton>
      
      <InfoCol>
          <VisualizerWrapper>
             <AudioVisualizer 
                currentTime={currentTime}
                duration={duration || 1} 
                isPlaying={isPlaying}
                onSeek={handleSeek}
                isMe={isMe}
             />
          </VisualizerWrapper>
          <BottomRow>
            <Duration $isMe={isMe}>
                {formatTime(currentTime > 0 ? currentTime : duration)}
            </Duration>
            {footer && <FooterContainer>{footer}</FooterContainer>}
          </BottomRow>
      </InfoCol>

    </PlayerContainer>
  );
};

export default AudioPlayer;