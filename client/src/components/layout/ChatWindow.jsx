import React from 'react';
// --- FIX: Removed 'css' from import ---
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
// --- FIX: Import useTheme for background animation check ---
import { useTheme } from '../../context/ThemeContext';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';
import { HiDotsVertical } from 'react-icons/hi';
import { AiOutlineSearch } from 'react-icons/ai';

// Helper
const subtleBorder = (theme) => `1px solid ${theme.colors.border || theme.colors.hoverBackground}`;

const ChatWindowContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${props => props.theme.colors.background};
  // --- FIX: Apply background animation correctly ---
  ${({ theme }) => theme.name === 'instagram' && theme.backgroundAnimation}
`;

const WelcomePlaceholder = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.welcomeText};
  text-align: center;
  padding: 2rem;

  h2 {
    font-size: 2rem;
    font-weight: 500;
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.textPrimary};
  }
  p {
    font-size: 0.9rem;
    max-width: 300px;
    line-height: 1.5;
  }
`;

const ChatHeader = styled.header`
  padding: 0.6rem 1rem;
  background-color: ${props => props.theme.colors.headerBackground};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: ${props => subtleBorder(props.theme)};
  flex-shrink: 0;
`;

const ChatInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  min-width: 0;
  flex-grow: 1;
`;

const ChatAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const InfoTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const ChatName = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatStatus = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const HeaderIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.icon};
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    color: ${props => props.theme.colors.iconActive};
  }
`;

// --- Component ---
const ChatWindow = () => {
  const { activeChat, onlineUsers } = useChat();
  const { user } = useAuth();
  // --- FIX: Removed unused theme variable ---
  // const { theme } = useTheme(); <-- Removed

  // Get theme object directly for passing to styled component if needed
  const { theme } = useTheme();


  if (!activeChat) {
      return (
        // Pass theme to container for background animation
        <ChatWindowContainer theme={theme}>
            <WelcomePlaceholder>
              <h2>Welcome</h2>
              <p>Select a chat from the sidebar to start messaging.</p>
            </WelcomePlaceholder>
        </ChatWindowContainer>
      );
  }

  // Logic for display name, picture, online status
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
        displayName = "Chat"; // Fallback name
    }
  }
  displayName = displayName || "Chat"; // Ensure displayName is never falsy
  const isOnline = otherUserId ? onlineUsers.includes(otherUserId) : false;

  return (
    // Pass theme to container for background animation
    <ChatWindowContainer theme={theme}>
      <ChatHeader>
        <ChatInfo>
          <ChatAvatar
            src={displayPicture || `https://i.pravatar.cc/150?u=${activeChat._id}`} // Fallback using chat ID
            alt={displayName}
           />
          <InfoTextContainer>
            <ChatName>{displayName}</ChatName>
            {!activeChat.isGroup && (
              <ChatStatus>{isOnline ? 'online' : 'offline'}</ChatStatus>
            )}
            {activeChat.isGroup && (
               <ChatStatus>{activeChat.participants?.length || 0} members</ChatStatus>
            )}
          </InfoTextContainer>
        </ChatInfo>
        <HeaderIcons>
          <IconButton><AiOutlineSearch /></IconButton>
          <IconButton><HiDotsVertical /></IconButton>
        </HeaderIcons>
      </ChatHeader>

      {/* MessageList wrapper */}
      <div style={{ flexGrow: 1, overflowY: 'hidden', display: 'flex' }}>
        <MessageList />
      </div>

      <MessageInput />
    </ChatWindowContainer>
  );
};

export default ChatWindow;

