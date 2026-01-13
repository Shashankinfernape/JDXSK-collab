import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { BsCheck, BsCheckAll } from 'react-icons/bs'; // Thinner, cleaner ticks
import { IoMdUndo } from 'react-icons/io'; // Reply Icon

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
  margin-bottom: 2px; /* Tight spacing between messages */
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
  @media (min-width: 900px) {
    max-width: 80%; 
  }
  
  padding: 6px 8px 6px 9px;
  
  border-radius: ${props => props.theme.bubbleBorderRadius}; 
  background-color: ${props =>
    props.isMe ? props.theme.colors.bubbleMe : props.theme.colors.bubbleOther};
  
  background: ${props => props.isMe && props.theme.name === 'instagram' ? props.theme.colors.bubbleMe : undefined}; 
  background-color: ${props => props.isMe && props.theme.name !== 'instagram' ? props.theme.colors.bubbleMe : (props.isMe ? undefined : props.theme.colors.bubbleOther)};

  color: ${props => 
    props.isMe ? props.theme.colors.textBubbleMe : props.theme.colors.textBubbleOther};
  
  word-wrap: break-word; 
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13); 
  position: relative; 
  min-width: 100px; 
  width: fit-content; 
  cursor: pointer;
  
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
`;

// --- Quoted Reply Block (Synchronized Style) ---
const QuotedMessage = styled.div`
  /* Precise thin spacing for premium feel */
  margin-top: -3px;
  margin-left: -6px;
  margin-right: -5px;
  width: calc(100% + 11px);
  
  /* Visuals */
  background-color: ${props => props.$isMe ? 'rgba(0, 0, 0, 0.18)' : 'rgba(0, 0, 0, 0.04)'};
  ${props => !props.$isMe && props.theme.isDark && `background-color: rgba(255, 255, 255, 0.08);`}
  
  border-left: 3px solid ${props => props.theme.colors.primary};
  border-left-color: ${props => props.$isMe ? 'rgba(255,255,255,0.85)' : props.theme.colors.primary};

  padding: 5px 10px; 
  /* Synchronize rounding with the main bubble */
  border-radius: ${props => props.theme.bubbleBorderRadius}; 
  
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin-bottom: 2px; /* Closer to the replying message */
  
  font-size: 0.82rem;
  line-height: 1.25;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.$isMe ? 'rgba(0, 0, 0, 0.22)' : 'rgba(0, 0, 0, 0.07)'};
  }
`;

const QuotedSender = styled.span`
  font-weight: 700;
  color: ${props => props.$isMe ? '#FFFFFF' : props.theme.colors.primary};
  font-size: 0.75rem;
  margin-bottom: 1px;
  opacity: 0.98;
`;

const QuotedText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: inherit;
  opacity: 0.85;
  font-size: 0.8rem;
  line-height: 1.3;
  display: block;
`;

const MessageText = styled.div`
  font-size: 0.95rem; 
  line-height: 1.4;
  color: inherit;
  width: 100%;
  padding: 2px 1px 0 1px; /* Added slight top padding */
  margin-bottom: 0px;
`;

const StatusContainer = styled.div`
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 1px; /* Tight spacing under message */
  margin-right: -2px;
  
  height: 14px; 
  line-height: 1;
`;

const Timestamp = styled.span`
  font-size: 0.68rem; /* Slightly larger for readability */
  color: inherit;
  opacity: 0.75;
  white-space: nowrap; 
`;

const Ticks = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem; /* Clean size */
  opacity: 0.9;
  
  /* WhatsApp Ticks Colors */
  .tick-read { color: ${props => props.theme.colors.tick_read || '#53bdeb'}; } /* Accent/Blue */
  .tick-delivered { color: ${props => props.$isMe ? 'rgba(255,255,255,0.7)' : '#8696a0'}; } /* Gray */
  .tick-sent { color: ${props => props.$isMe ? 'rgba(255,255,255,0.7)' : '#8696a0'}; } /* Gray */
`;

const Message = ({ message, isSelected, isSelectionMode, onSelect, onReply }) => {
  const { user } = useAuth();
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);
  
  // Swipe State
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isSwiping = useRef(false);

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

  // --- Interaction Handlers ---
  const handleStartTimer = () => {
      isLongPress.current = false; 
      longPressTimer.current = setTimeout(() => {
          if (!isSwiping.current) { 
              isLongPress.current = true; 
              onSelect(message._id); 
          }
      }, 500); 
  };

  const handleClearTimer = () => {
      if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
      }
  };

  // --- Swipe Logic ---
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
          if (translateX > 50) { 
              if (onReply) onReply(message);
          }
          setTranslateX(0); 
          isSwiping.current = false;
      }
  };

  const handleClick = (e) => {
      if (isLongPress.current) {
          isLongPress.current = false;
          return;
      }
      if (isSwiping.current) return;

      if (isSelectionMode || e.ctrlKey || e.metaKey) {
          onSelect(message._id); 
      }
  };

  const handleContextMenu = (e) => {
      e.preventDefault(); 
      if (!isSelectionMode) {
          onSelect(message._id); 
      }
  };

  const getTicks = () => {
    if (!isMe || !message || message._id?.startsWith('temp-')) return <Ticks $isMe={isMe}><span style={{fontSize:'0.7rem', opacity:0.6}}>🕒</span></Ticks>; 
    
    // Read (Blue Double Tick)
    if (message.readBy && message.readBy.length > 1) {
        return <Ticks $isMe={isMe}><BsCheckAll className="tick-read" /></Ticks>;
    }
    
    // Delivered (Gray Double Tick)
    if (message.deliveredTo && message.deliveredTo.length > 1) {
        return <Ticks $isMe={isMe}><BsCheckAll className="tick-delivered" /></Ticks>;
    }
    
    // Sent (Gray Single Tick)
    return <Ticks $isMe={isMe}><BsCheck className="tick-sent" /></Ticks>;
  };

  return (
    <SwipeContainer id={`msg-${message._id}`}>
        <ReplyIconWrapper $visible={translateX > 40}>
            <IoMdUndo />
        </ReplyIconWrapper>
        <MessageWrapper 
            isMe={isMe} 
            $isSelected={isSelected} 
            $isSelectionMode={isSelectionMode}
            $translateX={translateX}
            $isDragging={isDragging}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
        >
        <MessageBubble isMe={isMe}>
            {message.replyTo && message.replyTo.content && (
                <QuotedMessage $isMe={isMe} onClick={scrollToOriginal}>
                    <QuotedSender $isMe={isMe}>{message.replyTo.senderName || "User"}</QuotedSender>
                    <QuotedText $isMe={isMe}>{message.replyTo.content}</QuotedText>
                </QuotedMessage>
            )}
            
            <MessageText>{message.content}</MessageText>
            <StatusContainer>
            <Timestamp isMe={isMe}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
            </Timestamp>
            {getTicks()}
            </StatusContainer>
        </MessageBubble>
        </MessageWrapper>
    </SwipeContainer>
  );
};

export default Message;