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
    accents: {
      red: '#EA4335',
      yellow: '#FBBC05',
      green: '#34A853',
    }
  },
  instagram: {
    primary: '#C13584',
    gradient: 'linear-gradient(135deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D, #F77737, #FCAF45, #FFDC80)',
    font: "'Poppins', 'Roboto', sans-serif",
    logo: '/instagram-logo.svg',
    bubbleBorderRadius: '14px',
  }
};

// --- Mode Palettes (Generic) ---
const modes = {
  dark: {
    isDark: true,
    colors: {
      background: '#0b0b0b',
      panelBackground: '#141414',
      headerBackground: '#1F1F1F',
      inputBackground: '#2A2A2A',
      hoverBackground: '#2A2A2A',
      chatBackground: '#0b0b0b',
      textPrimary: '#E5E5E5',
      textSecondary: '#808080',
      border: '#2A2A2A',
      icon: '#B3B3B3',
      iconActive: '#FFFFFF',
      bubbleOther: '#2A2A2A',
      textBubbleOther: '#E5E5E5',
      textBubbleMe: '#FFFFFF',
      scrollbarTrack: '#1F1F1F',
      scrollbarThumb: '#808080',
    }
  },
  light: {
    isDark: false,
    colors: {
      background: '#FFFFFF',
      panelBackground: '#F0F2F5', // WhatsApp web style grey
      headerBackground: '#F0F2F5',
      inputBackground: '#FFFFFF',
      hoverBackground: '#E9EDEF',
      chatBackground: '#EFE7DD', // Warm subtle bg
      textPrimary: '#111B21',
      textSecondary: '#667781',
      border: '#D1D7DB',
      icon: '#54656F',
      iconActive: '#111B21',
      bubbleOther: '#FFFFFF',
      textBubbleOther: '#111B21',
      textBubbleMe: '#FFFFFF',
      scrollbarTrack: '#F0F2F5',
      scrollbarThumb: '#D1D7DB',
    }
  }
};

// --- Theme Generator ---
const createTheme = (brandKey, modeKey) => {
  const brand = brands[brandKey];
  const mode = modes[modeKey];
  
  // Base theme construction
  const theme = {
    name: brandKey,
    mode: modeKey,
    id: `${brandKey}-${modeKey}`,
    ...layoutTokens,
    ...brand, // Font, logo, specific radius overrides
    isDark: mode.isDark,
    colors: {
      ...mode.colors,
      primary: brand.primary, // Inject brand primary
      bubbleMe: brand.primary, // Messages usually brand color
      scrollbarThumbHover: brand.primary,
      tick_read: brand.primary,
      tick_sent: mode.colors.textSecondary,
      tick_delivered: mode.colors.textSecondary,
    }
  };

  // --- Specific Overrides per Brand/Mode ---

  // Netflix Dark (Cinematic)
  if (brandKey === 'netflix' && modeKey === 'dark') {
    theme.colors.background = '#000000';
    theme.colors.chatBackground = '#000000';
    theme.backgroundImage = '/whatsapp-bg.png';
  }
  // Netflix Light (Soft)
  if (brandKey === 'netflix' && modeKey === 'light') {
    theme.colors.chatBackground = '#FFFFFF';
    theme.colors.panelBackground = '#F3F3F3';
    theme.colors.headerBackground = '#FFFFFF';
  }

  // Spotify Dark (Deep)
  if (brandKey === 'spotify' && modeKey === 'dark') {
    theme.colors.background = '#121212';
    theme.colors.panelBackground = '#000000';
    theme.colors.headerBackground = '#181818';
  }
  
  // Apple Dark (Midnight)
  if (brandKey === 'apple' && modeKey === 'dark') {
    theme.colors.background = '#000000';
    theme.colors.panelBackground = '#1C1C1E';
    theme.colors.inputBackground = '#2C2C2E';
  }
  // Apple Light (Airy)
  if (brandKey === 'apple' && modeKey === 'light') {
    theme.colors.panelBackground = '#F5F5F7'; // Apple grey
    theme.colors.headerBackground = '#F5F5F7';
    theme.colors.inputBackground = '#FFFFFF';
    theme.colors.bubbleMe = '#007AFF';
  }

  // Google Light (Material)
  if (brandKey === 'google' && modeKey === 'light') {
     theme.colors.panelBackground = '#FFFFFF';
     theme.colors.border = '#DADCE0';
     theme.colors.bubbleMe = '#D2E3FC'; // Light blue
     theme.colors.textBubbleMe = '#174EA6'; // Dark blue text
     theme.colors.primary = '#1A73E8';
  }
  // Google Dark (Dark Mode)
  if (brandKey === 'google' && modeKey === 'dark') {
     theme.colors.background = '#202124';
     theme.colors.panelBackground = '#202124';
     theme.colors.chatBackground = '#202124';
     theme.colors.headerBackground = '#202124';
     theme.colors.inputBackground = '#303134';
     theme.colors.bubbleMe = '#8AB4F8'; // Lighter blue
     theme.colors.textBubbleMe = '#202124';
  }

  // Instagram Gradient Logic
  if (brandKey === 'instagram') {
     theme.gradient = brand.gradient;
     if (modeKey === 'light') {
         theme.colors.primary = '#C13584';
         theme.colors.panelBackground = '#FFFFFF';
     }
  }

  return theme;
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

// Fallback for ThemeContext initial load if logic assumes simple keys
// We will update ThemeContext to handle IDs.

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

    /* Instagram Animation for Dark Mode Only typically, or both? */
    /* Requirement: "expressive dark vs clean social light" */
    ${({ theme }) => theme.name === 'instagram' && theme.isDark && css`
      background: ${theme.gradient};
      background-size: 400% 400%;
      animation: ${instagramBgAnimation} 15s ease infinite;
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