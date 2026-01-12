import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';
import ProfileDrawer from '../profile/ProfileDrawer'; // Import ProfileDrawer
import { HiDotsVertical } from 'react-icons/hi';
import { AiOutlineSearch } from 'react-icons/ai';
import { IoMdArrowBack } from 'react-icons/io'; // Back Arrow

// Helper
const subtleBorder = (theme) => `1px solid ${theme.colors.border || theme.colors.hoverBackground}`;

const ChatWindowContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%; // Take full height from parent (StyledChatWindow)
  background: ${props => props.theme.colors.chatBackground}; // Use background to support gradients
`;

const ChatHeader = styled.header`
  padding: 0.6rem 1rem;
  background-color: ${props => props.theme.colors.headerBackground};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: ${props => subtleBorder(props.theme)};
  flex-shrink: 0; // Prevent header shrinking
  position: relative;
  z-index: 10; // Ensure it stays on top
`;

// --- FIX: Define IconButton *before* BackButton ---
const IconButton = styled.button`
  background: none; border: none;
  color: ${props => props.theme.colors.icon};
  cursor: pointer; font-size: 1.5rem; display: flex; align-items: center;
  padding: 4px; border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease;
  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    color: ${props => props.theme.colors.iconActive};
  }
`;
// --- END FIX ---

// Now BackButton can correctly extend IconButton
const BackButton = styled(IconButton)`
  display: none; // Hidden by default on larger screens
  margin-right: 0.5rem;
  z-index: 20; // Ensure it's above other elements
  
  @media (max-width: 900px) { 
    display: flex !important; // Force display on mobile
  } 
`;

const ChatInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  min-width: 0; // Allow shrinking
  flex-grow: 1; // Take up available space
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
  min-width: 0; // Allow shrinking
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
`;

// --- ChatWindow Component ---
const ChatWindow = ({ onBack }) => {
    const { activeChat, onlineUsers } = useChat();
    const { user } = useAuth();
    const [showProfile, setShowProfile] = useState(false);

    // Guard clause: If there's no active chat, render nothing
    if (!activeChat) {
        return null;
    }

    // Logic to find display info (remains the same)
    let displayName = 'Chat';
    let displayPicture = `https://i.pravatar.cc/150?u=default`;
    let otherUserId = null;
    let isOnline = false;
    let profileTarget = null;

    if (activeChat.isGroup) {
        displayName = activeChat.groupName || 'Group Chat';
        displayPicture = activeChat.groupIcon || `https://i.pravatar.cc/150?u=${activeChat._id}`;
        // Map group info to user-like object for ProfileDrawer
        profileTarget = {
            _id: activeChat._id,
            name: activeChat.groupName,
            profilePic: activeChat.groupIcon,
            about: activeChat.description || 'Group Chat',
            email: `${activeChat.participants?.length || 0} members`
        };
    } else if (user && activeChat.participants) {
        const otherParticipant = activeChat.participants.find(p => p._id !== user._id);
        if (otherParticipant) {
            displayName = otherParticipant.name;
            displayPicture = otherParticipant.profilePic || `https://i.pravatar.cc/150?u=${otherParticipant._id}`;
            otherUserId = otherParticipant._id;
            isOnline = onlineUsers.includes(otherUserId);
            profileTarget = otherParticipant;
        } else {
             displayName = "Chat User";
             displayPicture = `https://i.pravatar.cc/150?u=unknown`;
        }
    }


  return (
    <ChatWindowContainer>
      <ChatHeader>
        <ChatInfo onClick={() => setShowProfile(true)}>
          <BackButton onClick={(e) => { e.stopPropagation(); onBack(); }}>
            <IoMdArrowBack />
          </BackButton>
          <ChatAvatar src={displayPicture} alt={displayName} />
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

      <MessageList />
      <MessageInput />

      {/* Profile Drawer for viewing contact/group info */}
      <ProfileDrawer 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
        targetUser={profileTarget} 
      />
    </ChatWindowContainer>
  );
};

ChatWindow.propTypes = {
  onBack: PropTypes.func.isRequired,
};


export default ChatWindow;

