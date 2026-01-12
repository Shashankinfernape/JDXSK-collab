import { createGlobalStyle, css, keyframes } from 'styled-components';

// --- Keyframes for Instagram Background ---
const instagramBgAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// --- Theme Definitions ---

// --- Dark Themes ---
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
    chatBackground: '#0b0b0b',
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
  panel_width: '30%',
  max_panel_width: '400px',
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
  panel_width: '30%',
  max_panel_width: '400px',
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    panelBackground: '#1C1C1E',
    headerBackground: '#1C1C1E',
    inputBackground: '#2C2C2E',
    hoverBackground: '#2C2C2E',
    bubbleMe: '#0A84FF', // Blue bubble, keep for dark mode contrast
    bubbleOther: '#2C2C2E',
    chatBackground: '#000000',
    dateSeparatorBackground: '#2C2C2E',
    dateSeparatorText: '#8E8E93',
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    textBubbleMe: '#FFFFFF',
    textBubbleOther: '#FFFFFF',
    icon: '#8E8E93',
    iconActive: '#FFFFFF',
    border: '#3A3A3C',
    scrollbarTrack: '#1C1C1E',
    scrollbarThumb: '#545458',
    scrollbarThumbHover: '#0A84FF',
    tick_sent: '#8E8E93',
    tick_delivered: '#8E8E93',
    tick_read: '#0A84FF',
  },
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  logo: '/apple-logo.svg',
  bubbleBorderRadius: '18px',
  // backgroundImage: '/whatsapp-bg-dark.png', // Optional dark bg
};

// --- Google Material Theme (Reverted to Blue/Light, kept Quad Colors for potential accents) ---
export const googleTheme = {
  name: 'google',
  panel_width: '30%',
  max_panel_width: '400px',
  colors: {
    primary: '#4285F4', // Google Blue
    background: '#FFFFFF', // White main background
    panelBackground: '#F1F3F4', // Light Grey sidebar/panels (like old Gmail/Chat)
    headerBackground: '#FFFFFF', // White header
    inputBackground: '#F1F3F4', // Material Input Grey
    hoverBackground: '#E8EAED', // Lighter grey on hover
    bubbleMe: '#D1E3FF', // Light blue bubble (Material style)
    bubbleOther: '#F1F3F4', // Grey bubble
    chatBackground: '#FFFFFF', // White chat area
    dateSeparatorBackground: '#F1F3F4',
    dateSeparatorText: '#5F6368',
    textPrimary: '#202124', // Dark Grey text
    textSecondary: '#5F6368', // Medium Grey text
    textBubbleMe: '#174EA6', // Darker blue text on own bubble
    textBubbleOther: '#202124', // Dark grey text on other bubble
    icon: '#5F6368',
    iconActive: '#1967D2', // Google Blue for active icons
    border: '#DADCE0', // Material border color
    scrollbarTrack: '#F1F3F4',
    scrollbarThumb: '#BDC1C6',
    scrollbarThumbHover: '#4285F4',
    tick_sent: '#5F6368',
    tick_delivered: '#5F6368',
    tick_read: '#4285F4',
    // Quad Colors (can be used for specific accents if desired later)
    googleRed: '#EA4335',
    googleYellow: '#FBBC05',
    googleGreen: '#34A853',
  },
  font: "'Google Sans', Roboto, sans-serif",
  logo: '/google-logo.svg',
  bubbleBorderRadius: '16px', // Material style rounding
  // No specific background image for Google theme by default
};

// --- Instagram Theme ---
export const instagramTheme = {
  name: 'instagram',
  panel_width: '30%',
  max_panel_width: '400px',
  gradient: 'linear-gradient(135deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D, #F77737, #FCAF45, #FFDC80)',
  colors: {
    primary: '#C13584', // Pink/Purple
    background: '#121212',
    panelBackground: '#1C1C1C',
    headerBackground: '#1C1C1C',
    inputBackground: '#2C2C2E',
    hoverBackground: '#2C2C2E',
    bubbleMe: '#833AB4', // Purpleish bubble
    bubbleOther: '#2C2C2E',
    chatBackground: '#121212',
    dateSeparatorBackground: '#2C2C2E',
    dateSeparatorText: '#8E8E93',
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    textBubbleMe: '#FFFFFF',
    textBubbleOther: '#FFFFFF',
    icon: '#FFFFFF',
    iconActive: '#FCAF45', // Orange/Yellow hover
    border: '#3A3A3C',
    scrollbarTrack: '#1C1C1C',
    scrollbarThumb: '#545458',
    scrollbarThumbHover: '#C13584',
    tick_sent: '#8E8E93',
    tick_delivered: '#8E8E93',
    tick_read: '#FCAF45', // Use a gradient accent color
  },
  font: "'Poppins', 'Roboto', sans-serif",
  logo: '/instagram-logo.svg',
  bubbleBorderRadius: '14px',
  // Background handled by animation in GlobalStyles
};


// --- GlobalStyles ---
export const GlobalStyles = createGlobalStyle`
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden; /* Prevent scrolling on body */
  }

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

  // Scrollbar styles
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

// Themes object for easy access
export const themes = {
  netflix: netflixTheme,
  spotify: spotifyTheme,
  apple: appleTheme,
  google: googleTheme,
  instagram: instagramTheme,
};

