import React from 'react';
import styled from 'styled-components';
import { IoMdClose } from 'react-icons/io';

const Overlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.6); z-index: 2000;
  display: flex; justify-content: center; align-items: center;
`;

const Modal = styled.div`
  background: ${props => props.theme.colors.panelBackground};
  width: 90%; max-width: 400px; max-height: 70vh;
  border-radius: 12px; display: flex; flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
`;

const Header = styled.div`
  padding: 1rem; border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex; justify-content: space-between; align-items: center;
  font-weight: 600; color: ${props => props.theme.colors.textPrimary};
  font-size: 1.1rem;
`;

const List = styled.div`
  flex: 1; overflow-y: auto; padding: 0.5rem;
`;

const UserItem = styled.div`
  display: flex; align-items: center; gap: 1rem; padding: 0.8rem;
  border-radius: 8px; cursor: pointer;
  &:hover { background: ${props => props.theme.colors.hoverBackground}; }
`;

const Avatar = styled.img`
  width: 40px; height: 40px; border-radius: 50%; object-fit: cover;
`;

const Name = styled.span`
  color: ${props => props.theme.colors.textPrimary}; font-weight: 500;
`;

const UserListModal = ({ isOpen, onClose, title, users, onUserClick }) => {
  if (!isOpen) return null;
  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          {title}
          <IoMdClose onClick={onClose} style={{cursor: 'pointer', fontSize: '1.5rem'}} />
        </Header>
        <List>
          {users?.map(user => (
            <UserItem key={user._id} onClick={() => onUserClick(user)}>
              <Avatar src={user.profilePic || `https://i.pravatar.cc/150?u=${user._id}`} />
              <Name>{user.name}</Name>
            </UserItem>
          ))}
          {(!users || users.length === 0) && <div style={{padding: '1rem', textAlign: 'center', opacity: 0.6}}>No users found</div>}
        </List>
      </Modal>
    </Overlay>
  );
};

export default UserListModal;