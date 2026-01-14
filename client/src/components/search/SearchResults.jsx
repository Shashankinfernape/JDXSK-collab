import React from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext';
import api from '../../services/api'; 
import userService from '../../services/user.service';

const ResultsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: ${props => props.theme.colors.panelBackground};
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  gap: 0.75rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
  }
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  flex: 1;
  overflow: hidden;
  cursor: pointer;
`;

const UserName = styled.h4`
  font-size: 1.05rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary};
`;

const UserEmail = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ActionButton = styled.button`
    padding: 6px 16px;
    border-radius: 8px; /* More rounded like Insta */
    border: none;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s;
    /* Insta Logic: Blue for primary action (Follow), Grey/Transparent for secondary (Following/Message) */
    background-color: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.inputBackground}; 
    color: ${props => props.primary ? '#fff' : props.theme.colors.textPrimary};
    
    &:hover {
        opacity: 0.8;
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: default;
    }
`;

const NoResults = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;


const SearchResults = ({ results, onUserClick }) => {
  const { selectChat, addNewChat } = useChat();

  const handleStartChat = async (recipientId) => {
    try {
      const { data: newChat } = await api.post('/chats', { recipientId });
      addNewChat(newChat);
      selectChat(newChat);
      onUserClick();
    } catch (error) {
      console.error("Failed to create chat", error);
    }
  };

  const handleFollow = async (e, userId) => {
      e.stopPropagation();
      try {
          await userService.followUser(userId);
          // Ideally update state, but for now we might close or just rely on search refresh if it wasn't clearing
          onUserClick(); 
      } catch (err) {
          alert("Failed to follow: " + (err.response?.data?.message || err.message));
      }
  };

  if (results.length === 0) {
    return <NoResults>No users found.</NoResults>
  }

  return (
    <ResultsContainer>
      {results.map(user => (
        <ResultItem key={user._id}>
          <Avatar src={user.profilePic || `https://i.pravatar.cc/150?u=${user._id}`} alt={user.name} />
          <UserInfo onClick={() => handleStartChat(user._id)}>
            <UserName>{user.name}</UserName>
            <UserEmail>{user.email}</UserEmail>
          </UserInfo>
          
          {/* Status Logic */}
          {user.connectionStatus === 'following' ? (
              <ActionButton onClick={(e) => {e.stopPropagation(); /* Unfollow logic later? */}}>Following</ActionButton>
          ) : user.connectionStatus === 'follows_you' ? (
              <ActionButton primary onClick={(e) => handleFollow(e, user._id)}>Follow Back</ActionButton>
          ) : user.connectionStatus === 'friend' ? ( 
              // Legacy support or just show Following
              <ActionButton onClick={() => handleStartChat(user._id)}>Message</ActionButton>
          ) : user.connectionStatus === 'none' ? (
              <ActionButton primary onClick={(e) => handleFollow(e, user._id)}>Follow</ActionButton>
          ) : (
              // Pending cases fallback
              <ActionButton disabled>Request Sent</ActionButton>
          )}

        </ResultItem>
      ))}
    </ResultsContainer>
  );
};

export default SearchResults;