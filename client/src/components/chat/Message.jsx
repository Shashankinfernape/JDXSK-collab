import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { TiTick } from 'react-icons/ti';

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
  position: relative; // Needed for potential tail
`;

const MessageText = styled.p`
  font-size: 0.9rem; // Adjust font size
  line-height: 1.4;
  margin-right: 3.5rem; // Ensure space for status (time + ticks)
  margin-bottom: 0.5rem; // Add space between text and status line
`;

const StatusContainer = styled.div`
  position: absolute; // Position absolutely at the bottom right
  bottom: 4px;
  right: 7px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  // Make status line float below text instead of beside it
`;

const Timestamp = styled.span`
  font-size: 0.65rem; // Smaller timestamp
  color: ${props => 
    props.isMe ? props.theme.colors.textBubbleMe : props.theme.colors.textSecondary}; // Adjust color based on bubble
  opacity: 0.8;
`;

const Ticks = styled.div`
  display: flex;
  align-items: center;
  font-size: 1rem; // Slightly smaller ticks

  .tick-3 { color: ${props => props.theme.colors.tick_read}; }
  .tick-2 { color: ${props => props.theme.colors.tick_delivered}; }
  .tick-1 { color: ${props => props.theme.colors.tick_sent}; }
`;

const Message = ({ message }) => {
  const { user } = useAuth();
  const isMe = message.senderId._id === user._id;

  const getTicks = () => {
    if (!isMe || !message || message._id?.startsWith('temp-')) return null; // Don't show ticks for optimistic messages

    if (message.readBy && message.readBy.length > 1) { // Check if read by OTHERS
      return (
        <Ticks>
          <TiTick className="tick-1" />
          <TiTick className="tick-2" style={{ marginLeft: '-6px' }}/>
          <TiTick className="tick-3" style={{ marginLeft: '-6px' }}/>
        </Ticks>
      );
    }
    if (message.deliveredTo && message.deliveredTo.length > 1) { // Check if delivered to OTHERS
      return (
        <Ticks>
          <TiTick className="tick-1" />
          <TiTick className="tick-2" style={{ marginLeft: '-6px' }}/>
        </Ticks>
      );
    }
    return ( // Sent
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
          <Timestamp isMe={isMe}>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</Timestamp>
          {getTicks()}
        </StatusContainer>
      </MessageBubble>
    </MessageWrapper>
  );
};

export default Message;