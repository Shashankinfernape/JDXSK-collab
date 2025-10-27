import React from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StyledLabel = styled.label`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  text-transform: uppercase;
`;

const StyledInput = styled.input`
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.theme.colors.grey};
  width: 100%;
  padding: 0.5rem 0.25rem;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-bottom-color: ${props => props.theme.colors.primary};
  }
`;

const Input = ({ label, ...props }) => {
  return (
    <InputWrapper>
      {label && <StyledLabel>{label}</StyledLabel>}
      <StyledInput {...props} />
    </InputWrapper>
  );
};

export default Input;