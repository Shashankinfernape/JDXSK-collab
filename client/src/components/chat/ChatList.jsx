import React from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext';
import ChatListItem from './ChatListItem';
import LoadingSpinner from '../common/LoadingSpinner';
import PropTypes from 'prop-types';

const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const NoChatsMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

const ChatList = ({ onChatSelect }) => {
  const { chats, activeChat, loading } = useChat();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!chats || chats.length === 0) {
    return <NoChatsMessage>No chats yet. Start a new chat!</NoChatsMessage>;
  }

  return (
    <ChatListContainer>
      {chats.map(chat => (
        <ChatListItem
          key={chat._id}
          chat={chat}
          isActive={activeChat?._id === chat._id}
          onClick={() => onChatSelect(chat)}
        />
      ))}
    </ChatListContainer>
  );
};

ChatList.propTypes = {
  onChatSelect: PropTypes.func.isRequired,
};

export default ChatList;

