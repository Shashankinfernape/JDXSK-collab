import React from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext';
import api from '../../services/api'; 
import userService from '../../services/user.service';

const ResultsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: ${props => props.theme.colors.black};
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  gap: 0.75rem;
  border-bottom: 1px solid ${props => props.theme.colors.black_lighter};

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

const UserInfo = styled.div`
  flex: 1;
  overflow: hidden;
  cursor: pointer;
`;

const UserName = styled.h4`
  font-size: 1.05rem;
  font-weight: 500;
  color: ${props => props.theme.colors.white};
`;

const UserEmail = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.grey_light};
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
    background-color: ${props => props.primary ? '#0095F6' : '#EFEFEF'}; 
    color: ${props => props.primary ? '#fff' : '#000'};
    
    /* Dark mode override if needed, but keeping simple for now or using theme */
    ${props => props.theme.mode === 'dark' && !props.primary && `
        background-color: #363636;
        color: #fff;
    `}
    
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
  color: ${props => props.theme.colors.grey};
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

  const handleSendRequest = async (e, userId) => {
      e.stopPropagation();
      try {
          await userService.sendFriendRequest(userId);
          // Optimistically update UI or just reload search? 
          // For now, simpler to just alert or rely on parent
          onUserClick(); // Close search on action (Insta usually keeps open, but this closes)
      } catch (err) {
          alert("Failed to send request: " + (err.response?.data?.message || err.message));
      }
  };

  if (results.length === 0) {
    return <NoResults>No users found.</NoResults>
  }

  return (
    <ResultsContainer>
      {results.map(user => (
        <ResultItem key={user._id}>
          <Avatar src={user.profilePic} alt={user.name} />
          <UserInfo onClick={() => user.connectionStatus === 'friend' && handleStartChat(user._id)}>
            <UserName>{user.name}</UserName>
            <UserEmail>{user.email}</UserEmail>
          </UserInfo>
          
          {user.connectionStatus === 'friend' && (
              <ActionButton onClick={() => handleStartChat(user._id)}>Message</ActionButton>
          )}
          {user.connectionStatus === 'none' && (
              <ActionButton primary onClick={(e) => handleSendRequest(e, user._id)}>Follow</ActionButton>
          )}
          {user.connectionStatus === 'pending_sent' && (
              <ActionButton disabled>Requested</ActionButton>
          )}
          {user.connectionStatus === 'pending_received' && (
              <ActionButton disabled>Follow Back</ActionButton> 
          )}
        </ResultItem>
      ))}
    </ResultsContainer>
  );
};

export default SearchResults;