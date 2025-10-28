import { createGlobalStyle, css, keyframes } from 'styled-components';

// --- Keyframes for Instagram Background ---
const instagramBgAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// --- Theme Definitions (Reverted Google, added Apple Dark, Instagram) ---

export const netflixTheme = {
  name: 'netflix',
  colors: {
    primary: '#E50914',
    background: '#0b0b0b',
    panelBackground: '#141414',
    headerBackground: '#1F1F1F',
    inputBackground: '#2A2A2A',
    hoverBackground: '#2A2A2A',
    bubbleMe: '#E50914',
    bubbleOther: '#2A2A2A',
    chatBackground: '#0b0b0b', // Match main background
    dateSeparatorBackground: '#2A2A2A',
    dateSeparatorText: '#808080',
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
    tick_read: '#55C5E9',
  },
  font: "'Roboto', sans-serif",
  logo: '/netflix-logo.svg',
  bubbleBorderRadius: '7px',
  backgroundImage: '/whatsapp-bg.png', // Keep background
};

export const spotifyTheme = {
  name: 'spotify',
  colors: {
    primary: '#1DB954',
    background: '#000000',
    panelBackground: '#121212',
    headerBackground: '#181818',
    inputBackground: '#282828',
    hoverBackground: '#282828',
    bubbleMe: '#1DB954',
    bubbleOther: '#282828',
    chatBackground: '#000000',
    dateSeparatorBackground: '#282828',
    dateSeparatorText: '#B3B3B3',
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
  },
  font: "'Roboto', sans-serif",
  logo: '/spotify-logo.svg',
  bubbleBorderRadius: '7px',
  backgroundImage: '/whatsapp-bg.png',
};

// --- Apple Dark Theme ---
export const appleTheme = {
  name: 'apple',
  colors: {
    primary: '#0A84FF', // Slightly brighter blue for dark mode
    background: '#000000', // Black background
    panelBackground: '#1C1C1E', // Dark Grey Panels
    headerBackground: '#1C1C1E', // Consistent dark header
    inputBackground: '#2C2C2E', // Slightly lighter input
    hoverBackground: '#2C2C2E',
    bubbleMe: '#0A84FF', // Blue bubble
    bubbleOther: '#2C2C2E', // Dark grey bubble
    chatBackground: '#000000', // Black chat background
    dateSeparatorBackground: '#2C2C2E',
    dateSeparatorText: '#8E8E93',
    textPrimary: '#FFFFFF', // White text
    textSecondary: '#8E8E93', // Grey secondary text (iOS systemGray)
    textBubbleMe: '#FFFFFF',
    textBubbleOther: '#FFFFFF',
    icon: '#8E8E93',
    iconActive: '#FFFFFF',
    border: '#3A3A3C', // Darker border color
    scrollbarTrack: '#1C1C1E',
    scrollbarThumb: '#545458',
    scrollbarThumbHover: '#0A84FF',
    tick_sent: '#8E8E93',
    tick_delivered: '#8E8E93',
    tick_read: '#0A84FF',
  },
  // Use system font stack prioritizing San Francisco
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  logo: '/apple-logo.svg',
  bubbleBorderRadius: '18px',
  // backgroundImage: '/whatsapp-bg-dark.png', // Optional dark bg
};

// --- Google Material Theme (Reverted to Blue/Light) ---
export const googleTheme = {
  name: 'google',
  colors: {
    primary: '#4285F4', // Google Blue
    background: '#FFFFFF',
    panelBackground: '#FFFFFF',
    headerBackground: '#FFFFFF',
    inputBackground: '#F1F3F4',
    hoverBackground: '#E8EAED',
    bubbleMe: '#D1E3FF',
    bubbleOther: '#F1F3F4',
    chatBackground: '#FFFFFF', // White chat area
    dateSeparatorBackground: '#F1F3F4',
    dateSeparatorText: '#5F6368',
    textPrimary: '#202124',
    textSecondary: '#5F6368',
    textBubbleMe: '#174EA6',
    textBubbleOther: '#202124',
    icon: '#5F6368',
    iconActive: '#1967D2',
    border: '#DADCE0',
    scrollbarTrack: '#F1F3F4',
    scrollbarThumb: '#BDC1C6',
    scrollbarThumbHover: '#4285F4',
    tick_sent: '#5F6368',
    tick_delivered: '#5F6368',
    tick_read: '#4285F4',
  },
  font: "'Google Sans', Roboto, sans-serif", // Keep Google Sans
  logo: '/google-logo.svg',
  bubbleBorderRadius: '16px',
  // No specific background image for Google theme by default
};

// --- Instagram Theme ---
export const instagramTheme = {
  name: 'instagram',
  gradient: 'linear-gradient(135deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D, #F77737, #FCAF45, #FFDC80)',
  colors: {
    primary: '#C13584', // Use a dominant gradient color
    background: '#121212', // Dark background to make gradient pop
    panelBackground: '#1C1C1C', // Dark panels
    headerBackground: '#1C1C1C',
    inputBackground: '#2C2C2E',
    hoverBackground: '#2C2C2E',
    bubbleMe: '#833AB4', // Purpleish bubble
    bubbleOther: '#2C2C2E', // Dark grey bubble
    chatBackground: '#121212',
    dateSeparatorBackground: '#2C2C2E',
    dateSeparatorText: '#8E8E93',
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    textBubbleMe: '#FFFFFF',
    textBubbleOther: '#FFFFFF',
    icon: '#FFFFFF', // White icons
    iconActive: '#FCAF45', // Orange/Yellow hover
    border: '#3A3A3C',
    scrollbarTrack: '#1C1C1C',
    scrollbarThumb: '#545458',
    scrollbarThumbHover: '#C13584',
    tick_sent: '#8E8E93',
    tick_delivered: '#8E8E93',
    tick_read: '#FCAF45', // Use a gradient accent
  },
  font: "'Poppins', 'Roboto', sans-serif", // Rounded font
  logo: '/instagram-logo.svg',
  bubbleBorderRadius: '14px',
  // Background handled by animation in GlobalStyles
};


// --- GlobalStyles ---
export const GlobalStyles = createGlobalStyle`
  /* --- FIX: Set base height for full screen --- */
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden; /* Prevent scrolling on body */
  }
  /* --- END FIX --- */

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.font};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* Apply instagram animation conditionally */
    ${({ theme }) => theme.name === 'instagram' && css`
      background: ${theme.gradient};
      background-size: 400% 400%;
      animation: ${instagramBgAnimation} 15s ease infinite;
    `}
  }

  // ... (Scrollbar styles using theme variables) ...
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

