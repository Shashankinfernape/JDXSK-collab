import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { IoMdSend, IoMdClose } from 'react-icons/io';
import { BsEmojiSmile } from 'react-icons/bs';
import { useChat } from '../../context/ChatContext';
import EmojiPicker from './EmojiPicker';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* 
   Container: Fully transparent. 
   Acts as the wrapper for the "Fake Bubble"
*/
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: transparent; 
  padding: 0 10px 10px 10px; /* Floating margin */
  flex-shrink: 0;
  position: relative; 
  z-index: 20;
`;

/* 
   InputBubble: Imitates 'MessageBubble' from Message.jsx.
   This contains the Reply Preview (if any) and the Input Field.
*/
const InputBubble = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.inputBackground};
  border-radius: 24px; /* Slightly rounder for input bar */
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s ease;
  
  /* If replying, it looks more like a complex message bubble */
  ${props => props.$isReplying && `
    border-radius: 16px; 
    padding-top: 6px;
  `}
`;

/* 
   ReplyPreview: Imitates 'QuotedMessage' from Message.jsx 
*/
const ReplyPreview = styled.div`
  margin: 0 6px 4px 6px; /* Internal margins */
  width: calc(100% - 12px);
  
  /* Subtle variation for reply box */
  background-color: ${props => props.theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'};
  
  /* Straight solid stripe - Sharp and consistent */
  border-left: 4px solid ${props => props.theme.colors.primary};
  
  padding: 6px 10px;
  /* Straight left side to keep stripe vertical, rounded right side */
  border-radius: 0 8px 8px 0;
  
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  animation: ${slideUp} 0.2s ease-out;
  cursor: default;
`;

const ReplyContent = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
`;

const ReplySender = styled.span`
  color: ${props => props.theme.colors.primary};
  font-weight: 700;
  font-size: 0.75rem;
  margin-bottom: 2px;
`;

const ReplyText = styled.span`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.8;
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
  margin-left: 8px;
  
  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
  }
  font-size: 1.2rem;
`;

/* 
   InputRow: Imitates 'MessageText' layout but for input 
*/
const InputRow = styled.form`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  min-height: 48px;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.icon};
  cursor: pointer;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 50%;
  transition: color 0.2s ease;
  margin-right: 4px;

  &:hover {
    color: ${props => props.theme.colors.iconActive};
    background-color: ${props => props.theme.colors.hoverBackground};
  }
`;

const SendButton = styled.button`
  background-color: #25D366; /* WhatsApp Green */
  color: #000000; /* Black Icon */
  border: none;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  margin-left: 4px;
  flex-shrink: 0;

  &:hover {
    background-color: #20ba5a;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    margin-left: 2px; /* Center adjustment for the send icon */
  }
`;

const TextInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  padding: 8px 4px;
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
  const inputRef = useRef(null);

  // Auto-focus on reply
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

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
      <InputBubble $isReplying={!!replyingTo}>
        {replyingTo && (
            <ReplyPreview>
                <ReplyContent>
                    <ReplySender>{replyingTo.senderId?.name || "User"}</ReplySender>
                    <ReplyText>{replyingTo.content}</ReplyText>
                </ReplyContent>
                <CloseButton onClick={() => setReplyingTo(null)}>
                    <IoMdClose />
                </CloseButton>
            </ReplyPreview>
        )}
        
        <InputRow onSubmit={handleSubmit}>
            <IconButton type="button" onClick={() => setShowPicker(!showPicker)}> 
                <BsEmojiSmile /> 
            </IconButton>
            
            <TextInput
                ref={inputRef}
                type="text"
                placeholder="Type a message"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => setShowPicker(false)}
            />
            
            {text.trim() && (
                <SendButton type="submit"> <IoMdSend /> </SendButton>
            )}
        </InputRow>
      </InputBubble>
      
      {showPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
    </Container>
  );
};

export default MessageInput;