import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

// Container
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: #000000;
  color: #fff;
  position: relative;
  overflow: hidden;
  
  /* Vignette Effect */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%);
    pointer-events: none;
  }
`;

const Content = styled.div`
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 1s cubic-bezier(0.2, 0.8, 0.2, 1);
`;

const Title = styled.h1`
  font-family: 'Archivo', 'Arial Black', sans-serif;
  font-size: 5rem;
  font-weight: 700;
  letter-spacing: -2px;
  color: #E50914; /* Netflix Red */
  margin: 0;
  text-transform: uppercase;
  text-shadow: 0 0 30px rgba(229, 9, 20, 0.4);
  
  @media (max-width: 600px) {
    font-size: 3rem;
  }
`;

const Tagline = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.5rem;
  margin-bottom: 3rem;
  letter-spacing: 1px;
  text-align: center;
`;

const GoogleButton = styled.button`
  padding: 1rem 2.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  background-color: #fff;
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, background-color 0.2s;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);

  &:hover {
    transform: scale(1.02);
    background-color: #f0f0f0;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const BackgroundGlow = styled.div`
  position: absolute;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(229, 9, 20, 0.15) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  pointer-events: none;
`;

const Landing = () => {
  const { handleGoogleLogin } = useAuth();
  
  return (
    <Container>
      <BackgroundGlow />
      <Content>
        <Title>CHATFLIX</Title>
        <Tagline>One chat. Every style.</Tagline>
        <GoogleButton onClick={handleGoogleLogin}>
          <FcGoogle size={24} />
          Sign In
        </GoogleButton>
      </Content>
    </Container>
  );
};

export default Landing;
