import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext'; // Import useChat
import Message from './Message';
import LoadingSpinner from '../common/LoadingSpinner';

const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0; // Vertical padding only
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.background}; 
  
  /* --- Real WhatsApp Background --- */
  background-image: url('/whatsapp-bg.png'); // Assumes image is in public folder
  background-repeat: repeat;
  /* Consider adding overlay for dark themes */
`;

// --- Date Separators ---
const DateSeparator = styled.div`
  text-align: center;
  margin: 1rem 0;
  span {
    background-color: ${props => props.theme.colors.hoverBackground}; // Use theme color
    color: ${props => props.theme.colors.textSecondary};
    padding: 0.3rem 0.8rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
  }
`;

// --- MessageList Component ---
const MessageList = () => {
  // --- FIX: Import activeChat ---
  const { messages, loading, activeChat } = useChat(); 
  // --- END FIX ---
  const endOfMessagesRef = useRef(null);
  let lastDate = null;

  // Effect for smooth scrolling on new messages
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  // Effect for instant scrolling when the chat changes
   useEffect(() => {
     endOfMessagesRef.current?.scrollIntoView({ behavior: 'auto' });
     // --- FIX: Use activeChat._id as the dependency ---
   }, [activeChat?._id]); 
   // --- END FIX ---


  if (loading) {
    return <LoadingSpinner />;
  }

  // Helper to format date for separator
  const formatDate = (dateString) => {
    if (!dateString) return '';
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
      <div style={{ height: '10px' }} /> 

      {messages && messages.map((msg, index) => {
         if (!msg || !msg.createdAt) {
           console.warn("Skipping invalid message object:", msg);
           return null;
         }

        const messageDateStr = new Date(msg.createdAt).toDateString();
        const showDateSeparator = messageDateStr !== lastDate;
        lastDate = messageDateStr;

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
      <div style={{ height: '10px' }} /> 
      <div ref={endOfMessagesRef} />
    </MessageListContainer>
  );
};

export default MessageList;

