import { createGlobalStyle, css, keyframes } from 'styled-components';

// --- Keyframes ---
export const highlight = keyframes`
  0% { background-color: transparent; }
  30% { background-color: rgba(255, 235, 59, 0.45); }
  100% { background-color: transparent; }
`;

// --- Shared Layout Tokens ---
const layoutTokens = {
  panel_width: '30%',
  max_panel_width: '400px',
  bubbleBorderRadius: '10px', // Fallback standard
};

// --- Brand Palettes ---
const brands = {
  netflix: {
    primary: '#E50914', // Brand Red
    font: "'Archivo', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    logo: '/netflix-logo.svg',
    bubbleBorderRadius: '8px', // Cinematic, Boxy
    quoteBorderRadius: '4px',
  },
  spotify: {
    primary: '#1DB954',
    font: "'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    logo: '/spotify-logo.svg',
    bubbleBorderRadius: '12px', // Modern, Rounded
    quoteBorderRadius: '8px',
  },
  apple: {
    primary: '#007AFF',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    logo: '/apple-logo.svg',
    bubbleBorderRadius: '16px', // iOS Standard
    quoteBorderRadius: '12px',
  },
  google: {
    primary: '#1A73E8',
    font: "'Google Sans', Roboto, sans-serif",
    logo: '/google-logo.svg',
    bubbleBorderRadius: '12px', // Clean, Minimal
    quoteBorderRadius: '8px',
  },
  instagram: {
    primary: '#E1306C', // Instagram Pink
    gradient: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    logo: '/instagram-logo.svg',
    bubbleBorderRadius: '18px', // Messenger Roundness
    quoteBorderRadius: '14px',
  }
};

// --- Theme Generator ---
const createTheme = (brandKey, modeKey) => {
  const brand = brands[brandKey];
  const isDark = modeKey === 'dark';
  
  // Base Colors - Default Fallback
  let colors = {
    background: isDark ? '#121212' : '#FFFFFF',
    panelBackground: isDark ? '#181818' : '#F5F5F5',
    headerBackground: isDark ? '#181818' : '#F5F5F5',
    inputBackground: isDark ? '#2A2A2A' : '#FFFFFF',
    hoverBackground: isDark ? '#2A2A2A' : '#E0E0E0',
    chatBackground: isDark ? '#0F0F0F' : '#E5DDD5',
    textPrimary: isDark ? '#E5E5E5' : '#111B21',
    textSecondary: isDark ? '#A0A0A0' : '#667781',
    border: isDark ? '#2A2A2A' : '#D1D7DB',
    icon: isDark ? '#B3B3B3' : '#54656F',
    iconActive: isDark ? '#FFFFFF' : '#111B21',
    bubbleOther: isDark ? '#2A2A2A' : '#FFFFFF',
    textBubbleOther: isDark ? '#E5E5E5' : '#111B21',
    textBubbleMe: '#FFFFFF',
    scrollbarTrack: 'transparent', // Keep track invisible for premium feel
    scrollbarThumb: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    scrollbarThumbHover: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    primary: brand.primary,
    bubbleMe: brand.primary,
    tick_read: brand.primary,
    tick_sent: isDark ? '#808080' : '#667781',
    tick_delivered: isDark ? '#808080' : '#667781',
  };

  // --- Brand Specific Overrides ---

  // 🎬 Netflix UI (Cinematic Dark)
  if (brandKey === 'netflix') {
    if (isDark) {
      colors.background = '#000000';
      colors.chatBackground = '#000000'; // Deepest Black
      colors.panelBackground = '#141414'; 
      colors.headerBackground = '#141414';
      colors.inputBackground = '#202020';
      colors.border = '#333333';
      colors.bubbleOther = '#2F2F2F'; // Cinematic Gray
      colors.bubbleMe = '#B9090B'; // Muted Red (Professional)
      colors.textBubbleMe = '#E5E5E5';
      colors.textPrimary = '#E5E5E5';
    } else {
      colors.background = '#FFFFFF';
      colors.panelBackground = '#F3F3F3';
      colors.bubbleOther = '#E5E5E5';
      colors.bubbleMe = '#E50914';
    }
  }

  // 🎵 Spotify UI (Calm Dark Green)
  if (brandKey === 'spotify') {
    if (isDark) {
      colors.background = '#121212';
      colors.chatBackground = '#121212'; // Flat Dark (No gradient noise)
      colors.panelBackground = '#000000';
      colors.headerBackground = '#000000'; // Match panel for seamless look
      colors.inputBackground = '#282828';
      colors.bubbleOther = '#282828';
      colors.bubbleMe = '#1DB954'; // Brand Green
      colors.textBubbleMe = '#FFFFFF';
      colors.primary = '#1DB954';
    }
  }

  // 🍎 Apple UI (Clean Grayscale/Blue)
  if (brandKey === 'apple') {
    if (isDark) {
      colors.background = '#000000';
      colors.chatBackground = '#000000';
      colors.panelBackground = '#1C1C1E'; // iOS System Gray 6
      colors.headerBackground = '#1C1C1E';
      colors.inputBackground = '#2C2C2E';
      colors.bubbleOther = '#2C2C2E'; // System Gray 5
      colors.bubbleMe = '#0A84FF'; // iOS Blue
    } else {
      colors.background = '#FFFFFF';
      colors.chatBackground = '#FFFFFF';
      colors.panelBackground = '#F2F2F7';
      colors.bubbleOther = '#E5E5EA';
      colors.bubbleMe = '#007AFF';
    }
  }

  // 📸 Instagram UI (Clean Messenger Style)
  if (brandKey === 'instagram') {
    if (isDark) {
      colors.background = '#000000';
      colors.chatBackground = '#000000';
      colors.panelBackground = '#000000';
      colors.headerBackground = '#000000';
      colors.inputBackground = '#262626';
      colors.bubbleOther = '#262626'; 
      colors.bubbleMe = '#E1306C'; // Instagram Pink
      colors.primary = '#E1306C';
    } else {
      colors.background = '#FFFFFF';
      colors.chatBackground = '#FFFFFF';
      colors.panelBackground = '#FFFFFF';
      colors.bubbleOther = '#EFEFEF';
      colors.bubbleMe = '#E1306C'; // Instagram Pink
    }
  }

  // 🔎 Google UI (Minimal/Neutral)
  if (brandKey === 'google') {
    if (isDark) {
      colors.background = '#202124';
      colors.chatBackground = '#202124';
      colors.panelBackground = '#2D2E30';
      colors.headerBackground = '#2D2E30'; // Match panel
      colors.inputBackground = '#3C4043';
      colors.bubbleOther = '#303134';
      colors.bubbleMe = '#8AB4F8'; // Muted Blue
      colors.textBubbleMe = '#202124';
    } else {
      colors.background = '#FFFFFF';
      colors.chatBackground = '#FFFFFF';
      colors.panelBackground = '#F1F3F4';
      colors.headerBackground = '#F1F3F4'; // Match panel
      colors.bubbleOther = '#F1F3F4';
      colors.bubbleMe = '#D2E3FC';
      colors.textBubbleMe = '#174EA6';
    }
  }

  return {
    ...layoutTokens,
    ...brand,
    name: brandKey,
    mode: modeKey,
    id: `${brandKey}-${modeKey}`,
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

  /* Scrollbar styles - Premium / Lighter */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.scrollbarThumb};
    border-radius: 10px; /* Rounder caps */
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.scrollbarThumbHover};
  }
`;