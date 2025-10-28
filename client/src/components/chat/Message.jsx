import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { TiTick } from 'react-icons/ti'; // Checkmark icon

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${props => (props.isMe ? 'flex-end' : 'flex-start')};
  margin-bottom: 0.2rem; // Reduced margin for denser look
  padding: 0 5%; // Add horizontal padding to the container
`;

const MessageBubble = styled.div`
  max-width: 70%; // Allow slightly wider bubbles
  padding: 0.4rem 0.7rem; // Adjust padding
  border-radius: ${props => props.theme.bubbleBorderRadius}; // Use theme radius
  background-color: ${props =>
    props.isMe ? props.theme.colors.bubbleMe : props.theme.colors.bubbleOther};
  color: ${props => 
    props.isMe ? props.theme.colors.textBubbleMe : props.theme.colors.textBubbleOther};
  word-wrap: break-word; 
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1); // Subtle shadow
  position: relative; // Needed for potential tail or absolute positioning of status
  min-width: 80px; // Ensure minimum width for status line
`;

const MessageText = styled.p`
  font-size: 0.9rem; // Adjust font size
  line-height: 1.4;
  /* Remove margin-right, handle spacing with StatusContainer */
  margin-bottom: 1.2rem; /* Add space below text for status line */
`;

const StatusContainer = styled.div`
  position: absolute; // Position absolutely at the bottom right
  bottom: 4px;
  right: 7px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  height: 1rem; // Explicit height for alignment
`;

const Timestamp = styled.span`
  font-size: 0.65rem; // Smaller timestamp
  /* Dynamically set color based on bubble type and potentially theme properties */
  color: ${props =>
    props.isMe
      ? (props.theme.colors.textBubbleMeSecondary || props.theme.colors.textBubbleMe) // Allow override for bubble text
      : props.theme.colors.textSecondary};
  opacity: 0.8;
  white-space: nowrap; // Prevent wrapping
`;

const Ticks = styled.div`
  display: flex;
  align-items: center;
  font-size: 1rem; // Slightly smaller ticks

  /* Access theme colors for ticks */
  .tick-3 { color: ${props => props.theme.colors.tick_read}; }
  .tick-2 { color: ${props => props.theme.colors.tick_delivered}; }
  .tick-1 { color: ${props => props.theme.colors.tick_sent}; }
`;

const Message = ({ message }) => {
  const { user } = useAuth();
  // Add checks for message and senderId existence
  if (!message || !message.senderId) {
      console.warn("Rendering empty message or message without senderId:", message);
      return null;
  }
  const isMe = message.senderId._id === user?._id; // Check user existence

  const getTicks = () => {
    if (!isMe || !message || message._id?.startsWith('temp-')) return null; // Don't show ticks for optimistic messages

    // --- FIX: Removed unused variable ---
    // const otherParticipantsCount = (message.deliveredTo?.length || 0) + (message.readBy?.length || 0) -1 ; 
    // --- END FIX ---

    // Check read status first (✓✓✓ or ✓✓ based on theme)
    if (message.readBy && message.readBy.length > 1) { // Check if read by OTHERS (more than just the sender)
        return (
            <Ticks>
              <TiTick className="tick-1" />
              <TiTick className="tick-2" style={{ marginLeft: '-6px' }}/>
              <TiTick className="tick-3" style={{ marginLeft: '-6px' }}/>
            </Ticks>
        );
    }
    // Check delivered status (✓✓)
    if (message.deliveredTo && message.deliveredTo.length > 1) { // Check if delivered to OTHERS
      return (
        <Ticks>
          <TiTick className="tick-1" />
          <TiTick className="tick-2" style={{ marginLeft: '-6px' }}/>
        </Ticks>
      );
    }
    // Just sent (✓)
    return (
      <Ticks>
        <TiTick className="tick-1" />
      </Ticks>
    );
  };

  return (
    <MessageWrapper isMe={isMe}>
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

