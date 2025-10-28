import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext';
import Message from './Message';
import LoadingSpinner from '../common/LoadingSpinner';

const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0; // Remove horizontal padding, add to wrapper
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.background}; 
  
  /* --- WhatsApp Background --- */
  /* You'll need to find a suitable repeatable SVG or PNG pattern */
  /* Example using a CSS gradient as placeholder */
  background-image: linear-gradient(rgba(0, 0, 0, 0.05) .1em, transparent .1em), linear-gradient(90deg, rgba(0, 0, 0, 0.05) .1em, transparent .1em);
  background-size: 2em 2em;
  opacity: 0.8; // Make it subtle
`;

// --- NEW: Add Date Separators ---
const DateSeparator = styled.div`
  text-align: center;
  margin: 1rem 0;
  span {
    background-color: ${props => props.theme.colors.hoverBackground};
    color: ${props => props.theme.colors.textSecondary};
    padding: 0.3rem 0.8rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
  }
`;

// --- MessageList Component ---
const MessageList = () => {
  const { messages, loading } = useChat();
  const endOfMessagesRef = useRef(null);
  let lastDate = null; // To track date changes

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'auto' }); // Use auto for instant scroll on load
  }, [messages]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <MessageListContainer>
      {messages.map((msg, index) => {
        const messageDate = new Date(msg.createdAt).toDateString();
        const showDateSeparator = messageDate !== lastDate;
        lastDate = messageDate;

        return (
          <React.Fragment key={msg._id || `temp-${index}`}>
            {showDateSeparator && (
              <DateSeparator>
                <span>{formatDate(msg.createdAt)}</span>
              </DateSeparator>
            )}
            <Message message={msg} />
          </React.Fragment>
        );
      })}
      <div ref={endOfMessagesRef} />
    </MessageListContainer>
  );
};

export default MessageList;