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
  font-size: 1.2rem; /* Revert to standard size for Play/Pause */
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
  opacity: 0.9;
`;

const FooterContainer = styled.div`
    display: flex;
    align-items: center;
    line-height: 1;
    opacity: 1;
`;

const AudioPlayer = ({ src, isMe, senderProfilePic, footer }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
        if (audio.duration && audio.duration !== Infinity && !isNaN(audio.duration)) {
            setDuration(audio.duration);
        }
    };

    const handleLoadedData = () => {
        // Workaround for Chrome/Edge webm duration bug
        if (audio.duration === Infinity || audio.duration === 0) {
            audio.currentTime = 1e101; // Go to end
            audio.ontimeupdate = () => {
                audio.ontimeupdate = null;
                setDuration(audio.duration);
                audio.currentTime = 0; // Go back to start
            };
        } else {
            setDuration(audio.duration);
        }
    };

    const setAudioTime = () => {
        setCurrentTime(audio.currentTime);
        // Backup: if duration is still not set, try setting it
        if ((duration === 0 || duration === Infinity) && audio.duration > 0 && audio.duration !== Infinity) {
            setDuration(audio.duration);
        }
    };

    const onEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0); 
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);
    
    if(audio.readyState >= 1) handleLoadedData();

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, [duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("Playback failed", e));
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
      
      {/* Profile Pic on Left */}
      {senderProfilePic && (
          <ProfilePic src={senderProfilePic} alt="Sender" />
      )}

      {/* Play Button */}
      <ControlButton onClick={togglePlay} $isMe={isMe}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </ControlButton>
      
      {/* Waveform & Time */}
      <InfoCol>
          <VisualizerWrapper>
             <AudioVisualizer 
                currentTime={currentTime}
                duration={duration || 1} 
                isPlaying={isPlaying}
                isRecording={false}
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