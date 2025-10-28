import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/layout/ChatWindow';
import { useChat } from '../context/ChatContext';

const HomeContainer = styled.div`
  display: flex;
  /* --- FIX: Use 100% height --- */
  height: 100%;
  /* --- END FIX --- */
  width: 100vw; // Still full width
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const StyledSidebar = styled.div`
  width: ${({ theme }) => theme.panel_width};
  max-width: ${({ theme }) => theme.max_panel_width};
  min-width: 300px;
  /* --- FIX: Use 100% height --- */
  height: 100%;
  /* --- END FIX --- */
  display: flex;

  /* Media query remains the same */
  @media (max-width: 900px) {
    display: ${({ $showChatWindow }) => ($showChatWindow ? 'none' : 'flex')};
    width: 100%;
    max-width: 100%;
    min-width: 100%;
    border-right: none;
  }
`;

const StyledChatWindow = styled.div`
  flex: 1;
  /* --- FIX: Use 100% height --- */
  height: 100%;
  /* --- END FIX --- */
  display: flex; // Keep flex for internal layout if needed

  /* Media query remains the same */
  @media (max-width: 900px) {
    display: ${({ $showChatWindow }) => ($showChatWindow ? 'flex' : 'none')};
    width: 100%;
    max-width: 100%;
    min-width: 100%;
  }
`;

// WelcomePlaceholder styling remains the same
const WelcomePlaceholder = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  border-left: 1px solid ${({ theme }) => theme.colors.border || theme.colors.hoverBackground}; // Use theme border
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.chatBackground}; // Use chat background

  h2 {
    font-size: 1.8rem;
    font-weight: 500;
    margin-bottom: 0.8rem;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  p {
    font-size: 0.9rem;
    max-width: 300px;
    line-height: 1.5;
  }

  @media (max-width: 900px) {
      border-left: none;
      display: ${({ $showChatWindow }) => ($showChatWindow ? 'none' : 'flex')};
  }
`;

// Home component logic remains the same
const Home = () => {
  const { activeChat, selectChat } = useChat();
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobileView(mobile);
      if (!mobile) {
          setShowChatWindow(true); // Always show potential chat/placeholder area on desktop
      } else {
          setShowChatWindow(!!activeChat); // On mobile, show only if chat active
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [activeChat]); // Removed unnecessary dependencies

  // Effect to automatically show chat on mobile if one becomes active
  useEffect(() => {
    if (isMobileView && activeChat && !showChatWindow) {
      setShowChatWindow(true);
    }
  }, [activeChat, isMobileView, showChatWindow]);


  const handleChatSelect = (chat) => {
    selectChat(chat);
    if (isMobileView) {
        setShowChatWindow(true);
    }
  };

  const handleBackToSidebar = () => {
    // selectChat(null); // Keep active chat, just hide window
    setShowChatWindow(false);
  };

  const showPlaceholder = !activeChat && (!isMobileView || !showChatWindow);

  return (
    <HomeContainer>
      <StyledSidebar $showChatWindow={showChatWindow}>
        <Sidebar onChatSelect={handleChatSelect} />
      </StyledSidebar>

     {/* Always render the container on desktop, or on mobile if chat window should show */}
     {(!isMobileView || showChatWindow) && (
        <StyledChatWindow $showChatWindow={showChatWindow}>
          {activeChat ? (
            <ChatWindow onBack={handleBackToSidebar} />
          ) : (
            // Only show placeholder on desktop when no active chat
            !isMobileView && (
              <WelcomePlaceholder $showChatWindow={showChatWindow}>
                <h2>Welcome to Chatflix</h2>
                <p>Select a chat from the sidebar to start messaging.</p>
              </WelcomePlaceholder>
            )
          )}
        </StyledChatWindow>
      )}
    </HomeContainer>
  );
};

export default Home;

