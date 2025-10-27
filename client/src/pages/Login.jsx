import React from 'react';
import styled from 'styled-components';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext'; // Import the hook

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${props => props.theme.colors.black};
`;

const LoginTitle = styled.h1`
  color: ${props => props.theme.colors.primary};
  font-size: 4.5rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 2.5rem;
`;

const GoogleButton = styled.button`
  padding: 0.8rem 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  background-color: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.black_light};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const Login = () => {
  // Get the REAL login handler from our new AuthContext
  const { handleGoogleLogin } = useAuth(); 

  return (
    <LoginContainer>
      <LoginTitle>Chatflix</LoginTitle>
      <GoogleButton onClick={handleGoogleLogin}>
        <FcGoogle size={28} />
        Sign in with Google
      </GoogleButton>
    </LoginContainer>
  );
};

export default Login;
