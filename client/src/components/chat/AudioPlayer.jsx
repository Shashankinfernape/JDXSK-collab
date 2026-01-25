import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause } from 'react-icons/fa';
import AudioVisualizer from '../common/AudioVisualizer';

const PlayerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 200px; /* Fixed width for consistency */
  padding: 5px 0;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$isMe ? '#FFF' : props.theme.colors.textPrimary};
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  
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
`;

const Duration = styled.span`
  font-size: 0.75rem;
  color: ${props => props.$isMe ? 'rgba(255,255,255,0.8)' : props.theme.colors.textSecondary};
  min-width: 35px;
  text-align: right;
`;

const AudioPlayer = ({ src, isMe }) => {
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