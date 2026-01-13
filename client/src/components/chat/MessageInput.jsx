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

// Helper for subtle borders
const subtleBorder = (theme) => `1px solid ${theme.colors.border || theme.colors.hoverBackground}`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.panelBackground};
  border-top: ${props => subtleBorder(props.theme)};
  flex-shrink: 0;
  position: relative; /* Standard flow */
  z-index: 20;
`;

const ReplyPanel = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px; 
  background-color: ${props => props.theme.colors.panelBackground}; 
  animation: ${slideUp} 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  position: relative;
  
  border-left: 4px solid ${props => props.theme.colors.primary};
  margin-bottom: 0; /* Connected to input */
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
  color: ${props => props.theme.colors.textSecondary};
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
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 50%;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.iconActive};
    background-color: ${props => props.theme.colors.hoverBackground};
  }
`;

const TextInput = styled.input`
  flex: 1;
  background-color: ${props => props.theme.colors.inputBackground};
  border: none;
  border-radius: 24px;
  padding: 10px 16px;
  color: ${props => props.theme.colors.textPrimary};
  font-size: 0.95rem;
  outline: none;
  
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

