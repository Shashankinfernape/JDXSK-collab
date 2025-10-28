import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/layout/ChatWindow';
import { useChat } from '../context/ChatContext';

const HomeContainer = styled.div`
  display: flex;
  /* Use 100vh for the main container to ensure it fills viewport initially */
  height: 100vh;
  /* Use 100% for inner height stability if needed, but 100vh is standard */
  /* height: 100%; */
  width: 100vw;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden; // Prevent body scrolling
`;

const StyledSidebar = styled.div`
  /* Default Desktop/Tablet view */
  width: ${({ theme }) => theme.panel_width};
  max-width: ${({ theme }) => theme.max_panel_width};
  min-width: 300px;
  height: 100%; // Take full height from HomeContainer
  display: flex; // Needed for SidebarContainer's flex layout

  /* Mobile/Smaller Tablet View */
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
  height: 100%; // Take full height from HomeContainer
  display: flex; // Needed for ChatWindowContainer's flex layout

  @media (max-width: 900px) {
    display: ${({ $showChatWindow }) => ($showChatWindow ? 'flex' : 'none')};
    width: 100%;
    max-width: 100%;
    min-width: 100%;
  }
`;

// Welcome Placeholder Styling (Ensure it uses consistent background)
const WelcomePlaceholder = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  /* Use chatBackground for consistency */
  background-color: ${({ theme }) => theme.colors.chatBackground};
  /* Add border only if sidebar is visible */
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1rem;

  h2 { /* styles */ }
  p { /* styles */ }

  @media (max-width: 900px) {
      border-left: none;
      /* Show only if chat window is hidden */
      display: ${({ $showChatWindow }) => ($showChatWindow ? 'none' : 'flex')};
  }
`;

// Home Component Logic
const Home = () => {
  const { activeChat, selectChat } = useChat();
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 900);

  // Effect to handle window resize and determine view type
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobileView(mobile);
      // Logic to decide if chat window should be visible based on resize
      if (!mobile) { // Resized to desktop
          setShowChatWindow(true); // Always show area on desktop
      } else { // Resized to mobile
          setShowChatWindow(!!activeChat); // Show chat only if one is active
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, [activeChat]); // Re-run when activeChat changes

  // Automatically show chat on mobile if one becomes active AFTER initial load
  useEffect(() => {
    if (isMobileView && activeChat && !showChatWindow) {
      setShowChatWindow(true);
    }
    // Automatically hide chat on mobile if activeChat becomes null
    if (isMobileView && !activeChat && showChatWindow) {
        setShowChatWindow(false);
    }
  }, [activeChat, isMobileView, showChatWindow]);

  // Handler passed to Sidebar -> ChatList -> ChatListItem
  const handleChatSelect = (chat) => {
    selectChat(chat); // Update context
    if (isMobileView) {
        setShowChatWindow(true); // Show chat window on mobile
    }
  };

  // --- FIX: Ensure this is passed correctly and works ---
  // Handler passed to ChatWindow for the back button
  const handleBackToSidebar = () => {
    // Only change visibility state on mobile, don't deselect chat necessarily
    if (isMobileView) {
      setShowChatWindow(false);
    }
    // Optional: deselect chat if needed
    // selectChat(null);
  };
  // --- END FIX ---


  // Determine if placeholder should be shown
  const showPlaceholder = !activeChat && (!isMobileView); // Only show placeholder on desktop

  return (
    <HomeContainer>
      {/* Sidebar - Conditionally displayed based on mobile view and state */}
      <StyledSidebar $showChatWindow={showChatWindow}>
        <Sidebar onChatSelect={handleChatSelect} />
      </StyledSidebar>

      {/* Chat Window Area - Render container if needed */}
      {(!isMobileView || showChatWindow) && ( // Render container on desktop OR mobile if showing chat
        <StyledChatWindow $showChatWindow={showChatWindow}>
          {activeChat ? (
            // Pass the back handler TO ChatWindow component
            <ChatWindow onBack={handleBackToSidebar} />
          ) : (
            // Show placeholder only on Desktop when no chat selected
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

