import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components'; // Import css
import PropTypes from 'prop-types'; // Import PropTypes
import { useAuth } from '../../context/AuthContext';
import ChatList from '../chat/ChatList';
import ProfileDrawer from '../profile/ProfileDrawer';
import SettingsModal from '../settings/SettingsModal';
import userService from '../../services/user.service';
import SearchResults from '../search/SearchResults';
import { useTheme } from '../../context/ThemeContext';
// FIX: Use specific icons for each brand that represent their logo
import { TbBrandNetflix } from 'react-icons/tb';
import { BsSpotify, BsApple, BsGoogle } from 'react-icons/bs';
import { FaInstagram } from 'react-icons/fa'; // Instagram Icon
import { HiDotsVertical } from 'react-icons/hi';
import { CgProfile } from 'react-icons/cg';
import { IoMdSettings, IoMdLogOut } from 'react-icons/io';
import { AiOutlineSearch } from 'react-icons/ai';

// --- Helper for subtle borders (Defined locally) ---
const subtleBorder = (theme) => `1px solid ${theme.colors.border || theme.colors.hoverBackground}`;

// --- Styled components ---
const SidebarContainer = styled.div`
  width: ${props => props.theme.panel_width};
  max-width: ${props => props.theme.max_panel_width};
  min-width: 300px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.panelBackground};
  position: relative;
  border-right: ${props => subtleBorder(props.theme)};
`;

const SidebarHeader = styled.header`
  padding: 0.6rem 1rem;
  background-color: ${props => props.theme.colors.headerBackground};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; // Prevent header from shrinking
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
  ${({ theme }) => theme.name === 'instagram' && css`
    border: 2px solid transparent;
    padding: 2px;
    background-clip: content-box;
    background: ${theme.colors.panelBackground};
    position: relative;
    &::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 50%;
      padding: 2px;
      background: ${theme.gradient};
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
      z-index: -1;
    }
  `}
`;

const HeaderIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconWrapper = styled.div`
  position: relative;
`;

const IconButton = styled.button`
  background: none; border: none;
  color: ${props => props.theme.colors.icon};
  cursor: pointer; font-size: 1.5rem; display: flex; align-items: center;
  padding: 4px; border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease;
  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    color: ${props => props.theme.colors.iconActive};
  }
`;

// --- FIX: Apply specific brand colors to ThemeSwitcher icon ---
const ThemeSwitcher = styled(IconButton)`
  font-size: 1.6rem;

  /* Default/fallback icon color */
  color: ${props => props.theme.colors.icon};

  /* Specific colors based on the current theme */
  ${({ theme }) => theme.name === 'netflix' && css`
    color: #E50914; /* Netflix Red */
  `}
  ${({ theme }) => theme.name === 'spotify' && css`
    color: #1DB954; /* Spotify Green */
  `}
  ${({ theme }) => theme.name === 'apple' && css`
    color: #FFFFFF; /* White for dark Apple theme */
  `}
   ${({ theme }) => theme.name === 'google' && css`
    color: #4285F4; /* Google Blue */
  `}
  ${({ theme }) => theme.name === 'instagram' && css`
    /* Instagram icon is monolithic, use its primary color */
    color: #C13584; /* A strong pink from Instagram's gradient */
    /* Remove SVG fill for monolithic approach unless a single color fill is desired for the icon */
    /* svg { fill: url(#instagram-gradient-icon); } */
  `}

  &:hover {
     opacity: 0.8; /* Slight dim on hover for all */
     /* If hover color is needed, apply conditionally, otherwise rely on default hover logic */
     /* color: ${props => props.theme.colors.iconActive}; */
  }
`;
// --- END FIX ---


const DropdownMenu = styled.div`
  position: absolute; top: 120%; right: 0;
  background-color: ${props => props.theme.colors.hoverBackground};
  border-radius: 5px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 100; width: 220px; overflow: hidden;
`;

const DropdownItem = styled.button`
  display: flex; align-items: center; gap: 0.75rem;
  background: none; border: none;
  color: ${props => props.theme.colors.textPrimary};
  padding: 0.8rem 1rem; width: 100%; text-align: left;
  font-size: 0.95rem; cursor: pointer;
  &:hover { background-color: ${props => props.theme.colors.inputBackground}; }
  &.logout { color: ${props => props.theme.colors.primary}; font-weight: 600; }
`;

const SearchBar = styled.div`
  padding: 0.5rem 0.8rem;
  background-color: ${props => props.theme.colors.panelBackground};
  border-bottom: ${props => subtleBorder(props.theme)};
  display: flex; align-items: center; flex-shrink: 0;
`;

const SearchInputWrapper = styled.div`
  position: relative; width: 100%; display: flex; align-items: center;
  background-color: ${props => props.theme.colors.inputBackground};
  border-radius: 8px; padding: 0.4rem 0.8rem;
`;

const SearchIcon = styled(AiOutlineSearch)`
  color: ${props => props.theme.colors.icon};
  font-size: 1.1rem; margin-right: 0.8rem;
`;

const SearchInput = styled.input`
  width: 100%; background: transparent; border: none;
  padding: 0.2rem 0; color: ${props => props.theme.colors.textPrimary};
  outline: none; font-size: 0.9rem;
  &::placeholder { color: ${props => props.theme.colors.textSecondary}; }
`;

// --- Sidebar Component ---
const Sidebar = ({ onChatSelect }) => {
  const { user, logout } = useAuth();
  const { themeName, cycleTheme, theme } = useTheme(); // Pass theme for avatar & switcher
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const search = async () => {
      try {
        const { data: users } = await userService.searchUsers(searchQuery);
        setSearchResults(users);
      } catch (error) {
        console.error("Failed to search users", error);
        setSearchResults([]);
      }
    };
    const delay = setTimeout(search, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsSearching(true);
  };

  const closeSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const renderThemeIcon = () => {
    switch (themeName) {
      case 'netflix': return <TbBrandNetflix />;
      case 'spotify': return <BsSpotify />;
      case 'apple': return <BsApple />;
      case 'google': return <BsGoogle />;
      case 'instagram': return <FaInstagram />;
      default: return <TbBrandNetflix />;
    }
  };

  return (
    <>
      {/*
        FIX: Removed the SVG gradient definition for Instagram icon.
        If Instagram icon is monolithic, it should just be a single color,
        not a gradient applied via SVG fill.
      */}
      {/* <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="instagram-gradient-icon" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" style={{stopColor: '#405DE6', stopOpacity: 1}} />
            <stop offset="25%" style={{stopColor: '#5851DB', stopOpacity: 1}} />
            <stop offset="50%" style={{stopColor: '#C13584', stopOpacity: 1}} />
            <stop offset="75%" style={{stopColor: '#FD1D1D', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#FCAF45', stopOpacity: 1}} />
          </linearGradient>
        </defs>
      </svg> */}

      <SidebarContainer>
        <SidebarHeader>
          <HeaderLeft>
            <UserAvatar
              theme={theme} // Pass theme for Instagram border
              src={user?.profilePic || `https://i.pravatar.cc/150?u=${user?._id}`}
              alt={user?.name}
              onClick={() => setShowProfile(true)}
            />
          </HeaderLeft>
          <HeaderIcons>
             <ThemeSwitcher onClick={cycleTheme} theme={theme}>
              {renderThemeIcon()}
            </ThemeSwitcher>
            <IconWrapper>
              <IconButton onClick={() => setShowMenu(prev => !prev)}>
                <HiDotsVertical />
              </IconButton>
              {showMenu && (
                <DropdownMenu onMouseLeave={() => setShowMenu(false)}>
                  <DropdownItem onClick={() => { setShowProfile(true); setShowMenu(false); }}>
                    <CgProfile size={20} /> Profile
                  </DropdownItem>
                  <DropdownItem onClick={() => { setShowSettings(true); setShowMenu(false); }}>
                    <IoMdSettings size={20} /> Settings
                  </DropdownItem>
                  <DropdownItem className="logout" onClick={logout}>
                    <IoMdLogOut size={20} /> Logout
                  </DropdownItem>
                </DropdownMenu>
              )}
            </IconWrapper>
          </HeaderIcons>
        </SidebarHeader>

        <SearchBar>
          <SearchInputWrapper>
            <SearchIcon />
            <SearchInput
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </SearchInputWrapper>
        </SearchBar>

        {/* List container */}
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          {isSearching ? (
            <SearchResults results={searchResults} onUserClick={closeSearch} />
          ) : (
            <ChatList onChatSelect={onChatSelect} />
          )}
        </div>
      </SidebarContainer>

      {/* Modals */}
      <ProfileDrawer isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};

Sidebar.propTypes = {
  onChatSelect: PropTypes.func.isRequired,
};

export default Sidebar;

