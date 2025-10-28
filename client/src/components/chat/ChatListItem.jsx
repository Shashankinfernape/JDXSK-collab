import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

// Helper for subtle borders
const subtleBorder = (theme) => `1px solid ${theme.colors.border || theme.colors.hoverBackground}`;

// --- WhatsApp Style ---
const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem; // Slightly reduced padding
  gap: 0.9rem; // Increased gap
  cursor: pointer;
  // border-bottom: ${props => subtleBorder(props.theme)}; // REMOVED border for cleaner look
  background-color: ${props => props.isActive ? props.theme.colors.hoverBackground : 'transparent'};
  transition: background-color 0.15s ease-out;
  position: relative; // For potential absolute positioned elements later

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
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 45px;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.15rem;
`;

const ChatName = styled.h4`
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary}; // Use theme text color
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 60px); // Prevent overlap with timestamp
`;

const Timestamp = styled.span`
  font-size: 0.7rem;
  color: ${props => props.theme.colors.textSecondary}; // Use theme secondary text color
  margin-left: 0.5rem;
  flex-shrink: 0;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LastMessage = styled.p`
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary}; // Use theme secondary text color
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
`;

// Helper function
const formatTimestamp = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

const ChatListItem = ({ chat, isActive, onClick }) => {
  const { user } = useAuth();

  let displayName = chat.groupName;
  let displayPicture = chat.groupIcon;

  if (!chat.isGroup) {
    const otherParticipant = chat.participants?.find(p => p?._id !== user?._id); // Add optional chaining
    if (otherParticipant) {
      displayName = otherParticipant.name;
      displayPicture = otherParticipant.profilePic;
    } else {
        displayName = "Chat"; // Fallback if participant data is missing
    }
  }

  // Fallback if name is somehow undefined
  displayName = displayName || "Chat";

  return (
    <ItemContainer isActive={isActive} onClick={onClick}>
      <Avatar src={displayPicture || `https://i.pravatar.cc/150?u=${displayName}`} alt={displayName} />
      <ChatDetails>
        <TopRow>
          <ChatName>{displayName}</ChatName>
          <Timestamp>{formatTimestamp(chat.lastMessage?.createdAt)}</Timestamp>
        </TopRow>
        <BottomRow>
          {/* Add check for lastMessage existence */}
          <LastMessage>{chat.lastMessage?.content || ' '}</LastMessage>
          {/* Placeholder for unread count */}
        </BottomRow>
      </ChatDetails>
    </ItemContainer>
  );
};

export default ChatListItem;
