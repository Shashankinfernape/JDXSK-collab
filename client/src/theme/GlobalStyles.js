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
  bubbleBorderRadius: '7px', // Fallback
};

// --- Brand Palettes ---
const brands = {
  netflix: {
    primary: '#E50914', // Brand Red
    font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    logo: '/netflix-logo.svg',
    bubbleBorderRadius: '4px', // Boxy, Cinematic
  },
  spotify: {
    primary: '#1DB954',
    font: "'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    logo: '/spotify-logo.svg',
    bubbleBorderRadius: '16px', // Friendly
  },
  apple: {
    primary: '#007AFF',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    logo: '/apple-logo.svg',
    bubbleBorderRadius: '18px', // iOS Standard
  },
  google: {
    primary: '#1A73E8',
    font: "'Google Sans', Roboto, sans-serif",
    logo: '/google-logo.svg',
    bubbleBorderRadius: '16px',
  },
  instagram: {
    primary: '#E1306C', // Brand Pink/Purple for accents
    gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    logo: '/instagram-logo.svg',
    bubbleBorderRadius: '22px', // Super Round (Messenger style)
  }
};

// --- Theme Generator ---
const createTheme = (brandKey, modeKey) => {
  const brand = brands[brandKey];
  const isDark = modeKey === 'dark';
  
  // Base Colors - Softer, balanced approach
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

  // --- Brand Refinements ---

  // 🎬 Netflix UI
  if (brandKey === 'netflix') {
    if (isDark) {
      colors.background = '#000000';
      colors.chatBackground = 'radial-gradient(circle, #101010 60%, #000000 100%)'; // Restored Vignette
      colors.panelBackground = '#141414';
      colors.headerBackground = 'rgba(20, 20, 20, 0.95)';
      colors.inputBackground = '#262626';
      colors.hoverBackground = '#333333';
      colors.border = '#333333';
      colors.bubbleOther = '#2F2F2F'; // Softer Dark Grey
    } else {
      colors.background = '#FFFFFF';
      colors.panelBackground = '#F3F3F3';
      colors.headerBackground = '#F3F3F3';
      colors.bubbleOther = '#E5E5E5';
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
      colors.bubbleMe = '#3797F0'; // Messenger Blue (High Visibility)
      colors.bubbleOther = '#262626';
      colors.border = '#262626';
    } else {
      colors.background = '#FFFFFF';
      colors.chatBackground = '#FFFFFF';
      colors.panelBackground = '#FFFFFF';
      colors.headerBackground = '#FFFFFF';
      colors.inputBackground = '#EFEFEF';
      colors.bubbleMe = '#3797F0';
      colors.bubbleOther = '#EFEFEF';
    }
  }

  // 🎵 Spotify UI
  if (brandKey === 'spotify') {
    if (isDark) {
      colors.background = '#121212';
      colors.chatBackground = 'linear-gradient(180deg, #181818 0%, #121212 100%)'; // Player Gradient
      colors.panelBackground = '#000000';
      colors.inputBackground = '#282828';
      colors.bubbleMe = '#1DB954';
      colors.bubbleOther = '#282828';
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
