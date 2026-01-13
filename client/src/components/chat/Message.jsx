import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { TiTick } from 'react-icons/ti';
import { IoMdUndo } from 'react-icons/io'; // Reply Icon

const SwipeContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden; /* Hide the icon when not swiping */
  flex-shrink: 0; /* CRITICAL: Prevent messages from squishing */
`;

const ReplyIconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 0; /* Positioned on the left for right-swipe reveal */
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
  margin-bottom: 0.2rem; 
  padding: 4px 5%; 
  position: relative;
  background-color: ${props => props.$isSelected ? 'rgba(66, 133, 244, 0.2)' : 'transparent'}; 
  transition: background-color 0.2s ease, transform 0.2s ease; /* Default transition */
  
  user-select: ${props => props.$isSelectionMode ? 'none' : 'text'};
  touch-action: pan-y; /* Allow vertical scroll, we handle horizontal manually */
  
  /* Apply swipe transform */
  transform: translateX(${props => props.$translateX}px);
  /* Disable transition during drag for responsiveness */
  ${props => props.$isDragging && `transition: none;`} 
`;

const MessageBubble = styled.div`
  max-width: 70%; 
  padding: 0.5rem 0.6rem 0.3rem 0.6rem; 
  border-radius: ${props => props.theme.bubbleBorderRadius}; 
  background-color: ${props =>
    props.isMe ? props.theme.colors.bubbleMe : props.theme.colors.bubbleOther};
  color: ${props => 
    props.isMe ? props.theme.colors.textBubbleMe : props.theme.colors.textBubbleOther};
  word-wrap: break-word; 
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1); 
  position: relative; 
  min-width: 90px; 
  cursor: pointer;
  
  /* Flex Layout */
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

// --- Quoted Reply Block ---
const QuotedMessage = styled.div`
  background-color: ${props => props.$isMe ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.05)'};
  border-left: 4px solid ${props => props.$isMe ? 'rgba(255, 255, 255, 0.6)' : props.theme.colors.primary};
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  
  /* WhatsApp specific: Full Width inside bubble */
  width: 100%;
  align-self: stretch;
  
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.$isMe ? 'rgba(0, 0, 0, 0.18)' : 'rgba(0, 0, 0, 0.08)'};
  }
`;

const QuotedSender = styled.span`
  font-weight: 700;
  color: ${props => props.$isMe ? '#FFFFFF' : props.theme.colors.primary};
  font-size: 0.7rem;
  margin-bottom: 1px;
  opacity: 0.95;
`;

const QuotedText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: inherit;
  opacity: 0.75;
  display: block;
`;

const MessageText = styled.div`
  font-size: 0.94rem; 
  line-height: 1.45;
  color: inherit;
  width: 100%;
  padding-bottom: 2px;
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  align-self: flex-end; /* Push to the bottom right */
  margin-top: 1px;
  height: 14px;
  line-height: 1;
`;

const Timestamp = styled.span`
  font-size: 0.64rem; 
  color: inherit;
  opacity: 0.65;
  white-space: nowrap; 
`;

const Ticks = styled.div`
  display: flex;
  align-items: center;
  font-size: 1rem; 
  opacity: 0.9;

  .tick-3 { color: ${props => props.theme.colors.tick_read}; }
  .tick-2 { color: ${props => props.$isMe ? '#FFFFFF' : props.theme.colors.tick_delivered}; }
  .tick-1 { color: ${props => props.$isMe ? '#FFFFFF' : props.theme.colors.tick_sent}; }
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
          if (!isSwiping.current) { // Only trigger if not swiping
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
      if (isSelectionMode) return; // Disable swipe in selection mode
      
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

      // Detect horizontal swipe vs vertical scroll
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
          isSwiping.current = true;
          handleClearTimer(); // Cancel long press immediately on move
          
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
          if (translateX > 50) { // Threshold to trigger reply
              if (onReply) onReply(message);
          }
          setTranslateX(0); // Snap back
          isSwiping.current = false;
      }
  };

  // Click handler (only fires if not long press and not swiping)
  const handleClick = (e) => {
      if (isLongPress.current) {
          isLongPress.current = false;
          return;
      }
      // If we were swiping, don't trigger click (though usually click doesn't fire if moved enough)
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
    if (!isMe || !message || message._id?.startsWith('temp-')) return null; 
    if (message.readBy && message.readBy.length > 1) return <Ticks $isMe={isMe}><TiTick className="tick-1" /><TiTick className="tick-2" style={{ marginLeft: '-6px' }}/><TiTick className="tick-3" style={{ marginLeft: '-6px' }}/></Ticks>;
    if (message.deliveredTo && message.deliveredTo.length > 1) return <Ticks $isMe={isMe}><TiTick className="tick-1" /><TiTick className="tick-2" style={{ marginLeft: '-6px' }}/><TiTick className="tick-3" style={{ marginLeft: '-6px' }}/></Ticks>;
    return <Ticks $isMe={isMe}><TiTick className="tick-1" /></Ticks>;
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
            
            // Touch Events
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            
            // Mouse Events (for desktop testing/usage)
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
        >
        <MessageBubble isMe={isMe}>
            {/* --- Quoted Reply Block --- */}
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