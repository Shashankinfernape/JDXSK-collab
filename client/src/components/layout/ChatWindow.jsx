import React from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';
import { HiDotsVertical } from 'react-icons/hi';
import { AiOutlineSearch } from 'react-icons/ai'; // Assuming you want search in chat header too

// Helper for subtle borders
const subtleBorder = (theme) => `1px solid ${theme.colors.border || theme.colors.hoverBackground}`;

const ChatWindowContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${props => props.theme.colors.background}; // Use main background
  // No border needed, sidebar has the border now
`;

const ChatHeader = styled.header`
  padding: 0.6rem 1rem; // Match sidebar header padding
  background-color: ${props => props.theme.colors.headerBackground}; // Match sidebar header bg
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: ${props => subtleBorder(props.theme)}; // Consistent subtle border
  flex-shrink: 0; // Prevent header from shrinking
`;

const ChatInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  min-width: 0; // Allow shrinking if needed
  flex-grow: 1; // Take up available space
`;

const ChatAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const InfoTextContainer = styled.div` // Wrapper for name and status
  display: flex;
  flex-direction: column;
  min-width: 0; // Allow shrinking
`;

const ChatName = styled.h3`
  font-size: 1rem; // Adjust size
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary}; // Use primary text color
  white-space: nowrap; // Prevent wrapping
  overflow: hidden;
  text-overflow: ellipsis; // Add ellipsis if name is too long
`;

const ChatStatus = styled.span`
  font-size: 0.75rem; // Adjust size
  color: ${props => props.theme.colors.textSecondary}; // Use secondary text color
`;

const HeaderIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem; // Adjust gap as needed
  flex-shrink: 0; // Prevent icons from shrinking
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.icon}; // Use theme icon color
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    color: ${props => props.theme.colors.iconActive}; // Use active icon color
  }
`;

// --- Component ---
const ChatWindow = () => {
  const { activeChat, onlineUsers } = useChat();
  const { user } = useAuth();

  if (!activeChat) {
      // Display placeholder when no chat is selected (like WhatsApp Web)
      // You might want to style this better later
      return (
        <ChatWindowContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <h2>Select a chat</h2>
            <p>Start messaging or select a chat from the sidebar.</p>
          </div>
        </ChatWindowContainer>
      );
  }


  // Logic to determine display name, picture, and online status
  let displayName = activeChat.groupName;
  let displayPicture = activeChat.groupIcon;
  let otherUserId = null;

  if (!activeChat.isGroup) {
    const otherParticipant = activeChat.participants?.find(p => p?._id !== user?._id);
    if (otherParticipant) {
      displayName = otherParticipant.name;
      displayPicture = otherParticipant.profilePic;
      otherUserId = otherParticipant._id;
    } else {
        displayName = "Chat"; // Fallback
    }
  }
  displayName = displayName || "Chat"; // Ensure display name is not null/undefined
  const isOnline = otherUserId ? onlineUsers.includes(otherUserId) : false;

  return (
    <ChatWindowContainer>
      <ChatHeader>
        <ChatInfo>
          <ChatAvatar
            src={displayPicture || `https://i.pravatar.cc/150?u=${displayName}`}
            alt={displayName}
           />
          <InfoTextContainer>
            <ChatName>{displayName}</ChatName>
            {!activeChat.isGroup && (
              <ChatStatus>{isOnline ? 'online' : 'offline'}</ChatStatus> // Consider showing 'last seen' later
            )}
            {activeChat.isGroup && (
               <ChatStatus>{activeChat.participants?.length || 0} members</ChatStatus> // Add check for participants array
            )}
          </InfoTextContainer>
        </ChatInfo>
        <HeaderIcons>
          {/* Add relevant icons */}
          <IconButton><AiOutlineSearch /></IconButton>
          <IconButton><HiDotsVertical /></IconButton>
        </HeaderIcons>
      </ChatHeader>

      <MessageList />
      <MessageInput />
    </ChatWindowContainer>
  );
};

export default ChatWindow;
