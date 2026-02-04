import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { IoMdSend, IoMdClose } from 'react-icons/io';
import { MdMic, MdOutlineEmojiEmotions } from 'react-icons/md';
import { useChat } from '../../context/ChatContext';
import EmojiPicker from './EmojiPicker';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 59, 48, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 59, 48, 0); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: transparent; 
  padding: 0 10px 10px 10px; 
  flex-shrink: 0;
  position: relative; 
  z-index: 20;
`;

const InputBubble = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.inputBackground};
  border-radius: 24px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s ease;
  
  ${props => props.$isReplying && `
    border-radius: 16px; 
    padding-top: 4px;
  `}
`;

const ReplyPreview = styled.div`
  margin: 0 4px 4px 4px;
  width: calc(100% - 8px);
  background-color: ${props => props.theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'};
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  padding: 6px 12px 6px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: ${slideUp} 0.2s ease-out;
  cursor: default;

  &::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0; width: 4px;
    background-color: ${props => props.theme.colors.primary};
  }
`;

const ReplyContent = styled.div`
  display: flex; flex-direction: column; overflow: hidden; flex: 1;
`;

const ReplySender = styled.span`
  color: ${props => props.theme.colors.primary};
  font-weight: 700; font-size: 0.75rem; margin-bottom: 2px;
`;

const ReplyText = styled.span`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.8;
`;

const CloseButton = styled.button`
  background: none; border: none; color: ${props => props.theme.colors.textSecondary};
  cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; margin-left: 8px;
  &:hover { background-color: ${props => props.theme.colors.hoverBackground}; }
  font-size: 1.2rem;
`;

const InputRow = styled.form`
  display: flex; align-items: center; padding: 6px 8px; min-height: 48px;
`;

const IconButton = styled.button`
  background: transparent; border: none; color: ${props => props.theme.colors.icon};
  cursor: pointer; font-size: 1.6rem; 
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 50%; 
  transition: all 0.2s ease; flex-shrink: 0;
  &:hover { color: ${props => props.theme.colors.iconActive}; background-color: ${props => props.theme.colors.hoverBackground}; }
`;

const SendButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: #FFFFFF; border: none; width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
  cursor: pointer; transition: transform 0.2s, filter 0.2s; margin-left: 6px; flex-shrink: 0;
  &:hover { filter: brightness(1.1); transform: scale(1.05); }
  &:active { transform: scale(0.95); }
  svg { display: block; }
`;

const MicButton = styled(SendButton)`
  background-color: ${props => props.theme.colors.primary}; 
  svg { font-size: 1.35rem; }
  ${props => props.$recording && css`
    transform: scale(1.2);
    animation: ${pulse} 1.5s infinite;
  `}
`;

const TextInput = styled.input`
  flex: 1; background: transparent; border: none; padding: 8px 8px;
  color: ${props => props.theme.colors.textPrimary}; font-size: 0.95rem; outline: none;
  &::placeholder { color: ${props => props.theme.colors.textSecondary}; }
`;

const RecordingIndicator = styled.div`
  flex: 1; display: flex; align-items: center; gap: 12px;
  color: ${props => props.theme.colors.textPrimary};
  font-weight: 700; font-size: 1.1rem;
  padding-left: 10px;
  animation: ${slideUp} 0.2s ease-out;
  span:first-of-type { color: #ff3b30; min-width: 45px; }
`;

const RecDot = styled.div`
  width: 10px; height: 10px; background-color: #ff3b30; border-radius: 50%;
  animation: ${pulse} 1s infinite;
`;

const MessageInput = () => {
  const [text, setText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  const [recordingTime, setRecordingTime] = useState(0);
  
  const { sendMessage, sendFileMessage, replyingTo, setReplyingTo } = useChat();
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const startTimeRef = useRef(0); 
  const streamRef = useRef(null);

  useEffect(() => {
      let interval;
      if (isRecording) {
          setRecordingTime(0);
          interval = setInterval(() => { setRecordingTime(prev => prev + 1); }, 1000);
      } else {
          setRecordingTime(0);
      }
      return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (replyingTo && inputRef.current) inputRef.current.focus();
  }, [replyingTo]);

  const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startRecording = async (e) => {
      if (e) e.preventDefault();
      if (isRecording || isUploading) return;
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
          const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];
          recorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
          recorder.onstop = async () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
              if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); }
              if (audioBlob.size > 0 && duration >= 1) {
                  setIsUploading(true);
                  const file = new File([audioBlob], "voice.webm", { type: 'audio/webm' });
                  try { await sendFileMessage(file, duration); } catch (err) { console.error("Upload failed", err); } finally { setIsUploading(false); }
              }
              setIsRecording(false);
          };
          recorder.start();
          startTimeRef.current = Date.now();
          setIsRecording(true);
      } catch (err) { console.error("Microphone error:", err); setIsRecording(false); }
  };

  const stopRecording = (e) => {
      if (e) e.preventDefault();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') { mediaRecorderRef.current.stop(); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text);
      setText('');
      setShowPicker(false);
    }
  };

  const handleEmojiClick = (emoji) => { setText(prev => prev + emoji); };

  return (
    <Container>
      <InputBubble $isReplying={!!replyingTo}>
        {replyingTo && (
            <ReplyPreview>
                <ReplyContent>
                    <ReplySender>{replyingTo.senderId?.name || "User"}</ReplySender>
                    <ReplyText>{replyingTo.content}</ReplyText>
                </ReplyContent>
                <CloseButton onClick={() => setReplyingTo(null)}><IoMdClose /></CloseButton>
            </ReplyPreview>
        )}
        
        <InputRow onSubmit={handleSubmit}>
            <IconButton type="button" onClick={() => setShowPicker(!showPicker)}> 
                <MdOutlineEmojiEmotions /> 
            </IconButton>
            
            {isRecording ? (
                <RecordingIndicator>
                    <RecDot />
                    <span>{formatTime(recordingTime)}</span>
                    <span style={{ marginLeft: 'auto', marginRight: '10px', fontSize: '0.8rem', opacity: 0.7 }}>
                        Release to send
                    </span>
                </RecordingIndicator>
            ) : (
                <TextInput
                    ref={inputRef}
                    type="text"
                    placeholder="Type a message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onFocus={() => setShowPicker(false)}
                />
            )}
            
            {text.trim() ? (
                <SendButton type="submit"> <IoMdSend style={{ marginLeft: '2px' }} /> </SendButton>
            ) : (
                <MicButton 
                    type="button" 
                    $recording={isRecording}
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    onContextMenu={(e) => e.preventDefault()}
                > 
                    <MdMic /> 
                </MicButton>
            )}
        </InputRow>
      </InputBubble>
      {showPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
    </Container>
  );
};

export default MessageInput;