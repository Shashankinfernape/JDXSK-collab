import { createGlobalStyle, css, keyframes } from 'styled-components';

// --- REMOVED subtleBorder helper function ---

// --- Theme Definitions ---
// (All theme objects like netflixTheme, spotifyTheme, etc., remain exactly the same as the previous version)

export const netflixTheme = {
  name: 'netflix',
  mode: 'dark', // Add mode
  colors: {
    primary: '#E50914',
    background: '#0b0b0b',
    panelBackground: '#141414',
    headerBackground: '#1F1F1F',
    inputBackground: '#2A2A2A',
    hoverBackground: '#2A2A2A',
    bubbleMe: '#E50914',
    bubbleOther: '#2A2A2A',
    textPrimary: '#E5E5E5',
    textSecondary: '#808080',
    textBubbleMe: '#FFFFFF',
    textBubbleOther: '#E5E5E5',
    icon: '#B3B3B3',
    iconActive: '#FFFFFF',
    border: '#2A2A2A',
    scrollbarTrack: '#1F1F1F',
    scrollbarThumb: '#808080',
    scrollbarThumbHover: '#E50914',
    tick_sent: '#808080',
    tick_delivered: '#808080',
    tick_read: '#55C5E9', // Light Blue
    welcomeText: '#808080', // Color for "Welcome" text
  },
  font: "'Roboto', sans-serif",
  logo: '/netflix-logo.svg',
  bubbleBorderRadius: '7px',
};

export const spotifyTheme = {
  name: 'spotify',
  mode: 'dark',
  colors: {
    primary: '#1DB954',
    background: '#000000',
    panelBackground: '#121212',
    headerBackground: '#181818',
    inputBackground: '#282828',
    hoverBackground: '#282828',
    bubbleMe: '#1DB954',
    bubbleOther: '#282828',
    textPrimary: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textBubbleMe: '#000000',
    textBubbleOther: '#E5E5E5',
    icon: '#B3B3B3',
    iconActive: '#FFFFFF',
    border: '#282828',
    scrollbarTrack: '#181818',
    scrollbarThumb: '#808080',
    scrollbarThumbHover: '#1DB954',
    tick_sent: '#B3B3B3',
    tick_delivered: '#B3B3B3',
    tick_read: '#1DB954',
    welcomeText: '#B3B3B3',
  },
  font: "'Roboto', sans-serif",
  logo: '/spotify-logo.svg',
  bubbleBorderRadius: '7px',
};

export const appleTheme = {
  name: 'apple',
  mode: 'light', // Apple is primarily light
  colors: {
    primary: '#007AFF', // Apple Blue
    background: '#FFFFFF',
    panelBackground: '#F2F2F7', // Sidebar Grey
    headerBackground: '#F9F9F9', // Header slightly lighter, almost white
    inputBackground: '#E9E9EB', // Input fields darker grey
    hoverBackground: '#E9E9EB', // Consistent hover
    bubbleMe: '#007AFF', // Standard Blue bubble
    bubbleOther: '#E9E9EB', // Grey bubble
    textPrimary: '#000000', // Black text
    textSecondary: '#6D6D72', // Slightly darker secondary text
    textBubbleMe: '#FFFFFF',
    textBubbleOther: '#000000',
    icon: '#8A8A8E', // Standard icon grey
    iconActive: '#000000', // Black for active/hover
    border: '#D1D1D6', // Subtle light border
    scrollbarTrack: 'transparent', // Make scrollbar less intrusive
    scrollbarThumb: '#C7C7CC',
    scrollbarThumbHover: '#007AFF',
    tick_sent: '#8A8A8E',
    tick_delivered: '#8A8A8E',
    tick_read: '#007AFF',
    welcomeText: '#6D6D72',
  },
  font: "'SF Pro Display', 'Roboto', sans-serif", // Prioritize Apple font
  logo: '/apple-logo.svg',
  bubbleBorderRadius: '18px', // Keep rounded for Apple iMessage style
};

export const googleTheme = {
  name: 'google',
  mode: 'light', // Google Chat/Messages are primarily light
  colors: {
    primary: '#1A73E8', // Updated Google Blue
    background: '#FFFFFF', // White background
    panelBackground: '#FFFFFF', // White sidebar like Gmail/Chat
    headerBackground: '#FFFFFF', // White header
    inputBackground: '#F1F3F4', // Material Input Grey
    hoverBackground: '#E8EAED', // Material Hover Grey
    bubbleMe: '#D1E3FF', // Light blue bubble (Material style)
    bubbleOther: '#F1F3F4', // Grey bubble
    textPrimary: '#202124', // Dark Grey text (Material standard)
    textSecondary: '#5F6368', // Medium Grey text
    textBubbleMe: '#174EA6', // Darker blue text on bubble
    textBubbleOther: '#202124',
    icon: '#5F6368', // Standard Material icon color
    iconActive: '#1967D2', // Google Blue for active icons
    border: '#DADCE0', // Material border color
    scrollbarTrack: 'transparent',
    scrollbarThumb: '#BDC1C6',
    scrollbarThumbHover: '#4285F4',
    accentRed: '#EA4335',
    accentYellow: '#FBBC05',
    accentGreen: '#34A853',
    tick_sent: '#5F6368',
    tick_delivered: '#5F6368',
    tick_read: '#1A73E8', // Use primary blue for read ticks
    welcomeText: '#5F6368',
  },
  font: "'Google Sans', 'Roboto', sans-serif", // Prioritize Google font
  logo: '/google-logo.svg',
  bubbleBorderRadius: '16px', // Material style rounding
};

const instagramGradient = 'linear-gradient(135deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D, #F77737, #FCAF45)';
const instagramBgAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const instagramTheme = {
  name: 'instagram',
  mode: 'dark',
  colors: {
    primary: '#E1306C',
    background: '#000000',
    panelBackground: '#121212',
    headerBackground: '#181818',
    inputBackground: '#282828',
    hoverBackground: 'rgba(255, 255, 255, 0.1)',
    bubbleMe: '#383838',
    bubbleMeGradient: instagramGradient,
    bubbleOther: '#282828',
    textPrimary: '#FFFFFF',
    textSecondary: '#A8A8A8',
    textBubbleMe: '#FFFFFF',
    textBubbleOther: '#FFFFFF',
    icon: '#FFFFFF',
    iconActive: '#FCAF45',
    border: '#383838',
    scrollbarTrack: '#181818',
    scrollbarThumb: '#555555',
    scrollbarThumbHover: '#E1306C',
    tick_sent: '#A8A8A8',
    tick_delivered: '#A8A8A8',
    tick_read: '#FCAF45',
    welcomeText: '#A8A8A8',
  },
  font: "'Poppins', 'Roboto', sans-serif",
  logo: '/instagram-logo.svg',
  bubbleBorderRadius: '14px',
  gradient: instagramGradient,
  backgroundAnimation: css`
    background: ${instagramGradient};
    background-size: 300% 300%;
    animation: ${instagramBgAnimation} 15s ease infinite;
  `,
};

// --- GlobalStyles ---
export const GlobalStyles = createGlobalStyle`
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.font};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
    ${({ theme }) => theme.name === 'instagram' && theme.backgroundAnimation}
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.scrollbarThumb};
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.scrollbarThumbHover};
  }
`;

export const themes = {
  netflix: netflixTheme,
  spotify: spotifyTheme,
  apple: appleTheme,
  google: googleTheme,
  instagram: instagramTheme,
};

