import { createGlobalStyle } from 'styled-components';

// Helper for subtle borders
const subtleBorder = (theme) => `1px solid ${theme.colors.border || theme.colors.hoverBackground}`;

// --- Theme Definitions ---

export const netflixTheme = {
  name: 'netflix',
  colors: {
    primary: '#E50914', // Netflix Red
    background: '#0b0b0b', // Slightly darker main background
    panelBackground: '#141414', // Sidebar/Modals (keep slightly lighter)
    headerBackground: '#1F1F1F', // Headers
    inputBackground: '#2A2A2A', // Search/Message Input
    hoverBackground: '#2A2A2A',
    bubbleMe: '#E50914', // My message bubble
    bubbleOther: '#2A2A2A', // Other's message bubble
    textPrimary: '#E5E5E5', // Lighter main text
    textSecondary: '#808080', // Dimmer secondary text
    textBubbleMe: '#FFFFFF',
    textBubbleOther: '#E5E5E5',
    icon: '#B3B3B3', // Keep icons visible
    iconActive: '#FFFFFF', // For active icons/hovers
    border: '#2A2A2A', // Subtle border color
    scrollbarTrack: '#1F1F1F',
    scrollbarThumb: '#808080',
    scrollbarThumbHover: '#E50914',
    // Read receipts
    tick_sent: '#808080',
    tick_delivered: '#808080',
    tick_read: '#55C5E9', // Light Blue
  },
  font: "'Roboto', sans-serif",
  logo: '/netflix-logo.svg', // Assumes logo is in public folder
  bubbleBorderRadius: '7px', // Less rounded like WhatsApp
};

export const spotifyTheme = {
  name: 'spotify',
  colors: {
    primary: '#1DB954', // Spotify Green
    background: '#000000', // Black main background
    panelBackground: '#121212', // Sidebar/Modals (subtle grey)
    headerBackground: '#181818',
    inputBackground: '#282828',
    hoverBackground: '#282828',
    bubbleMe: '#1DB954',
    bubbleOther: '#282828',
    textPrimary: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textBubbleMe: '#000000', // Black text on green bubble
    textBubbleOther: '#E5E5E5',
    icon: '#B3B3B3',
    iconActive: '#FFFFFF',
    border: '#282828',
    scrollbarTrack: '#181818',
    scrollbarThumb: '#808080',
    scrollbarThumbHover: '#1DB954',
    // Read receipts
    tick_sent: '#B3B3B3',
    tick_delivered: '#B3B3B3',
    tick_read: '#1DB954', // Green
  },
  font: "'Roboto', sans-serif",
  logo: '/spotify-logo.svg', // Assumes logo is in public folder
  bubbleBorderRadius: '7px',
};

export const appleTheme = {
  name: 'apple',
  colors: {
    primary: '#007AFF', // Apple Blue
    background: '#FFFFFF', // Light Background
    panelBackground: '#F2F2F7', // Light Grey Panels
    headerBackground: '#F9F9F9', // Header slightly lighter
    inputBackground: '#E9E9EB', // Input fields darker grey
    hoverBackground: '#E9E9EB',
    bubbleMe: '#007AFF', // Standard Blue bubble for light mode
    bubbleOther: '#E9E9EB', // Grey bubble
    textPrimary: '#000000', // Black text
    textSecondary: '#6D6D72', // Slightly darker secondary text
    textBubbleMe: '#FFFFFF',
    textBubbleOther: '#000000',
    icon: '#8A8A8E',
    iconActive: '#000000',
    border: '#D1D1D6', // Lighter border color
    scrollbarTrack: '#F2F2F7',
    scrollbarThumb: '#C7C7CC',
    scrollbarThumbHover: '#007AFF',
    // Read receipts
    tick_sent: '#8A8A8E',
    tick_delivered: '#8A8A8E',
    tick_read: '#007AFF', // Blue
  },
  font: "'SF Pro Display', 'Roboto', sans-serif", // Prioritize Apple font
  logo: '/apple-logo.svg', // Assumes logo is in public folder
  bubbleBorderRadius: '18px', // Keep rounded for Apple
};

// Simplified Google Theme (using primary blue, not quad color)
export const googleTheme = {
  name: 'google',
  colors: {
    primary: '#4285F4', // Google Blue
    background: '#FFFFFF',
    panelBackground: '#FFFFFF', // White sidebar like Gmail/Chat
    headerBackground: '#FFFFFF',
    inputBackground: '#F1F3F4', // Material Input Grey
    hoverBackground: '#E8EAED',
    bubbleMe: '#D1E3FF', // Light blue bubble
    bubbleOther: '#F1F3F4', // Grey bubble
    textPrimary: '#202124', // Dark Grey text
    textSecondary: '#5F6368', // Medium Grey text
    textBubbleMe: '#174EA6', // Darker blue text on bubble
    textBubbleOther: '#202124',
    icon: '#5F6368',
    iconActive: '#1967D2', // Google Blue for active icons
    border: '#DADCE0', // Material border color
    scrollbarTrack: '#F1F3F4',
    scrollbarThumb: '#BDC1C6',
    scrollbarThumbHover: '#4285F4',
    // Read receipts
    tick_sent: '#5F6368',
    tick_delivered: '#5F6368',
    tick_read: '#4285F4', // Blue
  },
  font: "'Google Sans', 'Roboto', sans-serif", // Prioritize Google font
  logo: '/google-logo.svg', // Assumes logo is in public folder
  bubbleBorderRadius: '16px',
};

// --- GlobalStyles ---
// Uses the theme provided by the ThemeProvider
export const GlobalStyles = createGlobalStyle`
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
    overflow: hidden; 
  }

  // Thinner scrollbar, invisible track
  ::-webkit-scrollbar { 
    width: 6px; 
    height: 6px; 
  } 
  ::-webkit-scrollbar-track { 
    background: transparent; 
  } 
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.scrollbarThumb};
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.scrollbarThumbHover};
  }
`;

// Helper object to easily access themes by name
export const themes = {
  netflix: netflixTheme,
  spotify: spotifyTheme,
  apple: appleTheme,
  google: googleTheme,
};
