import React from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext';
import ChatListItem from './ChatListItem';
import LoadingSpinner from '../common/LoadingSpinner';

const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: ${props => props.theme.colors.black};
`;

const NoChatsMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${props => props.theme.colors.grey};
`;

const ChatList = () => {
  const { chats, selectChat, activeChat } = useChat();

  // In a real app, we'd have a 'loading' state
  // if (loading) {
  //   return <LoadingSpinner />;
  // }

  if (!chats || chats.length === 0) {
    return <NoChatsMessage>No chats yet.</NoChatsMessage>;
  }

  return (
    <ChatListContainer>
      {chats.map(chat => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isActive={activeChat?.id === chat.id}
          onClick={() => selectChat(chat)}
        />
      ))}
    </ChatListContainer>
  );
};

export default ChatList;