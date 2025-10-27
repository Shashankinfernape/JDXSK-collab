import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  border: 4px solid ${props => props.theme.colors.black_lighter};
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  animation: ${spin} 1s linear infinite;
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  width: 100%;
  height: 100%;
`;

const LoadingSpinner = ({ size }) => (
  <SpinnerContainer>
    <Spinner size={size} />
  </SpinnerContainer>
);

export default LoadingSpinner;