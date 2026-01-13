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

/* Container: Transparent, Fixed/Absolute at bottom */
const Container = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: transparent; /* No solid background */
  padding-bottom: 8px; /* Spacing from bottom edge */
  display: flex;
  flex-direction: column;
  z-index: 20;
  pointer-events: none; /* Let clicks pass through empty areas */
`;

const ReplyPanel = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 12px; 
  background-color: ${props => props.theme.colors.panelBackground}; /* Reply needs bg */
  border-radius: 12px;
  margin: 0 10px 6px 10px; /* Floating look */
  animation: ${slideUp} 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  position: relative;
  pointer-events: auto;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  
  border-left: 4px solid ${props => props.theme.colors.primary};
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

/* The Pill: Floating input bar */
const InputBarWrapper = styled.div`
  display: flex;
  align-items: flex-end; /* Align rounded button with pill */
  padding: 0 8px;
  pointer-events: auto;
  gap: 6px;
`;

const InputPill = styled.form`
  flex: 1;
  background-color: ${props => props.theme.colors.panelBackground}; /* Standard panel bg (white/dark) */
  border-radius: 24px;
  min-height: 45px;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
  transition: box-shadow 0.2s;
  
  &:focus-within {
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.icon};
  cursor: pointer;
  font-size: 1.35rem;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 50%;
  transition: color 0.2s ease;
  margin: 0 2px;

  &:hover {
    color: ${props => props.theme.colors.iconActive};
    background-color: ${props => props.theme.colors.hoverBackground};
  }
`;

/* Send Button: Separate floating circle usually, or inside if requested. 
   Prompt: "Input field should be a floating rounded pill... Emoji, plus, and mic icons must be inside the pill" 
   But usually Send/Mic is the action button. I'll put Send/Mic inside for strict compliance, 
   OR keep the "Floating Pill" look where the pill contains the text and the button is next to it? 
   Ref: "Only the pill has background, shadow...". 
   Let's put everything inside the pill as requested: "icons must be inside the pill".
*/

const TextInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  padding: 8px 4px;
  color: ${props => props.theme.colors.textPrimary};
  font-size: 0.95rem;
  outline: none;
  margin: 0 4px;
  
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
      
      <InputBarWrapper>
        <InputPill onSubmit={handleSubmit}>
            <IconButton type="button" onClick={() => {}}> <IoMdAdd /> </IconButton>
            <IconButton type="button" onClick={() => setShowPicker(!showPicker)}> 
                {showPicker ? <BsKeyboard /> : <BsEmojiSmile />} 
            </IconButton>
            
            <TextInput
                type="text"
                placeholder="Message"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => setShowPicker(false)}
            />
            
            <IconButton type="button"> <BsCamera /> </IconButton>
            
            {text.trim() ? (
                <IconButton type="submit" style={{color: '#007AFF'}}> <IoMdSend /> </IconButton>
            ) : (
                <IconButton type="button"> <BsMic /> </IconButton>
            )}
        </InputPill>
      </InputBarWrapper>
      
      {showPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
    </Container>
  );
};

export default MessageInput;

