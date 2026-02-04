import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause } from 'react-icons/fa';
import AudioVisualizer from '../common/AudioVisualizer';

const PlayerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px; 
  width: 310px; 
  min-width: 270px;
  padding: 6px 4px 4px 4px;
`;

const ProfilePic = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1.5px solid rgba(255,255,255,0.15);
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$isMe ? 'rgba(255,255,255,1)' : props.theme.colors.textBubbleOther};
  cursor: pointer;
  font-size: 1.5rem; 
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
  width: 100%;
  height: 22px; 
  display: flex;
  align-items: center;
  margin: 0;
`;

const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  height: 38px; 
  flex: 1;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 2px;
  margin-top: -2px;
`;

const Duration = styled.span`
  font-size: 0.75rem;
  color: ${props => props.$isMe ? 'rgba(255,255,255,0.9)' : props.theme.colors.textSecondary};
  line-height: 1;
  font-weight: 400;
  min-width: 35px;
  margin-left: 2px;
`;

const FooterContainer = styled.div`
    display: flex;
    align-items: center;
    line-height: 1;
    opacity: 0.9;
    transform: translateY(2px); 
`;

const AudioPlayer = ({ src, isMe, senderProfilePic, footer, duration: initialDuration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const audioRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // If we get a valid duration from props, use it
    if (initialDuration && !isNaN(initialDuration) && initialDuration !== Infinity) {
        setDuration(initialDuration);
    }
  }, [initialDuration]);

  // Handle Seek Logic
  const handleSeek = (newTime) => {
      if (audioRef.current) {
          // Robustness check for duration
          const maxTime = audioRef.current.duration || duration;
          const targetTime = Math.min(newTime, maxTime);
          
          audioRef.current.currentTime = targetTime;
          setCurrentTime(targetTime);
      }
  };

  const updateProgress = useCallback(() => {
      if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          
          // Fallback duration update if it was 0 or Infinity
          if ((duration === 0 || duration === Infinity) && audioRef.current.duration && audioRef.current.duration !== Infinity) {
              setDuration(audioRef.current.duration);
          }
          
          animationRef.current = requestAnimationFrame(updateProgress);
      }
  }, [duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateDuration = () => {
        if (audio.duration && audio.duration !== Infinity && !isNaN(audio.duration)) {
            setDuration(audio.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) audioRef.current.currentTime = 0;
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

    const handleError = (e) => {
        console.error("Audio Playback Error:", src, audio.error);
        setIsPlaying(false);
    };

    // Events
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    
    if (audio.readyState >= 1) updateDuration();

    return () => {
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('durationchange', updateDuration);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('error', handleError);
        cancelAnimationFrame(animationRef.current);
    };
  }, [src, updateProgress]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play().catch(e => {
            console.error("Playback failed", e);
            setIsPlaying(false);
        });
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === Infinity) return "0:00";
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
      />
      
      {senderProfilePic && (
          <ProfilePic src={senderProfilePic} alt="Sender" />
      )}

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
                {/* Show current time if playing or seeked, otherwise total duration */}
                {formatTime(isPlaying || (currentTime > 0 && currentTime < duration - 0.1) ? currentTime : duration)}
            </Duration>
            {footer && <FooterContainer>{footer}</FooterContainer>}
          </BottomRow>
      </InfoCol>

    </PlayerContainer>
  );
};

export default AudioPlayer;