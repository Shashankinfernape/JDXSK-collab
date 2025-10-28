import React from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext';
import ChatListItem from './ChatListItem';
// --- FIX: Removed unused import ---
// import LoadingSpinner from '../common/LoadingSpinner';
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
  // Assuming loading state is handled elsewhere or not needed for now
  const { chats, activeChat } = useChat();

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

