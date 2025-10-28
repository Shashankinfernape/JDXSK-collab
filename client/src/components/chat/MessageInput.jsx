import React, { useState } from 'react';
import styled from 'styled-components';
import { IoMdSend } from 'react-icons/io';
import { BsEmojiSmile } from 'react-icons/bs';
import { ImAttachment } from 'react-icons/im';
import { useChat } from '../../context/ChatContext';

// Helper for subtle borders
const subtleBorder = (theme) => `1px solid ${theme.colors.border || theme.colors.hoverBackground}`;

const InputContainer = styled.form`
  padding: 0.5rem 1rem;
  background-color: ${props => props.theme.colors.panelBackground}; // Use panel bg (like sidebar)
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border-top: ${props => subtleBorder(props.theme)}; // Subtle top border
  flex-shrink: 0; // Prevent input bar from shrinking
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
  const { sendMessage } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text);
      setText('');
    }
  };

  return (
    <InputContainer onSubmit={handleSubmit}>
      <IconButton type="button"> <BsEmojiSmile /> </IconButton>
      <IconButton type="button"> <ImAttachment /> </IconButton>
      <TextInput
        type="text"
        placeholder="Type a message"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {text.trim() && (
        <SendButton type="submit"> <IoMdSend /> </SendButton> // Use styled SendButton
      )}
      {/* Optional: Add microphone icon when text is empty */}
      {/* {!text.trim() && ( <IconButton type="button"> <FaMicrophone /> </IconButton> )} */}
    </InputContainer>
  );
};

export default MessageInput;

