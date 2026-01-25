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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${props => props.theme.colors.bubbleMe}; /* Border to blend */
  flex-shrink: 0;
  
  /* Place it overlapping the button slightly if desired, or just next to it */
  margin-right: -10px; /* Slight overlap with play button for that WhatsApp group feel? Or standard */
  margin-right: 0;
  z-index: 1;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$isMe ? '#FFF' : props.theme.colors.textPrimary};
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  /* Circle bg if needed, else transparent */
  
  &:hover {
    opacity: 0.8;
  }
`;

const VisualizerWrapper = styled.div`
  flex: 1;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-left: 4px;
`;

const Duration = styled.span`
  font-size: 0.7rem;
  color: ${props => props.$isMe ? 'rgba(255,255,255,0.8)' : props.theme.colors.textSecondary};
  min-width: 30px;
  text-align: right;
  margin-left: 4px;
`;

const AudioPlayer = ({ src, isMe, senderProfilePic }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <PlayerContainer>
      <audio ref={audioRef} src={src} preload="metadata" crossOrigin="anonymous" />
      
      {senderProfilePic && (
          <ProfilePic src={senderProfilePic} alt="Sender" />
      )}

      <ControlButton onClick={togglePlay} $isMe={isMe}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </ControlButton>
      
      <VisualizerWrapper>
         <AudioVisualizer 
            audioRef={audioRef} 
            isPlaying={isPlaying} 
            isRecording={false}
         />
      </VisualizerWrapper>
      
      <Duration $isMe={isMe}>
        {formatTime(currentTime > 0 ? currentTime : duration)}
      </Duration>
    </PlayerContainer>
  );
};

export default AudioPlayer;