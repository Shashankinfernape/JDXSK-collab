import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/layout/ChatWindow';
import { useChat } from '../context/ChatContext';

const HomeContainer = styled.div`
  position: fixed; /* Pin to viewport */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden; // Prevent body scrolling
  /* No explicit height needed, constrained by top/bottom */
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
          // If we have an active chat, show it. Otherwise show sidebar.
          setShowChatWindow(!!activeChat);
      }
    };
    window.addEventListener('resize', handleResize);
    // Don't call handleResize() on every render, just setup
    
    // Initial check (only once)
    // handleResize(); 
    
    return () => window.removeEventListener('resize', handleResize);
  }, [activeChat]); 

  // Automatically show chat on mobile if one becomes active
  useEffect(() => {
    if (isMobileView && activeChat) {
      setShowChatWindow(true);
    }
  }, [activeChat, isMobileView]);

  // Handler passed to Sidebar -> ChatList -> ChatListItem
  const handleChatSelect = (chat) => {
    selectChat(chat); // Update context
    if (isMobileView) {
        setShowChatWindow(true); // Show chat window on mobile
    }
  };

  // Handler passed to ChatWindow for the back button
  const handleBackToSidebar = () => {
    if (isMobileView) {
      setShowChatWindow(false);
    }
    // Crucial: Clear the active chat so state stays consistent
    selectChat(null);
  };
  // --- END FIX ---


  // Determine if placeholder should be shown
  // const showPlaceholder = !activeChat && (!isMobileView); // Removed unused variable

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

