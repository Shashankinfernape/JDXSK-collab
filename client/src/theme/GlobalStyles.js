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
  bubbleBorderRadius: '10px', // Professional, not pill-shaped
};

// --- Brand Palettes ---
const brands = {
  netflix: {
    primary: '#E50914', // Brand Red
    font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    logo: '/netflix-logo.svg',
    bubbleBorderRadius: '8px', // Slightly boxier
  },
  spotify: {
    primary: '#1DB954',
    font: "'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    logo: '/spotify-logo.svg',
    bubbleBorderRadius: '12px',
  },
  apple: {
    primary: '#007AFF',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    logo: '/apple-logo.svg',
    bubbleBorderRadius: '12px',
  },
  google: {
    primary: '#1A73E8',
    font: "'Google Sans', Roboto, sans-serif",
    logo: '/google-logo.svg',
    bubbleBorderRadius: '10px',
  },
  instagram: {
    primary: '#CA2E78', // Representative Pink/Purple
    gradient: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    logo: '/instagram-logo.svg',
    bubbleBorderRadius: '14px', // Slightly rounder but professional
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
    chatBackground: isDark ? '#0F0F0F' : '#E5DDD5', // WhatsApp-ish default
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

  // --- Brand Specific Overrides ---

  // 🎬 Netflix UI (Dark/Red/Muted)
  if (brandKey === 'netflix') {
    if (isDark) {
      colors.background = '#000000';
      colors.chatBackground = '#000000'; // Pure black
      colors.panelBackground = '#141414'; // Near black
      colors.headerBackground = '#141414';
      colors.inputBackground = '#202020';
      colors.border = '#333333';
      colors.bubbleOther = '#262626'; // Dark Gray
      colors.bubbleMe = '#B9090B'; // Deep Red (Less saturated)
      colors.textBubbleMe = '#E5E5E5';
      colors.textPrimary = '#E5E5E5';
    } else {
      colors.background = '#FFFFFF';
      colors.panelBackground = '#F3F3F3';
      colors.bubbleOther = '#E5E5E5';
      colors.bubbleMe = '#E50914';
    }
  }

  // 🎵 Spotify UI (Dark/Green/Neon)
  if (brandKey === 'spotify') {
    if (isDark) {
      colors.background = '#121212';
      colors.chatBackground = 'linear-gradient(180deg, #181818 0%, #121212 100%)';
      colors.panelBackground = '#000000';
      colors.headerBackground = '#181818';
      colors.inputBackground = '#282828';
      colors.bubbleOther = '#282828'; // Card Gray
      colors.bubbleMe = '#1DB954'; // Spotify Green
      colors.textBubbleMe = '#FFFFFF';
      colors.primary = '#1DB954';
    }
  }

  // 🍎 Apple UI (Neutral/Blue)
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

  // 📸 Instagram UI (Gradient/Highlights)
  if (brandKey === 'instagram') {
    if (isDark) {
      colors.background = '#000000';
      colors.chatBackground = '#000000';
      colors.panelBackground = '#000000';
      colors.headerBackground = '#000000';
      colors.inputBackground = '#262626';
      colors.bubbleOther = '#262626';
      colors.bubbleMe = 'linear-gradient(135deg, #833AB4, #C13584, #FD1D1D)'; // Gradient Bubble
    } else {
      colors.background = '#FFFFFF';
      colors.chatBackground = '#FFFFFF';
      colors.panelBackground = '#FFFFFF';
      colors.bubbleOther = '#EFEFEF';
      colors.bubbleMe = 'linear-gradient(135deg, #833AB4, #C13584)';
    }
  }

  // 🔎 Google UI (Clean/Blue)
  if (brandKey === 'google') {
    if (isDark) {
      colors.background = '#202124';
      colors.chatBackground = '#202124';
      colors.panelBackground = '#2D2E30';
      colors.inputBackground = '#3C4043';
      colors.bubbleOther = '#303134';
      colors.bubbleMe = '#8AB4F8'; // Light Blue
      colors.textBubbleMe = '#202124'; // Dark text on light blue
    } else {
      colors.background = '#FFFFFF';
      colors.chatBackground = '#FFFFFF';
      colors.panelBackground = '#F1F3F4';
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
