import React, { useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { BsCheck, BsCheckAll } from 'react-icons/bs'; 
import { BiTime } from 'react-icons/bi'; 
import { IoMdUndo } from 'react-icons/io'; 
import AudioPlayer from './AudioPlayer'; 
import { highlight } from '../../theme/GlobalStyles';

const isProduction = window.location.hostname.includes('onrender.com') || window.location.hostname.includes('vercel.app');
const SERVER_URL = isProduction ? "https://jdxsk-collab.onrender.com" : `http://${window.location.hostname}:5000`; 

const SwipeContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden; 
  flex-shrink: 0; 
`;

const ReplyIconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 0; 
  transform: translateY(-50%) scale(${props => props.$visible ? 1 : 0.5});
  opacity: ${props => props.$visible ? 1 : 0};
  transition: all 0.2s ease;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.5rem;
  z-index: 1;
  padding-left: 1rem;
`;

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${props => (props.isMe ? 'flex-end' : 'flex-start')};
  margin-bottom: ${props => props.$isSequence ? '1px' : '12px'}; 
  @media (max-width: 900px) { margin-bottom: ${props => props.$isSequence ? '2px' : '16px'}; }
  padding: 0 5%; 
  position: relative;
  background-color: ${props => props.$isSelected ? 'rgba(66, 133, 244, 0.2)' : 'transparent'}; 
  transition: background-color 0.2s ease;
  user-select: ${props => props.$isSelectionMode ? 'none' : 'text'};
  touch-action: pan-y;
  transform: translateX(${props => props.$translateX}px);
  ${props => props.$isDragging && `transition: none;`} 
`;

const MessageBubble = styled.div`
  max-width: 90%; 
  @media (min-width: 900px) { max-width: 80%; }
  padding: 4px;
  border-radius: ${props => props.theme.bubbleBorderRadius}; 
  background-color: ${props => props.isMe ? props.theme.colors.bubbleMe : props.theme.colors.bubbleOther};
  background: ${props => props.isMe && props.theme.name === 'instagram' ? props.theme.colors.bubbleMe : undefined}; 
  background-color: ${props => props.isMe && props.theme.name !== 'instagram' ? props.theme.colors.bubbleMe : (props.isMe ? undefined : props.theme.colors.bubbleOther)};
  color: ${props => props.isMe ? props.theme.colors.textBubbleMe : props.theme.colors.textBubbleOther};
  word-wrap: break-word; 
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13); 
  position: relative; 
  min-width: 100px; 
  width: fit-content; 
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0px; 

  ${props => props.$isCurrentMatch && css`
    animation: ${highlight} 2s infinite;
    box-shadow: 0 0 10px rgba(255, 235, 59, 0.6);
  `}
`;

const Highlight = styled.span`
  background-color: rgba(255, 235, 59, 0.65);
  color: #000;
  border-radius: 2px;
  padding: 0 1px;
`;

const QuotedMessage = styled.div`
  margin: 0 0 4px 0;
  width: 100%;
  background-color: ${props => props.$isMe ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.04)'};
  ${props => !props.$isMe && props.theme.isDark && `background-color: rgba(255, 255, 255, 0.08);`}
  border-radius: ${props => props.theme.quoteBorderRadius || '12px'};
  position: relative;
  overflow: hidden; 
  padding: 8px 12px 8px 16px; 
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  font-size: 0.82rem;
  line-height: 1.25;
  cursor: pointer;
  transition: background-color 0.2s;
  min-height: 50px;

  &::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0; width: 4px;
    background-color: ${props => props.$isMe ? 'rgba(255,255,255,0.7)' : props.theme.colors.primary};
  }
  &:hover { background-color: ${props => props.$isMe ? 'rgba(0, 0, 0, 0.18)' : 'rgba(0, 0, 0, 0.07)'}; }
`;

const QuotedProfilePic = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
`;

const QuotedContent = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
`;

const QuotedSender = styled.span`
  font-weight: 700;
  color: ${props => props.$isMe ? '#FFFFFF' : props.theme.colors.primary};
  font-size: 0.75rem;
  margin-bottom: 1px;
  opacity: 0.98;
`;

const QuotedText = styled.span`
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: inherit; opacity: 0.85; font-size: 0.8rem; line-height: 1.3; display: block;
`;

const MessageText = styled.div`
  font-size: 0.95rem; line-height: 1.4; color: inherit; width: 100%; padding: 2px 5px 0 5px; margin-bottom: 0px;
`;

const StatusContainer = styled.div`
  align-self: flex-end; display: flex; align-items: center; gap: 3px; margin-top: -2px; margin-right: 2px; margin-bottom: 2px; height: 14px; line-height: 1;
`;
const Timestamp = styled.span`
  font-size: 0.68rem; color: inherit; opacity: 0.75; white-space: nowrap; 
`;

const Ticks = styled.div`
  display: flex; align-items: center; font-size: 0.9rem; opacity: 0.9;
  .tick-read { color: #53bdeb; } 
  .tick-delivered { color: ${props => props.$isMe ? props.theme.colors.textBubbleMe : props.theme.colors.textSecondary}; opacity: 0.6; }
  .tick-sent { color: ${props => props.$isMe ? props.theme.colors.textBubbleMe : props.theme.colors.textSecondary}; opacity: 0.6; }
`;

const Message = ({ message, isSelected, isSelectionMode, onSelect, onReply, isSequence, searchTerm, isCurrentMatch }) => {
  const { user } = useAuth();
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isSwiping = useRef(false);

  const highlightText = (text, term) => {
      if (!term || !text) return text;
      const parts = text.split(new RegExp(`(${term})`, 'gi'));
      return parts.map((part, i) => 
          part.toLowerCase() === term.toLowerCase() 
            ? <Highlight key={i}>{part}</Highlight> 
            : part
      );
  };

  if (!message || !message.senderId) return null;
  const isMe = message.senderId._id === user?._id; 

  const scrollToOriginal = (e) => {
      e.stopPropagation();
      const originalId = message.replyTo?._id;
      if (originalId) {
          const el = document.getElementById(`msg-${originalId}`);
          if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
  };

  const handleStartTimer = () => {
      isLongPress.current = false; 
      longPressTimer.current = setTimeout(() => {
          if (!isSwiping.current) { 
              isLongPress.current = true; 
              onSelect(message._id); 
          }
      }, 500); 
  };

  const handleClearTimer = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); };

  const handleTouchStart = (e) => {
      if (isSelectionMode) return; 
      const touch = e.touches ? e.touches[0] : e;
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      isSwiping.current = false;
      setIsDragging(true);
      handleStartTimer();
  };

  const handleTouchMove = (e) => {
      if (isSelectionMode || !isDragging) return;
      const touch = e.touches ? e.touches[0] : e;
      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
          isSwiping.current = true;
          handleClearTimer(); 
          if (dx > 0) { 
              const resistance = Math.min(dx, 100); 
              setTranslateX(resistance);
          }
      }
  };

  const handleTouchEnd = () => {
      handleClearTimer();
      setIsDragging(false);
      if (isSwiping.current) {
          if (translateX > 50) if (onReply) onReply(message);
          setTranslateX(0); 
          isSwiping.current = false;
      }
  };

  const handleClick = (e) => {
      if (isLongPress.current) { isLongPress.current = false; return; }
      if (isSwiping.current) return;
      if (isSelectionMode || e.ctrlKey || e.metaKey) onSelect(message._id); 
  };

  const handleContextMenu = (e) => { e.preventDefault(); if (!isSelectionMode) onSelect(message._id); };

  const getTicks = () => {
    if (isMe && message._id?.startsWith('temp-')) return <Ticks $isMe={isMe}><BiTime style={{fontSize: '0.85rem', opacity: 0.7}} /></Ticks>;
    if (!isMe) return null;
    if (message.readBy && message.readBy.length > 0) return <Ticks $isMe={isMe}><BsCheckAll className="tick-read" /></Ticks>;
    if (message.deliveredTo && message.deliveredTo.length > 0) return <Ticks $isMe={isMe}><BsCheckAll className="tick-delivered" /></Ticks>;
    return <Ticks $isMe={isMe}><BsCheck className="tick-sent" /></Ticks>;
  };

  const messageStatus = (
      <>
        <Timestamp isMe={isMe}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
        </Timestamp>
        {getTicks()}
      </>
  );

  const isAudio = message.contentType === 'audio' || message.content === '🎤 Voice Message';

  return (
    <SwipeContainer id={`msg-${message._id}`}>
        <ReplyIconWrapper $visible={translateX > 40}>
            <IoMdUndo />
        </ReplyIconWrapper>
        <MessageWrapper 
            isMe={isMe} $isSelected={isSelected} $isSelectionMode={isSelectionMode} $translateX={translateX} $isDragging={isDragging} $isSequence={isSequence}
            onClick={handleClick} onContextMenu={handleContextMenu} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart} onMouseMove={handleTouchMove} onMouseUp={handleTouchEnd} onMouseLeave={handleTouchEnd}
        >
        <MessageBubble isMe={isMe} $isCurrentMatch={isCurrentMatch}>
            {message.replyTo && message.replyTo.content && (
                <QuotedMessage $isMe={isMe} onClick={scrollToOriginal}>
                    <QuotedProfilePic 
                        src={message.replyTo.senderId?.profilePic || `https://i.pravatar.cc/150?u=${message.replyTo.senderId?._id || 'u'}`} 
                        alt="Sender" 
                    />
                    <QuotedContent>
                        <QuotedSender $isMe={isMe}>{message.replyTo.senderName || "User"}</QuotedSender>
                        <QuotedText $isMe={isMe}>{message.replyTo.content}</QuotedText>
                    </QuotedContent>
                </QuotedMessage>
            )}
            {isAudio ? (
                <AudioPlayer 
                    src={message.fileUrl?.startsWith('http') ? message.fileUrl : `${SERVER_URL}${message.fileUrl}`} 
                    isMe={isMe} senderProfilePic={message.senderId?.profilePic || `https://i.pravatar.cc/150?u=${message.senderId?._id}`}
                    footer={messageStatus} duration={message.duration}
                />
            ) : message.contentType === 'image' ? (
                <>
                    <img 
                        src={message.fileUrl?.startsWith('http') ? message.fileUrl : `${SERVER_URL}${message.fileUrl}`} 
                        alt="Shared" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer' }}
                        onClick={() => window.open(message.fileUrl?.startsWith('http') ? message.fileUrl : `${SERVER_URL}${message.fileUrl}`, '_blank')}
                    />
                    <StatusContainer>{messageStatus}</StatusContainer>
                </>
            ) : (
                <>
                    <MessageText>{highlightText(message.content, searchTerm)}</MessageText>
                    <StatusContainer>{messageStatus}</StatusContainer>
                </>
            )}
        </MessageBubble>
        </MessageWrapper>
    </SwipeContainer>
  );
};

export default Message;