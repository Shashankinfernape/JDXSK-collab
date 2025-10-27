import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/user.service'; // Import the new service
import { IoMdArrowBack } from 'react-icons/io';
import { MdEdit, MdCheck } from 'react-icons/md';
import Input from '../common/Input';

// ... (Keep all the styled-components like Overlay, DrawerContainer, etc. They are correct)
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease;
`;

const DrawerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: ${props => props.theme.panel_width};
  max-width: ${props => props.theme.max_panel_width};
  min-width: 300px;
  height: 100vh;
  background-color: ${props => props.theme.colors.black};
  z-index: 1001;
  transform: ${props => (props.isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.3s ease-out;
  display: flex;
  flex-direction: column;
`;

const DrawerHeader = styled.div`
  padding: 1rem;
  padding-top: 3.5rem; /* Space for status bar on mobile */
  background-color: ${props => props.theme.colors.black_lightest};
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.white};
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
`;

const HeaderTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.white};
`;

const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 1.5rem;
`;

const ProfileImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  cursor: pointer;
  border: 4px solid ${props => props.theme.colors.black_lighter};
`;

const InfoBlock = styled.div`
  width: 100%;
  padding: 1rem;
  background-color: ${props => props.theme.colors.black_lighter};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoLabel = styled.label`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  text-transform: uppercase;
`;

const InfoText = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.grey_light};
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
`;
// ... (End of styled-components)


const ProfileDrawer = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth(); // 'updateUser' is from AuthContext
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [name, setName] = useState(user.name);
  const [about, setAbout] = useState(user.about || 'Just watching Netflix... and chatting.');

  const handleSaveName = async () => {
    try {
      // 1. Call the API to save to database
      const { data: updatedUser } = await userService.updateUser({ name });
      
      // 2. Update the local user state in AuthContext
      updateUser(updatedUser); 
      
      // 3. Close the editor
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update name", error);
    }
  };
  
  const handleSaveAbout = async () => {
    try {
      // 1. Call the API to save to database
      const { data: updatedUser } = await userService.updateUser({ about });
      
      // 2. Update the local user state in AuthContext
      updateUser(updatedUser); 
      
      // 3. Close the editor
      setIsEditingAbout(false);
    } catch (error) {
      console.error("Failed to update about", error);
    }
  };

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <DrawerContainer isOpen={isOpen}>
        <DrawerHeader>
          <BackButton onClick={onClose}>
            <IoMdArrowBack />
          </BackButton>
          <HeaderTitle>Profile</HeaderTitle>
        </DrawerHeader>

        <ProfileContent>
          <ProfileImage src={user.profilePic} alt="Profile" />

          <InfoBlock>
            <InfoLabel>Your Name</InfoLabel>
            {isEditingName ? (
              <InfoRow>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                <EditButton onClick={handleSaveName}><MdCheck /></EditButton>
              </InfoRow>
            ) : (
              <InfoRow>
                <InfoText>{user.name}</InfoText>
                <EditButton onClick={() => setIsEditingName(true)}><MdEdit /></EditButton>
              </InfoRow>
            )}
          </InfoBlock>

          <InfoBlock>
            <InfoLabel>About</InfoLabel>
             {isEditingAbout ? (
              <InfoRow>
                <Input type="text" value={about} onChange={(e) => setAbout(e.target.value)} />
                <EditButton onClick={handleSaveAbout}><MdCheck /></EditButton>
              </InfoRow>
            ) : (
              <InfoRow>
                <InfoText>{user.about || 'Just watching Netflix... and chatting.'}</InfoText>
                <EditButton onClick={() => setIsEditingAbout(true)}><MdEdit /></EditButton>
              </InfoRow>
            )}
          </InfoBlock>
        </ProfileContent>
      </DrawerContainer>
    </>
  );
};

export default ProfileDrawer;