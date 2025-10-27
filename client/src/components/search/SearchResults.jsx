import React from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext';
import api from '../../services/api'; 

// ... (styled-components are correct) ...
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
  cursor: pointer;
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

const NoResults = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${props => props.theme.colors.grey};
`;


const SearchResults = ({ results, onUserClick }) => {
  // --- MODIFIED ---
  const { selectChat, addNewChat } = useChat();

  const handleUserClick = async (recipientId) => {
    try {
      // 1. Call the API to create/get a new 1-on-1 chat
      const { data: newChat } = await api.post('/chats', { recipientId });
      
      // 2. Add this chat to our local state *immediately*
      addNewChat(newChat);

      // 3. Select the new chat
      selectChat(newChat);
      
      // 4. Close the search results
      onUserClick();

    } catch (error) {
      console.error("Failed to create chat", error);
    }
  };
  // --- END MODIFICATION ---

  if (results.length === 0) {
    return <NoResults>No users found.</NoResults>
  }

  return (
    <ResultsContainer>
      {results.map(user => (
        <ResultItem key={user._id} onClick={() => handleUserClick(user._id)}>
          <Avatar src={user.profilePic} alt={user.name} />
          <UserInfo>
            <UserName>{user.name}</UserName>
            <UserEmail>{user.email}</UserEmail>
          </UserInfo>
        </ResultItem>
      ))}
    </ResultsContainer>
  );
};

export default SearchResults;