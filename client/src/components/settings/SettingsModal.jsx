import React from 'react';
import styled, { css } from 'styled-components';
import { IoMdClose } from 'react-icons/io';
import { BsMoonStars, BsSun } from 'react-icons/bs';
import BackupRestore from './BackupRestore';
import { useTheme } from '../../context/ThemeContext';

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

// Theme Picker Styles
const SectionTitle = styled.h4`
  font-size: 0.9rem;
  text-transform: uppercase;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const ThemeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  &:last-child { border-bottom: none; }
`;

const BrandLabel = styled.span`
  font-size: 1rem;
  font-weight: 500;
  text-transform: capitalize;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  background-color: ${props => props.theme.colors.inputBackground};
  padding: 4px;
  border-radius: 20px;
`;

const ThemeBtn = styled.button`
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? '#FFF' : props.theme.colors.textSecondary};
  border: none;
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: ${props => props.$active ? '#FFF' : props.theme.colors.textPrimary};
  }
`;

// End Modal components

const SettingsModal = ({ isOpen, onClose }) => {
  const { setTheme, themeName } = useTheme();
  // This stops the modal from closing when clicking inside it
  const handleModalClick = (e) => e.stopPropagation();

  const brands = ['netflix', 'spotify', 'apple', 'google', 'instagram'];

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
          <SectionTitle>Appearance</SectionTitle>
          <div style={{ marginBottom: '2rem' }}>
            {brands.map(brand => (
                <ThemeRow key={brand}>
                    <BrandLabel>{brand}</BrandLabel>
                    <ButtonGroup>
                        <ThemeBtn 
                            onClick={() => setTheme(`${brand}-light`)} 
                            $active={themeName === `${brand}-light`}
                            title={`${brand} Light`}
                        >
                            <BsSun />
                        </ThemeBtn>
                        <ThemeBtn 
                            onClick={() => setTheme(`${brand}-dark`)} 
                            $active={themeName === `${brand}-dark`}
                            title={`${brand} Dark`}
                        >
                            <BsMoonStars />
                        </ThemeBtn>
                    </ButtonGroup>
                </ThemeRow>
            ))}
          </div>

          <SectionTitle>Data</SectionTitle>
          <BackupRestore />
        </ModalContent>
      </ModalContainer>
    </Overlay>
  );
};

export default SettingsModal;