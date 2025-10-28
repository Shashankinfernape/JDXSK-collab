import { createGlobalStyle } from 'styled-components';

// --- Theme Definitions ---

export const netflixTheme = {
  name: 'netflix',
  colors: {
    primary: '#E50914', // Netflix Red
    background: '#141414', // Main Background
    panelBackground: '#1F1F1F', // Sidebar/Modals
    headerBackground: '#1F1F1F',
    inputBackground: '#2A2A2A', // Search/Message Input
    hoverBackground: '#2A2A2A',
    bubbleMe: '#E50914', // My message bubble
    bubbleOther: '#2A2A2A', // Other's message bubble
    textPrimary: '#FFFFFF', // Main text
    textSecondary: '#B3B3B3', // Timestamps, secondary info
    textBubbleMe: '#FFFFFF',
    textBubbleOther: '#E5E5E5',
    icon: '#B3B3B3',
    iconHover: '#FFFFFF',
    scrollbarTrack: '#1F1F1F',
    scrollbarThumb: '#808080',
    scrollbarThumbHover: '#E50914',
    // Read receipts
    tick_sent: '#B3B3B3',
    tick_delivered: '#B3B3B3',
    tick_read: '#55C5E9', // Light Blue
  },
  font: "'Roboto', sans-serif",
  logo: 'path/to/netflix-logo.svg', // Placeholder
  bubbleBorderRadius: '12px',
};

export const spotifyTheme = {
  name: 'spotify',
  colors: {
    primary: '#1DB954', // Spotify Green
    background: '#121212',
    panelBackground: '#181818',
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
    iconHover: '#FFFFFF',
    scrollbarTrack: '#181818',
    scrollbarThumb: '#808080',
    scrollbarThumbHover: '#1DB954',
    // Read receipts
    tick_sent: '#B3B3B3',
    tick_delivered: '#B3B3B3',
    tick_read: '#1DB954', // Green
  },
  font: "'Roboto', sans-serif",
  logo: 'path/to/spotify-logo.svg', // Placeholder
  bubbleBorderRadius: '12px',
};

// --- NEW THEMES ---
export const appleTheme = {
  name: 'apple',
  colors: {
    primary: '#007AFF', // Apple Blue
    background: '#FFFFFF', // Light Background
    panelBackground: '#F2F2F7', // Light Grey Panels
    headerBackground: '#F9F9F9',
    inputBackground: '#E9E9EB', // Light input fields
    hoverBackground: '#E9E9EB',
    bubbleMe: '#007AFF', // Blue bubble
    bubbleOther: '#E9E9EB', // Grey bubble
    textPrimary: '#000000', // Black text
    textSecondary: '#8A8A8E', // Grey secondary text
    textBubbleMe: '#FFFFFF',
    textBubbleOther: '#000000',
    icon: '#8A8A8E',
    iconHover: '#000000',
    scrollbarTrack: '#F2F2F7',
    scrollbarThumb: '#C7C7CC',
    scrollbarThumbHover: '#007AFF',
    // Read receipts
    tick_sent: '#8A8A8E',
    tick_delivered: '#8A8A8E',
    tick_read: '#007AFF', // Blue
  },
  font: "'SF Pro Display', 'Roboto', sans-serif", // Prioritize Apple font
  logo: 'path/to/apple-logo.svg', // Placeholder
  bubbleBorderRadius: '18px', // More rounded bubbles
};

export const googleTheme = {
  name: 'google',
  colors: {
    primary: '#4285F4', // Google Blue
    background: '#FFFFFF',
    panelBackground: '#F1F3F4', // Material Grey
    headerBackground: '#FFFFFF', // White header
    inputBackground: '#F1F3F4',
    hoverBackground: '#E8EAED',
    bubbleMe: '#D1E3FF', // Light blue bubble
    bubbleOther: '#F1F3F4', // Grey bubble
    textPrimary: '#202124', // Dark Grey text
    textSecondary: '#5F6368', // Medium Grey text
    textBubbleMe: '#174EA6', // Darker blue text
    textBubbleOther: '#202124',
    icon: '#5F6368',
    iconHover: '#202124',
    scrollbarTrack: '#F1F3F4',
    scrollbarThumb: '#BDC1C6',
    scrollbarThumbHover: '#4285F4',
    // Read receipts
    tick_sent: '#5F6368',
    tick_delivered: '#5F6368',
    tick_read: '#4285F4', // Blue
  },
  font: "'Google Sans', 'Roboto', sans-serif", // Prioritize Google font
  logo: 'path/to/google-logo.svg', // Placeholder
  bubbleBorderRadius: '16px', // Material style rounding
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

  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.scrollbarTrack};
  }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.scrollbarThumb};
    border-radius: 4px;
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