import React from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext'; 
import { useAuth } from '../../context/AuthContext'; 
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';
import { HiDotsVertical } from 'react-icons/hi';
import { AiOutlineSearch } from 'react-icons/ai';

const ChatWindowContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-left: 1px solid ${props => props.theme.colors.black_lighter};
`;

const ChatHeader = styled.header`
  padding: 1rem;
  background-color: ${props => props.theme.colors.black_lighter};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.colors.black};
`;

const ChatInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
`;

const ChatAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const ChatName = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${props => props.theme.colors.white};
`;

const ChatStatus = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.grey_light};
`;

const HeaderIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.grey_light};
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.black_lightest};
    color: ${props => props.theme.colors.white};
  }
`;

const ChatWindow = () => {
  const { activeChat, onlineUsers } = useChat(); 
  const { user } = useAuth(); 

  if (!activeChat) return null;

  let displayName = activeChat.groupName;
  let displayPicture = activeChat.groupIcon;
  let otherUserId = null; 

  if (!activeChat.isGroup) {
    // --- THIS WAS THE FIX ---
    const otherParticipant = activeChat.participants.find(p => p._id !== user._id); 
    // --- END FIX ---
    if (otherParticipant) {
      displayName = otherParticipant.name;
      displayPicture = otherParticipant.profilePic;
      otherUserId = otherParticipant._id; 
    }
  }
  
  const isOnline = otherUserId ? onlineUsers.includes(otherUserId) : false;

  return (
    <ChatWindowContainer>
      <ChatHeader>
        <ChatInfo>
          <ChatAvatar src={displayPicture || `https://i.pravatar.cc/150?u=${displayName}`} alt={displayName} />
          <div>
            <ChatName>{displayName}</ChatName>
            {!activeChat.isGroup && (
              <ChatStatus>{isOnline ? 'online' : 'offline'}</ChatStatus>
            )}
            {activeChat.isGroup && (
               <ChatStatus>{activeChat.participants.length} members</ChatStatus>
            )}
          </div>
        </ChatInfo>
        <HeaderIcons>
          <IconButton>
            <AiOutlineSearch />
          </IconButton>
          <IconButton>
            <HiDotsVertical />
          </IconButton>
        </HeaderIcons>
      </ChatHeader>

      <MessageList />
      <MessageInput />
    </ChatWindowContainer>
  );
};

export default ChatWindow;