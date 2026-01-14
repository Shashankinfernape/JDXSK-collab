import React from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext';
import ChatListItem from './ChatListItem';
import Skeleton from '../common/Skeleton';
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
    return (
      <ChatListContainer>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ display: 'flex', padding: '12px 16px', alignItems: 'center', gap: '12px' }}>
             <Skeleton width="48px" height="48px" circle />
             <div style={{ flex: 1 }}>
                <Skeleton width="40%" height="14px" margin="0 0 6px 0" />
                <Skeleton width="70%" height="12px" />
             </div>
          </div>
        ))}
      </ChatListContainer>
    );
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

