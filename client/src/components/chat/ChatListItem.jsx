import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

// --- WhatsApp Style ---
const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem; // Slightly reduced padding
  gap: 0.9rem; // Increased gap
  cursor: pointer;
  border-bottom: 1px solid ${props => props.theme.colors.hoverBackground}; // Use subtle border
  background-color: ${props => props.isActive ? props.theme.colors.hoverBackground : 'transparent'};
  transition: background-color 0.15s ease-out;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
  }
`;

const Avatar = styled.img`
  width: 45px; // Slightly smaller avatar
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
`;

const ChatDetails = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex; // Use flex to align items vertically
  flex-direction: column;
  justify-content: center; // Center content vertically
  min-height: 45px; // Ensure minimum height matches avatar
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline; // Align baseline of name and time
  margin-bottom: 0.15rem; // Reduced margin
`;

const ChatName = styled.h4`
  font-size: 1rem; // Slightly smaller name
  font-weight: 500; // Normal weight
  color: ${props => props.theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 60px); // Prevent overlap with timestamp
`;

const Timestamp = styled.span`
  font-size: 0.7rem; // Smaller timestamp
  color: ${props => props.theme.colors.textSecondary};
  margin-left: 0.5rem;
  flex-shrink: 0; // Prevent timestamp from shrinking
`;

const BottomRow = styled.div` // Added for message preview and potential icons
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LastMessage = styled.p`
  font-size: 0.85rem; // Slightly smaller message preview
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1; // Allow message to take available space
  // Add margin-right if you add unread count/icons
`;

// Helper function
const formatTimestamp = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Basic time formatting
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

const ChatListItem = ({ chat, isActive, onClick }) => {
  const { user } = useAuth();

  let displayName = chat.groupName;
  let displayPicture = chat.groupIcon;

  if (!chat.isGroup) {
    const otherParticipant = chat.participants.find(p => p._id !== user._id);
    if (otherParticipant) {
      displayName = otherParticipant.name;
      displayPicture = otherParticipant.profilePic;
    }
  }

  return (
    <ItemContainer isActive={isActive} onClick={onClick}>
      <Avatar src={displayPicture || `https://i.pravatar.cc/150?u=${displayName}`} alt={displayName} />
      <ChatDetails>
        <TopRow>
          <ChatName>{displayName}</ChatName>
          <Timestamp>{formatTimestamp(chat.lastMessage?.createdAt)}</Timestamp>
        </TopRow>
        <BottomRow>
          <LastMessage>{chat.lastMessage?.content || ' '}</LastMessage>
          {/* Placeholder for unread count or icons */}
        </BottomRow>
      </ChatDetails>
    </ItemContainer>
  );
};

export default ChatListItem;