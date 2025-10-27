import React from 'react';
import styled from 'styled-components';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/layout/ChatWindow';
import { useChat } from '../context/ChatContext';

const HomeContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #0b0b0b;
`;

// This placeholder is shown when no chat is selected
const WelcomePlaceholder = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.grey};
  text-align: center;
  border-left: 1px solid ${props => props.theme.colors.black_lighter};

  h2 {
    font-size: 2.2rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1rem;
    max-width: 300px;
    line-height: 1.5;
  }
`;

const Home = () => {
  const { activeChat } = useChat();

  return (
    <HomeContainer>
      <Sidebar />
      {activeChat ? (
        <ChatWindow />
      ) : (
        <WelcomePlaceholder>
          <h2>Welcome to Chatflix</h2>
          <p>Select a chat from the sidebar to start messaging.</p>
        </WelcomePlaceholder>
      )}
    </HomeContainer>
  );
};

export default Home;