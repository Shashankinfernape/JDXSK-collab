import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/layout/ChatWindow';
import { useChat } from '../context/ChatContext';

const HomeContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: ${props => props.theme.colors.background}; // Use theme bg
  overflow: hidden; // Prevent scrolling on main container
`;

// --- Mobile Responsiveness ---
const SidebarWrapper = styled.div`
  display: flex; // Default display
  flex-direction: column;
  width: ${props => props.theme.panel_width};
  max-width: ${props => props.theme.max_panel_width};
  min-width: 300px;
  height: 100%;
  flex-shrink: 0; // Prevent sidebar from shrinking

  @media (max-width: 768px) { // Tablet and below
    width: 100%; // Take full width
    max-width: none;
    min-width: 0;
    display: ${props => props.show ? 'flex' : 'none'}; // Hide if chat window is shown
    border-right: none; // No border needed on mobile when full width
  }
`;

const ChatWindowWrapper = styled.div`
  flex-grow: 1; // Take remaining space
  display: flex; // Default display
  flex-direction: column;
  height: 100%;

  @media (max-width: 768px) { // Tablet and below
    width: 100%; // Take full width
    display: ${props => props.show ? 'flex' : 'none'}; // Hide if sidebar is shown
  }
`;

const WelcomePlaceholder = styled.div`
  // ... (styling from previous version using theme vars)
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;
  color: ${props => props.theme.colors.welcomeText}; text-align: center; padding: 2rem;
  h2 { font-size: 2rem; font-weight: 500; margin-bottom: 1rem; color: ${props => props.theme.colors.textPrimary}; }
  p { font-size: 0.9rem; max-width: 300px; line-height: 1.5; }

  // Hide placeholder on mobile when sidebar is shown
  @media (max-width: 768px) {
    display: ${props => props.showChat ? 'flex' : 'none'};
  }
`;
// --- End Mobile ---

const Home = () => {
  const { activeChat, selectChat } = useChat();
  const [showChatWindow, setShowChatWindow] = useState(false); // Mobile state

  // Effect to decide initial mobile view based on activeChat
  // (Might need refinement based on exact desired initial state)
  useEffect(() => {
     // If a chat is selected on load (e.g., from previous session), show chat window on mobile
     if (activeChat && window.innerWidth <= 768) {
         setShowChatWindow(true);
     }
  }, [activeChat]);


  // Handler to show chat window (called by Sidebar)
  const handleSelectChat = (chat) => {
    selectChat(chat); // Call original selectChat from context
    if (window.innerWidth <= 768) { // Only change view on mobile
      setShowChatWindow(true);
    }
  };

  // Handler to show sidebar (called by ChatWindow back button)
  const handleShowSidebar = () => {
    setShowChatWindow(false);
    // Optionally deselect chat when going back
    // selectChat(null);
  };

  return (
    <HomeContainer>
      {/* Pass mobile state and handler to Sidebar */}
      <SidebarWrapper show={!showChatWindow}>
        <Sidebar onChatSelect={handleSelectChat} />
      </SidebarWrapper>

      {/* Show Welcome or Chat Window */}
      {activeChat ? (
        <ChatWindowWrapper show={showChatWindow}>
          <ChatWindow onBack={handleShowSidebar} />
        </ChatWindowWrapper>
      ) : (
        <WelcomePlaceholder showChat={showChatWindow}>
            {/* Content moved to ChatWindow component */}
        </WelcomePlaceholder>
      )}
    </HomeContainer>
  );
};

export default Home;
