import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const Skeleton = styled.div`
  background-color: ${props => props.theme.colors.hoverBackground || '#333'};
  background-image: linear-gradient(
    90deg, 
    ${props => props.theme.colors.hoverBackground || '#333'}, 
    ${props => props.theme.colors.inputBackground || '#444'}, 
    ${props => props.theme.colors.hoverBackground || '#333'}
  );
  background-size: 200px 100%;
  background-repeat: no-repeat;
  display: inline-block;
  line-height: 1;
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '1em'};
  border-radius: ${props => props.circle ? '50%' : '4px'};
  animation: ${shimmer} 1.5s infinite linear;
  margin: ${props => props.margin || '0'};
  opacity: 0.7;
`;

export default Skeleton;