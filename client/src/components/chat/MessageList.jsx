import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext';
import Message from './Message';
import LoadingSpinner from '../common/LoadingSpinner';

const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.black};
  
  /* Simple chat background pattern */
  background-image: radial-gradient(
    circle at 1px 1px, 
    ${props => props.theme.colors.black_lighter} 1px, 
    transparent 0
  );
  background-size: 20px 20px;
`;

const MessageList = () => {
  const { messages, loading } = useChat();
  const endOfMessagesRef = useRef(null);

  // This effect scrolls to the bottom when new messages arrive
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <MessageListContainer>
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
      {/* This empty div is a marker for scrolling to the bottom */}
      <div ref={endOfMessagesRef} />
    </MessageListContainer>
  );
};

export default MessageList;