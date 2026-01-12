import React from 'react';
import styled from 'styled-components';
import { IoMdClose } from 'react-icons/io';
import BackupRestore from './BackupRestore';

// Modal components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease;
`;

const ModalContainer = styled.div`
  background-color: ${props => props.theme.colors.black_lighter || props.theme.colors.panelBackground};
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  transform: ${props => (props.isOpen ? 'scale(1)' : 'scale(0.9)')};
  opacity: ${props => (props.isOpen ? 1 : 0)};
  transition: all 0.3s ease;
  color: ${props => props.theme.colors.textPrimary};
`;

const ModalHeader = styled.div`
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.colors.border || props.theme.colors.black};
`;

const HeaderTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.icon};
  font-size: 1.75rem;
  cursor: pointer;
  display: flex;
  padding: 2px;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
  }
`;

const ModalContent = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
`;

const SettingsModal = ({ isOpen, onClose }) => {
  // This stops the modal from closing when clicking inside it
  const handleModalClick = (e) => e.stopPropagation();

  return (
    <Overlay isOpen={isOpen} onClick={onClose}>
      <ModalContainer isOpen={isOpen} onClick={handleModalClick}>
        <ModalHeader>
          <HeaderTitle>Settings</HeaderTitle>
          <CloseButton onClick={onClose}>
            <IoMdClose />
          </CloseButton>
        </ModalHeader>
        <ModalContent>
          {/* We can add more settings sections here later */}
          <BackupRestore />
        </ModalContent>
      </ModalContainer>
    </Overlay>
  );
};

export default SettingsModal;