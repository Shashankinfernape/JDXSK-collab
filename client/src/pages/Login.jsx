import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FcGoogle } from 'react-icons/fc';
import { IoMdSend } from 'react-icons/io';
import { BsEmojiSmile } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Container
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: radial-gradient(circle at 50% 10%, #1a1a1a 0%, #000000 100%);
  color: #fff;
  overflow: hidden;
  position: relative;
`;

// Logo Area
const LogoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.8s ease-out;
  z-index: 2;
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 1.5rem;
  
  /* Gradient Stroke */
  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 26px;
    padding: 3px;
    background: linear-gradient(45deg, #405DE6, #E1306C, #FD1D1D);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  /* Inner Shape (Apple Style) */
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    background: #fff;
    border-radius: 50% 50% 50% 4px;
    transform: rotate(-45deg);
  }
`;

const Title = styled.h1`
  font-family: 'Inter', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -1px;
  margin: 0;
  background: linear-gradient(to right, #fff, #aaa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Tagline = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  color: #888;
  margin-top: 0.5rem;
  font-weight: 400;
`;

// Mock Input
const MockInputWrapper = styled.div`
  width: 90%;
  max-width: 380px;
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  margin-bottom: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  animation: ${float} 6s ease-in-out infinite;
  z-index: 2;
`;

const MockCursor = styled.span`
  width: 2px;
  height: 20px;
  background-color: #E1306C;
  margin-left: 10px;
  animation: blink 1s step-end infinite;

  @keyframes blink { 50% { opacity: 0; } }
`;

const MockText = styled.span`
  color: #aaa;
  font-size: 0.95rem;
  margin-left: 8px;
  flex: 1;
`;

const CircleButton = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.green ? '#1DB954' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.2rem;
`;

// Auth Button
const GoogleButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  background-color: #fff;
  color: #000;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(255,255,255,0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255,255,255,0.2);
  }
`;

const Landing = () => {
  const { handleGoogleLogin } = useAuth();
  
  return (
    <Container>
      <LogoWrapper>
        <LogoIcon />
        <Title>Chatflix</Title>
        <Tagline>One chat. Every style.</Tagline>
      </LogoWrapper>

      <MockInputWrapper>
        <CircleButton>
            <BsEmojiSmile color="#888" />
        </CircleButton>
        <MockText>Say hello...</MockText>
        <MockCursor />
        <CircleButton green>
            <IoMdSend size={18} />
        </CircleButton>
      </MockInputWrapper>

      <GoogleButton onClick={handleGoogleLogin}>
        <FcGoogle size={24} />
        Start Messaging
      </GoogleButton>
      
      {/* Background Ambience */}
      <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: '#405DE6',
          filter: 'blur(150px)',
          opacity: 0.15,
          borderRadius: '50%',
          zIndex: 1
      }} />
       <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '250px',
          height: '250px',
          background: '#E50914',
          filter: 'blur(120px)',
          opacity: 0.1,
          borderRadius: '50%',
          zIndex: 1
      }} />

    </Container>
  );
};

export default Landing;