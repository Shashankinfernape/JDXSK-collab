import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { TiTick } from 'react-icons/ti'; // Import a tick icon

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${props => (props.isMe ? 'flex-end' : 'flex-start')};
  margin-bottom: 0.75rem;
`;

const MessageBubble = styled.div`
  max-width: 65%;
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  background-color: ${props =>
    props.isMe ? props.theme.colors.primary : props.theme.colors.black_lightest};
  color: ${props => props.theme.colors.white};
  word-wrap: break-word;
`;

const MessageText = styled.p`
  font-size: 0.95rem;
  line-height: 1.4;
  margin-right: 0.5rem; /* Space for timestamp */
`;

// --- NEW: Timestamp and Ticks Container ---
const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  margin-top: 4px;
`;

const Timestamp = styled.span`
  font-size: 0.7rem;
  color: ${props => props.theme.colors.grey_light};
  opacity: 0.8;
`;

// --- NEW: Ticks Component ---
const Ticks = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  font-size: 1.1rem;

  /* Your custom 3-tick system */
  .tick-3 {
    color: ${props => props.theme.colors.tick_read};
  }
  .tick-2 {
    color: ${props => props.theme.colors.tick_delivered};
  }
  .tick-1 {
    color: ${props => props.theme.colors.tick_sent};
  }
`;


const Message = ({ message }) => {
  const { user } = useAuth();
  const isMe = message.senderId._id === user._id;

  // --- NEW: Tick Logic ---
  const getTicks = () => {
    if (!isMe) return null;

    // Check read status first (✓✓✓)
    if (message.readBy && message.readBy.length > 0) {
      return (
        <Ticks>
          <TiTick className="tick-1" />
          <TiTick className="tick-2" style={{ marginLeft: '-8px' }}/>
          <TiTick className="tick-3" style={{ marginLeft: '-8px' }}/>
        </Ticks>
      );
    }
    // Check delivered status (✓✓)
    if (message.deliveredTo && message.deliveredTo.length > 0) {
      return (
        <Ticks>
          <TiTick className="tick-1" />
          <TiTick className="tick-2" style={{ marginLeft: '-8px' }}/>
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
          <Timestamp>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Timestamp>
          {getTicks()}
        </StatusContainer>
      </MessageBubble>
    </MessageWrapper>
  );
};

export default Message;