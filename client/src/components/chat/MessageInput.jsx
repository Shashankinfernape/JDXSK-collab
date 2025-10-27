import React, { useState } from 'react';
import styled from 'styled-components';
import { IoMdSend } from 'react-icons/io';
import { BsEmojiSmile } from 'react-icons/bs';
import { ImAttachment } from 'react-icons/im';
import { useChat } from '../../context/ChatContext';

const InputContainer = styled.form`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.theme.colors.black_lighter};
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.grey_light};
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 50%;
  transition: color 0.2s ease, background-color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.black_lightest};
  }
`;

const TextInput = styled.input`
  flex: 1;
  background-color: ${props => props.theme.colors.black};
  border: none;
  border-radius: 20px;
  padding: 0.8rem 1.2rem;
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  outline: none;
`;

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
      <IconButton type="button">
        <BsEmojiSmile />
      </IconButton>
      <IconButton type="button">
        <ImAttachment />
      </IconButton>
      <TextInput
        type="text"
        placeholder="Type a message"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <IconButton type="submit">
        <IoMdSend />
      </IconButton>
    </InputContainer>
  );
};

export default MessageInput;