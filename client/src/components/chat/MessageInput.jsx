import React, { useState } from 'react';
import styled from 'styled-components';
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
`;

const ReplyPreviewContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  border-left: 4px solid ${props => props.theme.colors.primary};
  margin: 0.5rem 1rem 0 1rem;
  border-radius: 4px;
`;

const ReplyContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ReplySender = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 2px;
`;

const ReplyText = styled.span`
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  padding: 0.6rem 1rem;
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
          <ReplyPreviewContainer>
              <ReplyContent>
                  <ReplySender>{replyingTo.senderId?.name || "User"}</ReplySender>
                  <ReplyText>{replyingTo.content}</ReplyText>
              </ReplyContent>
              <IconButton onClick={() => setReplyingTo(null)} style={{ fontSize: '1.2rem' }}>
                  <IoMdClose />
              </IconButton>
          </ReplyPreviewContainer>
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

