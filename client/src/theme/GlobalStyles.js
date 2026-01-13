import { createGlobalStyle, css, keyframes } from 'styled-components';

// --- Keyframes ---
const instagramBgAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// --- Shared Layout Tokens ---
const layoutTokens = {
  panel_width: '30%',
  max_panel_width: '400px',
  bubbleBorderRadius: '7px', // Default
};

// --- Brand Palettes ---
const brands = {
  netflix: {
    primary: '#E50914',
    font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    logo: '/netflix-logo.svg',
    bubbleBorderRadius: '4px', // Boxier, cinematic feel
  },
  spotify: {
    primary: '#1DB954',
    font: "'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    logo: '/spotify-logo.svg',
    bubbleBorderRadius: '16px', // Rounder, friendly
  },
  apple: {
    primary: '#0A84FF',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    logo: '/apple-logo.svg',
    bubbleBorderRadius: '18px',
  },
  google: {
    primary: '#4285F4',
    font: "'Google Sans', Roboto, sans-serif",
    logo: '/google-logo.svg',
    bubbleBorderRadius: '16px',
  },
  instagram: {
    primary: '#C13584',
    gradient: 'linear-gradient(135deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D, #F77737, #FCAF45, #FFDC80)',
    font: "'Poppins', 'Roboto', sans-serif",
    logo: '/instagram-logo.svg',
    bubbleBorderRadius: '14px',
  }
};

// --- Theme Generator ---
const createTheme = (brandKey, modeKey) => {
  const brand = brands[brandKey];
  const isDark = modeKey === 'dark';
  
  // Default Base Colors (Safe Fallback)
  let colors = {
    background: isDark ? '#121212' : '#F5F5F5',
    panelBackground: isDark ? '#181818' : '#EDEDED',
    headerBackground: isDark ? '#181818' : '#EDEDED',
    inputBackground: isDark ? '#2A2A2A' : '#FFFFFF',
    hoverBackground: isDark ? '#2A2A2A' : '#E0E0E0',
    chatBackground: isDark ? '#121212' : '#F5F5F5',
    textPrimary: isDark ? '#E5E5E5' : '#111B21',
    textSecondary: isDark ? '#A0A0A0' : '#667781',
    border: isDark ? '#2A2A2A' : '#D1D7DB',
    icon: isDark ? '#B3B3B3' : '#54656F',
    iconActive: isDark ? '#FFFFFF' : '#111B21',
    bubbleOther: isDark ? '#2A2A2A' : '#FFFFFF',
    textBubbleOther: isDark ? '#E5E5E5' : '#111B21',
    textBubbleMe: '#FFFFFF',
    scrollbarTrack: isDark ? '#1F1F1F' : '#F0F2F5',
    scrollbarThumb: isDark ? '#808080' : '#D1D7DB',
    primary: brand.primary,
    bubbleMe: brand.primary,
    scrollbarThumbHover: brand.primary,
    tick_read: brand.primary,
    tick_sent: isDark ? '#808080' : '#667781',
    tick_delivered: isDark ? '#808080' : '#667781',
  };

  // --- Specific Overrides per Brand/Mode (per User Request) ---

  // 🎬 Netflix UI
  if (brandKey === 'netflix') {
    if (isDark) {
      colors.background = '#000000'; // Pure black base
      colors.chatBackground = 'linear-gradient(to bottom, #000000, #141414)'; // Subtle gradient
      colors.panelBackground = '#141414'; 
      colors.headerBackground = 'rgba(20, 20, 20, 0.95)'; // Slight transparency
      colors.inputBackground = '#262626';
      colors.hoverBackground = '#333333';
      colors.border = '#333333';
      colors.bubbleOther = '#2F2F2F'; // Dark grey bubbles
      colors.bubbleMe = '#E50914'; // Netflix Red
      colors.textBubbleMe = '#FFFFFF';
      colors.textPrimary = '#FFFFFF';
      colors.textSecondary = '#B3B3B3';
    } else {
      colors.background = '#FFFFFF'; 
      colors.chatBackground = '#FFFFFF';
      colors.panelBackground = '#F3F3F3'; 
      colors.headerBackground = '#F3F3F3';
      colors.inputBackground = '#FFFFFF';
      colors.hoverBackground = '#E5E5E5';
      colors.border = '#E5E5E5';
      colors.bubbleMe = '#E50914';
      colors.bubbleOther = '#E5E5E5';
      colors.textBubbleOther = '#000000';
    }
  }

  // 🎵 Spotify UI
  if (brandKey === 'spotify') {
    if (isDark) {
      colors.background = '#121212';
      // Subtle gradient imitating the player
      colors.chatBackground = 'linear-gradient(180deg, #181818 0%, #121212 100%)';
      colors.panelBackground = '#000000'; // Darker sidebar
      colors.headerBackground = '#181818';
      colors.inputBackground = '#282828';
      colors.hoverBackground = '#282828';
      colors.border = '#282828';
      colors.bubbleOther = '#282828'; // Card grey
      colors.bubbleMe = '#1DB954'; // Spotify Green
      colors.textBubbleMe = '#000000'; // Black text on green usually reads better, or white
      colors.textBubbleMe = '#FFFFFF'; // Keeping white for consistency
      colors.primary = '#1DB954';
      colors.iconActive = '#1DB954'; // Icons light up green
    } else {
      colors.background = '#FFFFFF';
      colors.chatBackground = '#FFFFFF';
      colors.panelBackground = '#F7F7F7';
      colors.headerBackground = '#F7F7F7';
      colors.inputBackground = '#FFFFFF';
      colors.hoverBackground = '#EBEBEB';
      colors.bubbleMe = '#1DB954';
    }
  }

  // 🔎 Google UI
  if (brandKey === 'google') {
    if (isDark) {
      colors.background = '#202124';
      colors.chatBackground = '#202124';
      colors.panelBackground = '#2D2E30';
      colors.headerBackground = '#2D2E30';
      colors.inputBackground = '#3C4043';
      colors.hoverBackground = '#3C4043';
      colors.bubbleMe = '#8AB4F8';
      colors.textBubbleMe = '#202124';
      colors.bubbleOther = '#303134';
    } else {
      colors.background = '#FFFFFF';
      colors.chatBackground = '#FFFFFF';
      colors.panelBackground = '#F1F3F4';
      colors.headerBackground = '#F1F3F4';
      colors.inputBackground = '#FFFFFF';
      colors.hoverBackground = '#E8EAED';
      colors.bubbleMe = '#D2E3FC';
      colors.textBubbleMe = '#174EA6';
      colors.primary = '#1A73E8';
    }
  }

  // 🍎 Apple UI
  if (brandKey === 'apple') {
    if (isDark) {
      colors.background = '#000000';
      colors.chatBackground = '#000000';
      colors.panelBackground = '#1C1C1E'; // iOS System Grey 6
      colors.headerBackground = 'rgba(28, 28, 30, 0.9)'; // Translucent
      colors.inputBackground = '#2C2C2E';
      colors.hoverBackground = '#2C2C2E';
      colors.border = '#2C2C2E';
      colors.bubbleMe = '#0A84FF';
      colors.bubbleOther = '#2C2C2E';
    } else {
      colors.background = '#F2F2F7';
      colors.chatBackground = '#FFFFFF';
      colors.panelBackground = '#F2F2F7';
      colors.headerBackground = 'rgba(242, 242, 247, 0.9)';
      colors.inputBackground = '#FFFFFF';
      colors.hoverBackground = '#E5E5EA';
      colors.bubbleMe = '#007AFF';
      colors.bubbleOther = '#E5E5EA';
    }
  }

  // 📸 Instagram UI
  if (brandKey === 'instagram') {
    if (isDark) {
      colors.background = '#000000';
      colors.chatBackground = '#000000';
      colors.panelBackground = '#000000';
      colors.headerBackground = '#000000';
      colors.inputBackground = '#262626';
      colors.hoverBackground = '#121212';
      colors.border = '#262626';
      colors.bubbleMe = '#3797F0'; // Messenger Blue/Purple-ish often used
      colors.bubbleOther = '#262626';
    } else {
      colors.background = '#FFFFFF';
      colors.chatBackground = '#FFFFFF';
      colors.panelBackground = '#FFFFFF';
      colors.headerBackground = '#FFFFFF';
      colors.inputBackground = '#EFEFEF';
      colors.hoverBackground = '#FAFAFA';
      colors.primary = '#0095F6'; // Instagram Blue
      colors.bubbleMe = '#3797F0';
      colors.bubbleOther = '#EFEFEF';
    }
  }

  return {
    name: brandKey,
    mode: modeKey,
    id: `${brandKey}-${modeKey}`,
    ...layoutTokens,
    ...brand,
    isDark,
    colors
  };
};


// --- Generated Themes ---
export const themes = {
  'netflix-dark': createTheme('netflix', 'dark'),
  'netflix-light': createTheme('netflix', 'light'),
  'spotify-dark': createTheme('spotify', 'dark'),
  'spotify-light': createTheme('spotify', 'light'),
  'apple-dark': createTheme('apple', 'dark'),
  'apple-light': createTheme('apple', 'light'),
  'google-dark': createTheme('google', 'dark'),
  'google-light': createTheme('google', 'light'),
  'instagram-dark': createTheme('instagram', 'dark'),
  'instagram-light': createTheme('instagram', 'light'),
};

// --- GlobalStyles ---
export const GlobalStyles = createGlobalStyle`
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden; 
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
    /* Smooth Theme Transitions */
    transition: background 0.3s ease, color 0.3s ease;

    /* --- Netflix Vignette (Dark Mode) --- */
    ${({ theme }) => theme.name === 'netflix' && theme.isDark && css`
       /* Optional overlay if needed, but handled in chatBackground now */
    `}

    /* --- Spotify Accent Glow (Dark Mode) --- */
    ${({ theme }) => theme.name === 'spotify' && theme.isDark && css`
      /* handled in specific theme colors */
    `}
  }

  /* Scrollbar styles */
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
