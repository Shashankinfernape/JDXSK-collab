import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext'; // Import useChat
import Message from './Message';
import LoadingSpinner from '../common/LoadingSpinner';
import { BsChatText } from 'react-icons/bs';

const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0; 
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.chatBackground}; 
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textSecondary};
  opacity: 0.7;
  gap: 1rem;
  
  svg {
    font-size: 3rem;
    color: ${props => props.theme.colors.primary};
    opacity: 0.5;
  }
  
  p {
    font-size: 1.1rem;
    font-weight: 500;
  }
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
  const { messages, loading, activeChat, selectedMessages, toggleMessageSelection, isSelectionMode, replyingTo, setReplyingTo } = useChat(); 
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

   // --- FIX: Scroll to bottom when replyingTo changes (pushes messages up) ---
   useEffect(() => {
     if (replyingTo) {
       // Using 'smooth' behavior for a nice transition when the input grows
       endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
     }
   }, [replyingTo]);
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

  const hasMessages = messages && messages.length > 0;

  return (
    <MessageListContainer $replyingTo={replyingTo}>
      {!hasMessages && (
          <EmptyState>
              <BsChatText />
              <p>Start a conversation</p>
          </EmptyState>
      )}

      {hasMessages && (
          <>
            <div style={{ height: '10px' }} /> 
            {messages.map((msg, index) => {
                if (!msg || !msg.createdAt) {
                console.warn("Skipping invalid message object:", msg);
                return null;
                }

                const messageDateStr = new Date(msg.createdAt).toDateString();
                const showDateSeparator = messageDateStr !== lastDate;
                lastDate = messageDateStr;

                const isSelected = selectedMessages.includes(msg._id);

                // Check if next message is from same sender (for spacing)
                const nextMsg = messages[index + 1];
                const isSequence = nextMsg && nextMsg.senderId?._id === msg.senderId?._id;

                return (
                <React.Fragment key={msg._id || `temp-${index}`}>
                    {showDateSeparator && (
                    <DateSeparator>
                        <span>{formatDate(msg.createdAt)}</span>
                    </DateSeparator>
                    )}
                    <Message 
                        message={msg} 
                        isSelected={isSelected}
                        isSelectionMode={isSelectionMode}
                        onSelect={toggleMessageSelection}
                        onReply={setReplyingTo}
                        isSequence={isSequence}
                    />
                </React.Fragment>
                );
            })}
            <div style={{ height: '10px' }} /> 
            <div ref={endOfMessagesRef} />
          </>
      )}
    </MessageListContainer>
  );
};

export default MessageList;

