import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext'; 
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

const MessageList = () => {
  const { 
      messages, loading, activeChat, selectedMessages, 
      toggleMessageSelection, isSelectionMode, replyingTo, setReplyingTo,
      chatSearchTerm 
  } = useChat(); 
  
  const endOfMessagesRef = useRef(null);
  const [matchIds, setMatchIds] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  let lastDate = null;

  useEffect(() => {
      if (!chatSearchTerm) {
          setMatchIds([]);
          setCurrentMatchIndex(-1);
          return;
      }
      const term = chatSearchTerm.toLowerCase();
      const matches = messages
        .filter(msg => msg.content && msg.content.toLowerCase().includes(term))
        .map(msg => msg._id);
      
      setMatchIds(matches);
      setCurrentMatchIndex(matches.length > 0 ? matches.length - 1 : -1);
  }, [chatSearchTerm, messages]);

  useEffect(() => {
      if (currentMatchIndex !== -1 && matchIds[currentMatchIndex]) {
          const el = document.getElementById(`msg-${matchIds[currentMatchIndex]}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }, [currentMatchIndex, matchIds]);

  useEffect(() => {
      window._searchNext = () => setCurrentMatchIndex(prev => (prev > 0 ? prev - 1 : matchIds.length - 1));
      window._searchPrev = () => setCurrentMatchIndex(prev => (prev < matchIds.length - 1 ? prev + 1 : 0));
      return () => { delete window._searchNext; delete window._searchPrev; };
  }, [matchIds]);

  useEffect(() => {
    if (!chatSearchTerm) endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, chatSearchTerm]);

   useEffect(() => {
     endOfMessagesRef.current?.scrollIntoView({ behavior: 'auto' });
   }, [activeChat?._id]); 

   useEffect(() => {
     if (replyingTo) endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [replyingTo]);

  if (loading) return <LoadingSpinner />;

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
    <MessageListContainer>
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
                if (!msg || !msg.createdAt) return null;
                const messageDateStr = new Date(msg.createdAt).toDateString();
                const showDateSeparator = messageDateStr !== lastDate;
                lastDate = messageDateStr;
                const isSelected = selectedMessages.includes(msg._id);
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
                        searchTerm={chatSearchTerm}
                        isCurrentMatch={currentMatchIndex !== -1 && matchIds[currentMatchIndex] === msg._id}
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