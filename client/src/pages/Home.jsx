import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/layout/ChatWindow';
import { useChat } from '../context/ChatContext';

const HomeContainer = styled.div`
  display: flex;
  /* --- FIX: Use 100% instead of 100vh --- */
  height: 100%; /* Take full height of its parent (usually body/#root) */
  /* --- END FIX --- */
  width: 100vw;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden; // Prevent overall page scroll is important
`;

const StyledSidebar = styled.div`
  /* Sidebar is always visible by default (desktop & tablet > 900px) */
  width: ${({ theme }) => theme.panel_width};
  max-width: ${({ theme }) => theme.max_panel_width};
  min-width: 300px;
  height: 100%; // Take full height of HomeContainer
  display: flex; // Use flex for internal layout

  /* On smaller screens (e.g., phones and smaller tablets < 900px) */
  @media (max-width: 900px) { // Adjusted breakpoint
    display: ${({ $showChatWindow }) => ($showChatWindow ? 'none' : 'flex')};
    width: 100%;
    max-width: 100%;
    min-width: 100%;
    border-right: none;
  }
`;

const StyledChatWindow = styled.div`
  flex: 1;
  height: 100%; // Take full height of HomeContainer
  display: flex;

  /* On smaller screens (< 900px) */
  @media (max-width: 900px) {
    display: ${({ $showChatWindow }) => ($showChatWindow ? 'flex' : 'none')};
    width: 100%;
    max-width: 100%;
    min-width: 100%;
  }
`;

const WelcomePlaceholder = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.chatBackground}; // Match chat background

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
      /* Only show placeholder if sidebar is visible (chat window hidden) */
      display: ${({ $showChatWindow }) => ($showChatWindow ? 'none' : 'flex')};
  }
`;

const Home = () => {
  const { activeChat, selectChat } = useChat();
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 900); // Use 900px breakpoint

  // Effect to handle window resize and determine view type
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobileView(mobile);
      // If resizing to desktop view, ensure chat window (or placeholder) is shown
      if (!mobile) {
          setShowChatWindow(true);
      } else {
          // If resizing to mobile view, show chat only if one is active
          setShowChatWindow(!!activeChat);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    // Automatically show chat on mobile if one becomes active
    if (isMobileView && activeChat && !showChatWindow) {
        setShowChatWindow(true);
    }

    return () => window.removeEventListener('resize', handleResize);

  }, [activeChat, isMobileView, showChatWindow]); // Added showChatWindow dependency


  const handleChatSelect = (chat) => {
    selectChat(chat);
    if (isMobileView) { // Use state for mobile check
        setShowChatWindow(true);
    }
  };

  const handleBackToSidebar = () => {
    // selectChat(null); // Deselecting might be optional, depending on desired UX
    setShowChatWindow(false); // Hide chat window (on mobile)
  };

  // Determine if placeholder should be shown
  // Show placeholder on desktop if no chat selected, or on mobile if no chat selected AND chat window isn't forced visible
  const showPlaceholder = !activeChat && (!isMobileView || !showChatWindow);

  return (
    <HomeContainer>
      <StyledSidebar $showChatWindow={showChatWindow}>
        <Sidebar onChatSelect={handleChatSelect} />
      </StyledSidebar>

      {/* Conditionally render ChatWindow or Placeholder */}
      {(activeChat || !isMobileView) && ( // Render container if chat active OR on desktop
            <StyledChatWindow $showChatWindow={showChatWindow}>
            {activeChat ? (
                <ChatWindow onBack={handleBackToSidebar} />
            ) : (
                 <WelcomePlaceholder $showChatWindow={showChatWindow}>
                    <h2>Welcome to Chatflix</h2>
                    <p>Select a chat from the sidebar to start messaging.</p>
                </WelcomePlaceholder>
            )}
            </StyledChatWindow>
      )}

    </HomeContainer>
  );
};

export default Home;

