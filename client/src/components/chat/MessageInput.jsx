import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { IoMdSend, IoMdClose, IoMdAdd } from 'react-icons/io';
import { BsEmojiSmile, BsMic, BsCamera, BsKeyboard } from 'react-icons/bs';
import { useChat } from '../../context/ChatContext';
import EmojiPicker from './EmojiPicker';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Helper for subtle borders - Removed or unused if transparent
// const subtleBorder = (theme) => `1px solid ${theme.colors.border || theme.colors.hoverBackground}`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: transparent; /* Transperatize */
  /* border-top: ... removed */
  flex-shrink: 0;
  position: relative; 
  z-index: 20;
  padding-bottom: 8px; /* Bottom spacing */
`;

const ReplyPanel = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px; 
  background-color: ${props => props.theme.colors.inputBackground}; /* Card background */
  border-radius: 16px; /* Rounded Layout */
  margin: 0 12px 8px 12px; /* Floating margins */
  animation: ${slideUp} 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  position: relative;
  
  border-left: 4px solid ${props => props.theme.colors.primary};
  box-shadow: 0 2px 8px rgba(0,0,0,0.1); /* Lift it up */
`;

const ReplyWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  margin-right: 8px;
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
  color: ${props => props.theme.colors.textPrimary}; /* Better contrast on inputBg */
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
  }
  font-size: 1.1rem;
`;

const InputForm = styled.form`
  padding: 0 12px;
  display: flex;
  align-items: flex-end; /* Align icons with bottom if multiline, or center */
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button`
  background: ${props => props.theme.colors.inputBackground}; /* Bubble background for icons? Or transparent? User said "transperatize icons"? No, "transperatize background... and icons". Assume transparent bg for icons. */
  background: transparent; 
  border: none;
  color: ${props => props.theme.colors.icon}; /* Ensure visible against wallpaper */
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  /* Add text-shadow or subtle bg on hover to ensure visibility */
  &:hover {
    color: ${props => props.theme.colors.iconActive};
    background-color: rgba(128, 128, 128, 0.1);
  }
`;

const TextInput = styled.input`
  flex: 1;
  background-color: ${props => props.theme.colors.inputBackground};
  border: none;
  border-radius: 24px; /* Fully rounded pill */
  padding: 12px 18px;
  color: ${props => props.theme.colors.textPrimary};
  font-size: 0.95rem;
  outline: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); /* Subtle depth */
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const MessageInput = () => {
  const [text, setText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const { sendMessage, replyingTo, setReplyingTo } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text);
      setText('');
      setShowPicker(false);
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
        <IconButton type="button" onClick={() => {}}> <IoMdAdd /> </IconButton>
        <IconButton type="button" onClick={() => setShowPicker(!showPicker)}> 
            {showPicker ? <BsKeyboard /> : <BsEmojiSmile />} 
        </IconButton>
        
        <TextInput
            type="text"
            placeholder="Type a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setShowPicker(false)}
        />
        
        {text.trim() ? (
            <IconButton type="submit" style={{color: '#007AFF'}}> <IoMdSend /> </IconButton>
        ) : (
            <IconButton type="button"> <BsMic /> </IconButton>
        )}
      </InputForm>
      
      {showPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
    </Container>
  );
};

export default MessageInput;

