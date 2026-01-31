import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause } from 'react-icons/fa';
import AudioVisualizer from '../common/AudioVisualizer';

const PlayerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 240px; 
  padding: 4px 0;
`;

const ProfilePic = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$isMe ? 'rgba(255,255,255,0.95)' : props.theme.colors.primary};
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  
  &:hover { opacity: 0.9; transform: scale(1.1); }
  transition: all 0.2s ease;
`;

const VisualizerWrapper = styled.div`
  flex: 1;
  height: 20px; 
  display: flex;
  align-items: center;
  margin-top: 2px;
`;

const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0px;
  flex: 1;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 1px;
`;

const Duration = styled.span`
  font-size: 0.75rem;
  color: ${props => props.$isMe ? '#FFFFFF' : props.theme.colors.textSecondary};
  margin-left: 2px;
  line-height: 1;
  font-weight: 600;
  opacity: 0.95;
  min-width: 35px;
  text-align: right;
`;

const FooterContainer = styled.div`
    display: flex;
    align-items: center;
    line-height: 1;
    opacity: 1;
`;

const AudioPlayer = ({ src, isMe, senderProfilePic, footer, duration: initialDuration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const audioRef = useRef(null);

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset state when source changes
    setIsPlaying(false);
    setCurrentTime(0);
    // Don't reset duration to 0 if we have initialDuration
    if (!initialDuration) setDuration(0); 

    const updateDuration = () => {
        if (audio.duration && audio.duration !== Infinity && !isNaN(audio.duration)) {
            setDuration(audio.duration);
        }
    };

    const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
        // If we didn't get duration earlier, try again (sometimes it comes late)
        if (!duration || duration === Infinity) {
            updateDuration();
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    // Events
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    // Check immediately in case it's already loaded (e.g. cache/blob)
    if (audio.readyState >= 1) {
        updateDuration();
    }

    return () => {
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('durationchange', updateDuration);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
    };
  }, [src, initialDuration, duration]); // kept deps simple but safe

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    }
    else {
      audio.play().catch(e => console.error("Playback failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    if (!time || time === Infinity || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    // Debug Log
    // console.log("AudioPlayer mounted with src:", src);
  }, [src]);

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
      
      {senderProfilePic && (
          <ProfilePic src={senderProfilePic} alt="Sender" />
      )}

      <ControlButton onClick={togglePlay} $isMe={isMe}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </ControlButton>
      
      <InfoCol>
          <VisualizerWrapper>
             <AudioVisualizer 
                currentTime={currentTime}
                duration={duration || 1} 
                isPlaying={isPlaying}
                onSeek={handleSeek}
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