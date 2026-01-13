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
  bubbleBorderRadius: '10px', // Standardized for professional look
};

// --- Brand Palettes ---
const brands = {
  netflix: {
    primary: '#B9090B', // Muted, professional red
    font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    logo: '/netflix-logo.svg',
    bubbleBorderRadius: '8px', 
  },
  spotify: {
    primary: '#1DB954',
    font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    logo: '/spotify-logo.svg',
    bubbleBorderRadius: '10px',
  },
  apple: {
    primary: '#007AFF',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    logo: '/apple-logo.svg',
    bubbleBorderRadius: '12px',
  },
  google: {
    primary: '#1A73E8',
    font: "'Google Sans', 'Inter', sans-serif",
    logo: '/google-logo.svg',
    bubbleBorderRadius: '10px',
  },
  instagram: {
    primary: '#E1306C',
    gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    font: "'Inter', -apple-system, sans-serif",
    logo: '/instagram-logo.svg',
    bubbleBorderRadius: '12px',
  }
};

// --- Theme Generator ---
const createTheme = (brandKey, modeKey) => {
  const brand = brands[brandKey];
  const isDark = modeKey === 'dark';
  
  // Base Colors - Professional / Minimalist Defaults
  let colors = {
    background: isDark ? '#0B0D0E' : '#FFFFFF',
    panelBackground: isDark ? '#16191B' : '#F9F9F9',
    headerBackground: isDark ? '#16191B' : '#FFFFFF',
    inputBackground: isDark ? '#202327' : '#FFFFFF',
    hoverBackground: isDark ? '#2C3036' : '#F0F2F5',
    chatBackground: isDark ? '#0B0D0E' : '#F4F4F7',
    textPrimary: isDark ? '#ECECEC' : '#1F2937',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#26292D' : '#E5E7EB',
    icon: isDark ? '#9CA3AF' : '#6B7280',
    iconActive: isDark ? '#FFFFFF' : '#111827',
    bubbleOther: isDark ? '#202327' : '#FFFFFF',
    textBubbleOther: isDark ? '#ECECEC' : '#1F2937',
    textBubbleMe: '#FFFFFF',
    scrollbarTrack: isDark ? '#0B0D0E' : '#F9F9F9',
    scrollbarThumb: isDark ? '#374151' : '#D1D5DB',
    primary: brand.primary,
    bubbleMe: brand.primary,
    scrollbarThumbHover: brand.primary,
    tick_read: brand.primary,
    tick_sent: isDark ? '#4B5563' : '#9CA3AF',
    tick_delivered: isDark ? '#4B5563' : '#9CA3AF',
  };

  // --- Brand Refinements ---

  if (brandKey === 'netflix') {
    if (isDark) {
      colors.background = '#000000';
      colors.chatBackground = '#000000';
      colors.panelBackground = '#141414';
      colors.headerBackground = '#141414';
      colors.inputBackground = '#222222';
      colors.bubbleOther = '#262626';
      colors.border = '#262626';
    } else {
      colors.background = '#FFFFFF';
      colors.panelBackground = '#F5F5F1';
      colors.bubbleOther = '#E5E5E1';
    }
  }

  if (brandKey === 'instagram') {
    if (isDark) {
      colors.background = '#000000';
      colors.chatBackground = '#000000';
      colors.panelBackground = '#121212';
      colors.headerBackground = '#000000';
      colors.inputBackground = '#1A1A1A';
      colors.bubbleMe = '#0095F6'; // Professional Instagram Blue
      colors.bubbleOther = '#262626';
      colors.border = '#262626';
    } else {
      colors.background = '#FFFFFF';
      colors.chatBackground = '#FFFFFF';
      colors.panelBackground = '#FAFAFA';
      colors.headerBackground = '#FFFFFF';
      colors.inputBackground = '#FFFFFF';
      colors.bubbleMe = '#0095F6';
      colors.bubbleOther = '#EFEFEF';
      colors.border = '#DBDBDB';
    }
  }

  if (brandKey === 'spotify') {
    if (isDark) {
      colors.background = '#121212';
      colors.panelBackground = '#000000';
      colors.bubbleMe = '#1DB954';
      colors.bubbleOther = '#282828';
      colors.textBubbleMe = '#FFFFFF';
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
