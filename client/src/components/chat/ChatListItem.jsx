import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  gap: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid ${props => props.theme.colors.black_lighter};
  background-color: ${props => props.isActive ? props.theme.colors.black_lightest : 'transparent'};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.black_lightest};
  }
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

const ChatDetails = styled.div`
  flex: 1;
  overflow: hidden;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
`;

const ChatName = styled.h4`
  font-size: 1.05rem;
  font-weight: 500;
  color: ${props => props.theme.colors.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Timestamp = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.grey};
  margin-left: 0.5rem;
`;

const LastMessage = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.grey_light};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const formatTimestamp = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const ChatListItem = ({ chat, isActive, onClick }) => {
  const { user } = useAuth(); 

  let displayName = chat.groupName;
  let displayPicture = chat.groupIcon;

  if (!chat.isGroup) {
    // --- THIS WAS THE FIX ---
    const otherParticipant = chat.participants.find(p => p._id !== user._id);
    // --- END FIX ---
    
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
        <LastMessage>{chat.lastMessage?.content}</LastMessage>
      </ChatDetails>
    </ItemContainer>
  );
};

export default ChatListItem;