import React from 'react';
import styled from 'styled-components';

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

const NoResults = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;


const SearchResults = ({ results, onUserClick }) => {
  if (results.length === 0) {
    return <NoResults>No users found.</NoResults>
  }

  return (
    <ResultsContainer>
      {results.map(user => (
        <ResultItem key={user._id} onClick={() => onUserClick(user)} style={{cursor: 'pointer'}}>
          <Avatar src={user.profilePic || `https://i.pravatar.cc/150?u=${user._id}`} alt={user.name} />
          <UserInfo>
            <UserName>{user.name}</UserName>
            <UserEmail>{user.email}</UserEmail>
          </UserInfo>
          
          {user.connectionStatus === 'following' && (
             <span style={{ fontSize: '0.8rem', opacity: 0.6, marginRight: '1rem' }}>Following</span>
          )}
        </ResultItem>
      ))}
    </ResultsContainer>
  );
};

export default SearchResults;