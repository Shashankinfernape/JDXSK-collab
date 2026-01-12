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
    font: "'Roboto', sans-serif",
    logo: '/netflix-logo.svg',
    bubbleBorderRadius: '7px',
  },
  spotify: {
    primary: '#1DB954',
    font: "'Roboto', sans-serif",
    logo: '/spotify-logo.svg',
    bubbleBorderRadius: '7px',
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
      colors.background = '#0E0E0F'; // Base
      colors.chatBackground = '#0E0E0F';
      colors.panelBackground = '#141414'; // Alt
      colors.headerBackground = '#141414';
      colors.inputBackground = '#1F1F1F';
      colors.hoverBackground = '#1F1F1F';
      colors.border = '#1F1F1F';
      // Optional vignette effect handled in GlobalStyles via css
    } else {
      colors.background = '#F5F5F4'; // Base
      colors.chatBackground = '#F5F5F4';
      colors.panelBackground = '#EDEDED'; // Alt
      colors.headerBackground = '#EDEDED';
      colors.inputBackground = '#FFFFFF';
      colors.hoverBackground = '#E0E0E0';
      colors.border = '#E0E0E0';
    }
  }

  // 🔎 Google UI
  if (brandKey === 'google') {
    if (isDark) {
      colors.background = '#1F1F1F'; // Base
      colors.chatBackground = '#1F1F1F';
      colors.panelBackground = '#242424'; // Alt
      colors.headerBackground = '#242424';
      colors.inputBackground = '#303134';
      colors.hoverBackground = '#303134';
      colors.bubbleMe = '#8AB4F8'; // Lighter blue
      colors.textBubbleMe = '#202124';
    } else {
      colors.background = '#FAFAFA'; // Base
      colors.chatBackground = '#FAFAFA';
      colors.panelBackground = '#F2F2F2'; // Alt
      colors.headerBackground = '#F2F2F2';
      colors.inputBackground = '#FFFFFF';
      colors.hoverBackground = '#E8EAED';
      colors.bubbleMe = '#D2E3FC'; // Light blue
      colors.textBubbleMe = '#174EA6';
      colors.primary = '#1A73E8';
    }
  }

  // 🎵 Spotify UI
  if (brandKey === 'spotify') {
    if (isDark) {
      colors.background = '#121212'; // Base
      colors.chatBackground = '#121212';
      colors.panelBackground = '#181818'; // Alt
      colors.headerBackground = '#181818';
      colors.inputBackground = '#282828';
      colors.hoverBackground = '#282828';
      colors.border = '#282828';
    } else {
      colors.background = '#F4F7F5'; // Base
      colors.chatBackground = '#F4F7F5';
      colors.panelBackground = '#EAF1EC'; // Alt
      colors.headerBackground = '#EAF1EC';
      colors.inputBackground = '#FFFFFF';
      colors.hoverBackground = '#DDE5E0';
    }
  }

  // 🍎 Apple UI
  if (brandKey === 'apple') {
    if (isDark) {
      colors.background = '#0B0B0C'; // Base
      colors.chatBackground = '#0B0B0C';
      colors.panelBackground = '#111113'; // Alt
      colors.headerBackground = '#111113';
      colors.inputBackground = '#1C1C1E';
      colors.hoverBackground = '#1C1C1E';
      colors.border = '#1C1C1E';
    } else {
      colors.background = '#F9F9F7'; // Base
      colors.chatBackground = '#F9F9F7';
      colors.panelBackground = '#EFEFEA'; // Alt
      colors.headerBackground = '#EFEFEA';
      colors.inputBackground = '#FFFFFF';
      colors.hoverBackground = '#E5E5E0';
      colors.bubbleMe = '#007AFF';
    }
  }

  // 📸 Instagram UI
  if (brandKey === 'instagram') {
    if (isDark) {
      colors.background = '#0F1115'; // Base
      colors.chatBackground = '#0F1115'; // Gradient handled in GlobalStyles
      colors.panelBackground = '#151821'; // Alt
      colors.headerBackground = '#151821';
      colors.inputBackground = '#262626';
      colors.hoverBackground = '#262626';
      colors.border = '#262626';
    } else {
      colors.background = '#FFFFFF'; // Base
      colors.chatBackground = '#FFFFFF';
      colors.panelBackground = '#F3F4F6'; // Alt
      colors.headerBackground = '#FFFFFF';
      colors.inputBackground = '#EFEFEF';
      colors.hoverBackground = '#FAFAFA';
      colors.primary = '#C13584';
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

    /* --- Netflix Vignette (Dark Mode) --- */
    ${({ theme }) => theme.name === 'netflix' && theme.isDark && css`
      background: radial-gradient(circle, ${theme.colors.background} 60%, rgba(0,0,0,0.35) 100%);
    `}

    /* --- Spotify Accent Glow (Dark Mode) --- */
    ${({ theme }) => theme.name === 'spotify' && theme.isDark && css`
      background: radial-gradient(circle at top left, rgba(30,215,96,0.04), transparent 40%),
                  ${theme.colors.background};
    `}

    /* --- Instagram Gradient Hint (Dark Mode) --- */
    ${({ theme }) => theme.name === 'instagram' && theme.isDark && css`
      background: linear-gradient(to bottom, #0F1115, #151821);
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
