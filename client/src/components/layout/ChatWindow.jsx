import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';
import ProfileDrawer from '../profile/ProfileDrawer'; // Import ProfileDrawer
import { AiOutlineSearch } from 'react-icons/ai';
import { IoMdArrowBack, IoMdClose, IoMdTrash, IoMdShareAlt, IoMdUndo } from 'react-icons/io'; // Added Undo for Reply

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
  background-color: ${props => props.isSelectionMode ? props.theme.colors.primary : props.theme.colors.headerBackground}; /* Highlight in selection mode */
  color: ${props => props.isSelectionMode ? '#FFF' : props.theme.colors.textPrimary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: ${props => subtleBorder(props.theme)};
  flex-shrink: 0; // Prevent header shrinking
  position: relative;
  z-index: 10; // Ensure it stays on top
  height: 60px; // Fixed height for consistency
  transition: background-color 0.2s ease;
`;

const IconButton = styled.button`
  background: none; border: none;
  color: ${props => props.inheritColor ? 'inherit' : props.theme.colors.icon};
  cursor: pointer; font-size: 1.5rem; display: flex; align-items: center;
  padding: 8px; border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease;
  &:hover {
    background-color: ${props => props.inheritColor ? 'rgba(255,255,255,0.2)' : props.theme.colors.hoverBackground};
    color: ${props => props.inheritColor ? '#FFF' : props.theme.colors.iconActive};
  }
`;

// BackButton for Mobile
const BackButton = styled(IconButton)`
  display: none; 
  margin-right: 0.5rem;
  
  @media (max-width: 900px) { 
    display: flex !important; 
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
  color: inherit; /* Inherit from Header */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatStatus = styled.span`
  font-size: 0.75rem;
  color: ${props => props.isSelectionMode ? 'rgba(255,255,255,0.8)' : props.theme.colors.textSecondary};
`;

const HeaderIcons = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

// --- ChatWindow Component ---
const ChatWindow = ({ onBack }) => {
    const { activeChat, onlineUsers, selectedMessages, isSelectionMode, clearSelection, setReplyingTo, messages, deleteMessage } = useChat();
    const { user } = useAuth();
    const [showProfile, setShowProfile] = useState(false);

    // Guard clause
    if (!activeChat) return null;

    // --- Action Handlers ---
    const handleReply = () => {
        const msgId = selectedMessages[0];
        const msg = messages.find(m => m._id === msgId);
        if (msg) setReplyingTo(msg);
        clearSelection();
    };

    const handleDelete = () => {
        if (window.confirm(`Delete ${selectedMessages.length} messages?`)) {
            deleteMessage(selectedMessages);
        }
    };

    const handleForward = () => {
        alert("Forwarding feature coming soon!");
        clearSelection();
    };


    // Logic to find display info (remains the same)
    let displayName = 'Chat';
    let displayPicture = `https://i.pravatar.cc/150?u=default`;
    let otherUserId = null;
    let isOnline = false;
    let profileTarget = null;

    if (activeChat.isGroup) {
        displayName = activeChat.groupName || 'Group Chat';
        displayPicture = activeChat.groupIcon || `https://i.pravatar.cc/150?u=${activeChat._id}`;
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
      {isSelectionMode ? (
        // --- Contextual Action Bar ---
        <ChatHeader isSelectionMode>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <IconButton inheritColor onClick={clearSelection}><IoMdClose /></IconButton>
                <ChatName>{selectedMessages.length} selected</ChatName>
            </div>
            <HeaderIcons>
                {selectedMessages.length === 1 && (
                    <IconButton inheritColor onClick={handleReply} title="Reply">
                        <IoMdUndo /> {/* Using Undo as Reply Icon looks similar */}
                    </IconButton>
                )}
                <IconButton inheritColor onClick={handleDelete} title="Delete">
                    <IoMdTrash />
                </IconButton>
                <IconButton inheritColor onClick={handleForward} title="Forward">
                    <IoMdShareAlt />
                </IconButton>
            </HeaderIcons>
        </ChatHeader>
      ) : (
        // --- Normal Header ---
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
            {/* Removed Three-Dots Menu */}
            </HeaderIcons>
        </ChatHeader>
      )}

      <MessageList />
      <MessageInput />

      {/* Profile Drawer */}
      <ProfileDrawer 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
        targetUser={profileTarget} 
      />
    </ChatWindowContainer>
  );
};

export default ChatWindow;