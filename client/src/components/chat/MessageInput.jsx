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
  padding: 8px 8px 8px 12px; /* Reduced right padding */
  background-color: ${props => props.theme.colors.panelBackground}; /* Match footer background */
  animation: ${slideUp} 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  position: relative;
  
  /* Create a visual separation from the messages area if needed, though usually the footer bg is enough */
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
  background-color: ${props => props.theme.colors.inputBackground}; /* Distinct box color */
  border-radius: 8px;
  border-left: 5px solid ${props => props.theme.colors.primary};
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin-right: 8px; /* Reduced margin */
  /* WhatsApp often has a very subtle shadow or just the contrast */
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

const ReplyHeader = styled.div`
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
`;

const ReplySender = styled.span`
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  font-size: 0.8rem;
  margin-right: 8px;
`;

const ReplyText = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.85rem;
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
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    color: ${props => props.theme.colors.textPrimary};
  }
  
  font-size: 1.2rem;
`;

const InputForm = styled.form`
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.icon}; // Use theme icon color
  cursor: pointer;
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 50%;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.iconActive}; // Use active icon color on hover
  }
`;

// Specific style for Send button to use primary color
const SendButton = styled(IconButton)`
  color: ${props => props.theme.colors.primary}; // Use primary color
   &:hover {
    color: ${props => props.theme.colors.iconActive}; // Still use hover effect if desired
  }
`;

const TextInput = styled.input`
  flex: 1;
  background-color: ${props => props.theme.colors.inputBackground}; // Use theme input bg
  border: none;
  border-radius: 20px;
  padding: 0.7rem 1.2rem; /* slightly taller for better feel */
  color: ${props => props.theme.colors.textPrimary}; // Use primary text color
  font-size: 0.95rem;
  outline: none;
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary}; // Use secondary text for placeholder
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

