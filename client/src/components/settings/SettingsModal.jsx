import React, { useState, useEffect } from 'react';
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
  background-color: ${props => props.theme.colors.panelBackground};
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
  border-bottom: 1px solid ${props => props.theme.colors.border};
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled.h4`
  font-size: 0.95rem;
  text-transform: uppercase;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const SettingsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  &:last-child { border-bottom: none; }
`;

const SettingsLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LabelText = styled.span`
  font-size: 1rem;
  font-weight: 500;
`;

const LabelDesc = styled.span`
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: ${props => props.theme.colors.primary};
  }
  
  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: ${props => props.theme.colors.inputBackground};
  transition: .4s;
  border-radius: 24px;
  border: 1px solid ${props => props.theme.colors.border};

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const SettingsModal = ({ isOpen, onClose }) => {
  // This stops the modal from closing when clicking inside it
  const handleModalClick = (e) => e.stopPropagation();

  const [autoSend, setAutoSend] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('voice_auto_send');
    setAutoSend(stored === 'true');
  }, [isOpen]); // Refresh when opened

  const handleToggleAutoSend = (e) => {
    const newValue = e.target.checked;
    setAutoSend(newValue);
    localStorage.setItem('voice_auto_send', newValue);
  };

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
          
          <div>
            <SectionTitle>Voice Assistant</SectionTitle>
            <SettingsRow>
              <SettingsLabel>
                <LabelText>Auto-send Messages</LabelText>
                <LabelDesc>Send voice commands without confirmation</LabelDesc>
              </SettingsLabel>
              <ToggleSwitch>
                <ToggleInput 
                  type="checkbox" 
                  checked={autoSend} 
                  onChange={handleToggleAutoSend} 
                />
                <ToggleSlider />
              </ToggleSwitch>
            </SettingsRow>
          </div>

          <div>
            <SectionTitle>Data Management</SectionTitle>
            <BackupRestore />
          </div>

        </ModalContent>
      </ModalContainer>
    </Overlay>
  );
};

export default SettingsModal;