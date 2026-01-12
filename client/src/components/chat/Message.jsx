import React, { useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { TiTick } from 'react-icons/ti'; // Checkmark icon

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${props => (props.isMe ? 'flex-end' : 'flex-start')};
  margin-bottom: 0.2rem; 
  padding: 4px 5%; /* Slight padding for selection highlight */
  position: relative;
  background-color: ${props => props.$isSelected ? 'rgba(66, 133, 244, 0.2)' : 'transparent'}; /* Selection Highlight */
  transition: background-color 0.2s ease;
  
  /* Prevent text selection during message selection interaction */
  user-select: ${props => props.$isSelectionMode ? 'none' : 'text'};
`;

const MessageBubble = styled.div`
  max-width: 70%; 
  padding: 0.4rem 0.7rem; 
  border-radius: ${props => props.theme.bubbleBorderRadius}; 
  background-color: ${props =>
    props.isMe ? props.theme.colors.bubbleMe : props.theme.colors.bubbleOther};
  color: ${props => 
    props.isMe ? props.theme.colors.textBubbleMe : props.theme.colors.textBubbleOther};
  word-wrap: break-word; 
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1); 
  position: relative; 
  min-width: 80px; 
  cursor: pointer; /* Indicate clickable */
`;

const MessageText = styled.p`
  font-size: 0.9rem; 
  line-height: 1.4;
  margin-bottom: 1.2rem; 
`;

const StatusContainer = styled.div`
  position: absolute; 
  bottom: 4px;
  right: 7px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  height: 1rem; 
`;

const Timestamp = styled.span`
  font-size: 0.65rem; 
  color: ${props =>
    props.isMe
      ? (props.theme.colors.textBubbleMeSecondary || props.theme.colors.textBubbleMe) 
      : props.theme.colors.textSecondary};
  opacity: 0.8;
  white-space: nowrap; 
`;

const Ticks = styled.div`
  display: flex;
  align-items: center;
  font-size: 1rem; 

  .tick-3 { color: ${props => props.theme.colors.tick_read}; }
  .tick-2 { color: ${props => props.theme.colors.tick_delivered}; }
  .tick-1 { color: ${props => props.theme.colors.tick_sent}; }
`;

const Message = ({ message, isSelected, isSelectionMode, onSelect }) => {
  const { user } = useAuth();
  const longPressTimer = useRef(null);

  if (!message || !message.senderId) return null;
  const isMe = message.senderId._id === user?._id; 

  // --- Interaction Handlers ---
  const handleStart = () => {
      longPressTimer.current = setTimeout(() => {
          onSelect(message._id); // Trigger selection on long press
      }, 500); // 500ms long press
  };

  const handleEnd = () => {
      if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
      }
  };

  const handleClick = (e) => {
      if (isSelectionMode || e.ctrlKey || e.metaKey) {
          onSelect(message._id); // Toggle selection
      }
  };

  const handleContextMenu = (e) => {
      e.preventDefault(); // Prevent native menu
      onSelect(message._id); // Enter selection
  };

  const getTicks = () => {
    if (!isMe || !message || message._id?.startsWith('temp-')) return null; 

    if (message.readBy && message.readBy.length > 1) { 
        return (
            <Ticks>
              <TiTick className="tick-1" />
              <TiTick className="tick-2" style={{ marginLeft: '-6px' }}/>
              <TiTick className="tick-3" style={{ marginLeft: '-6px' }}/>
            </Ticks>
        );
    }
    if (message.deliveredTo && message.deliveredTo.length > 1) { 
      return (
        <Ticks>
          <TiTick className="tick-1" />
          <TiTick className="tick-2" style={{ marginLeft: '-6px' }}/>
        </Ticks>
      );
    }
    return (
      <Ticks>
        <TiTick className="tick-1" />
      </Ticks>
    );
  };

  return (
    <MessageWrapper 
        isMe={isMe} 
        $isSelected={isSelected} 
        $isSelectionMode={isSelectionMode}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart} // Hybrid support
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
    >
      <MessageBubble isMe={isMe}>
        <MessageText>{message.content}</MessageText>
        <StatusContainer>
          <Timestamp isMe={isMe}>
              {new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
          </Timestamp>
          {getTicks()}
        </StatusContainer>
      </MessageBubble>
    </MessageWrapper>
  );
};

export default Message;

