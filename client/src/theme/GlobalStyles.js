import { createGlobalStyle, css, keyframes } from 'styled-components';

// --- FIX: Removed subtleBorder function ---

// --- Theme Definitions ---
// (All theme objects remain the same as previous full version)

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

export const appleThemeDark = {
  name: 'apple', // Keep name 'apple'
  mode: 'dark', // Specify dark mode
  colors: {
    primary: '#0A84FF', // Slightly brighter blue for dark mode contrast
    background: '#000000', // True black background
    panelBackground: '#1C1C1E', // Dark grey panels (iOS standard)
    headerBackground: '#1C1C1E', // Match panel background
    inputBackground: '#2C2C2E', // Slightly lighter input fields
    hoverBackground: '#2C2C2E', // Consistent hover
    bubbleMe: '#0A84FF', // Blue bubble
    bubbleOther: '#2C2C2E', // Dark grey bubble
    textPrimary: '#FFFFFF', // White text
    textSecondary: '#8E8E93', // iOS secondary grey text
    textBubbleMe: '#FFFFFF',
    textBubbleOther: '#FFFFFF',
    icon: '#8E8E93', // Standard icon grey
    iconActive: '#FFFFFF', // White for active/hover
    border: '#38383A', // Subtle dark border
    scrollbarThumb: '#555555', // Darker scrollbar
    scrollbarThumbHover: '#8E8E93',
    tick_sent: '#8E8E93',
    tick_delivered: '#8E8E93',
    tick_read: '#0A84FF', // Blue
    welcomeText: '#8E8E93',
  },
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
  logo: '/apple-logo-white.svg', // Need white logo version
  bubbleBorderRadius: '18px', // Keep rounded
};

const googleBlue = '#8AB4F8';
const googleRed = '#F28B82';
const googleYellow = '#FDD663';
const googleGreen = '#81C995';

export const googleThemeDark = {
  name: 'google', // Keep name 'google'
  mode: 'dark', // Specify dark mode
  colors: {
    primary: googleBlue,
    background: '#121212',
    panelBackground: '#1E1F21',
    headerBackground: '#1E1F21',
    inputBackground: '#2D2E31',
    hoverBackground: '#2D2E31',
    bubbleMe: googleBlue,
    bubbleOther: '#2D2E31',
    textPrimary: '#E8EAED',
    textSecondary: '#9AA0A6',
    textBubbleMe: '#202124',
    textBubbleOther: '#E8EAED',
    icon: '#9AA0A6',
    iconActive: googleBlue,
    border: '#3C4043',
    scrollbarThumb: '#5F6368',
    scrollbarThumbHover: googleBlue,
    accentRed: googleRed,
    accentYellow: googleYellow,
    accentGreen: googleGreen,
    tick_sent: '#9AA0A6',
    tick_delivered: '#9AA0A6',
    tick_read: googleBlue,
    welcomeText: '#9AA0A6',
  },
  font: "'Google Sans', 'Roboto', sans-serif",
  logo: '/google-logo-white.svg',
  bubbleBorderRadius: '16px',
};


const instagramGradient = 'linear-gradient(135deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D, #F77737, #FCAF45)';
// --- FIX: Ensure animation is defined BEFORE it's used ---
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
  // --- FIX: Use defined animation correctly ---
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
    /* Apply background animation correctly */
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
  apple: appleThemeDark,
  google: googleThemeDark,
  instagram: instagramTheme,
};

