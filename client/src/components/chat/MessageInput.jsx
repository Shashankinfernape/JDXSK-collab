import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { IoMdSend, IoMdClose } from 'react-icons/io';
import { BsEmojiSmile, BsKeyboard } from 'react-icons/bs';
import { useChat } from '../../context/ChatContext';
import EmojiPicker from './EmojiPicker';

// Helper for subtle borders
const subtleBorder = (theme) => `1px solid ${theme.colors.border || theme.colors.hoverBackground}`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.panelBackground};
  border-top: ${props => subtleBorder(props.theme)};
  flex-shrink: 0;
  z-index: 20; /* Ensure it stays above chat list if needed */
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ReplyPanel = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 0px 6px 0px; /* Zero horizontal padding */
  background-color: ${props => props.theme.colors.panelBackground};
  animation: ${slideUp} 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  position: relative;
  width: 100%; /* Ensure full width */
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${props => props.theme.colors.border};
    opacity: 0.5;
  }
`;

const ReplyWrapper = styled.div`
  flex: 1;
  background-color: ${props => props.theme.colors.inputBackground};
  border-radius: 6px;
  border-left: 4px solid ${props => props.theme.colors.primary};
  padding: 6px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin-left: 12px;
  margin-right: 0px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
`;

const ReplyHeader = styled.div`
  display: flex;
  align-items: baseline;
  margin-bottom: 2px;
`;

const ReplySender = styled.span`
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  font-size: 0.75rem;
  margin-right: 8px;
`;

const ReplyText = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  line-height: 1.2;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    color: ${props => props.theme.colors.textPrimary};
  }
  
  font-size: 1.1rem;
`;

const InputForm = styled.form`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.icon};
  cursor: pointer;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    color: ${props => props.theme.colors.iconActive};
  }
`;

const SendButton = styled(IconButton)`
  color: ${props => props.theme.colors.primary};
   &:hover {
    color: ${props => props.theme.colors.primary};
    background-color: transparent;
    opacity: 0.8;
  }
`;

const TextInput = styled.input`
  flex: 1;
  background-color: ${props => props.theme.colors.inputBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 14px;
  color: ${props => props.theme.colors.textPrimary};
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

// --- Component ---
const MessageInput = () => {
  const [text, setText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const { sendMessage, replyingTo, setReplyingTo } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text);
      setText('');
      setShowPicker(false); // Optional: close picker on send
    }
  };

  const handleEmojiClick = (emoji) => {
    setText(prev => prev + emoji);
  };

  return (
    <Container>
      {replyingTo && (
          <ReplyPanel>
              <ReplyWrapper>
                  <ReplyHeader>
                    <ReplySender>{replyingTo.senderId?.name || "User"}</ReplySender>
                  </ReplyHeader>
                  <ReplyText>{replyingTo.content}</ReplyText>
              </ReplyWrapper>
              <CloseButton onClick={() => setReplyingTo(null)}>
                  <IoMdClose />
              </CloseButton>
          </ReplyPanel>
      )}
      <InputForm onSubmit={handleSubmit}>
        <IconButton type="button" onClick={() => setShowPicker(!showPicker)} title={showPicker ? "Keyboard" : "Emoji & Stickers"}> 
            {showPicker ? <BsKeyboard /> : <BsEmojiSmile />} 
        </IconButton>
        <TextInput
            type="text"
            placeholder="Type a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setShowPicker(false)} // Optional: close picker when typing
        />
        {text.trim() && (
            <SendButton type="submit"> <IoMdSend /> </SendButton>
        )}
      </InputForm>
      {showPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
    </Container>
  );
};

export default MessageInput;

