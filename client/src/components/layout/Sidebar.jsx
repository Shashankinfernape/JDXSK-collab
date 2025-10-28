import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components'; // Keep css import if needed elsewhere
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import ChatList from '../chat/ChatList';
import ProfileDrawer from '../profile/ProfileDrawer';
import SettingsModal from '../settings/SettingsModal';
import userService from '../../services/user.service';
import SearchResults from '../search/SearchResults';
import { useTheme } from '../../context/ThemeContext';
// Original 4 theme icons
import { TbBrandNetflix } from 'react-icons/tb';
import { BsSpotify, BsApple, BsGoogle } from 'react-icons/bs';
// Icons for dropdown
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
  height: 100vh; /* Full viewport height */
  display: flex;
  flex-direction: column; /* Stack header, search, list vertically */
  background-color: ${props => props.theme.colors.panelBackground};
  position: relative; /* For positioning dropdown */
  border-right: ${props => subtleBorder(props.theme)};
  overflow: hidden; /* Prevent container itself from scrolling */
`;

const SidebarHeader = styled.header`
  padding: 0.6rem 1rem;
  background-color: ${props => props.theme.colors.headerBackground};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; /* Prevent header from shrinking */
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

// --- ThemeSwitcher with Original 4 Brand Colors ---
const ThemeSwitcher = styled(IconButton)`
  font-size: 1.6rem;
  color: ${props => props.theme.colors.icon};

  /* Specific colors based on the current theme */
  ${({ theme }) => theme.name === 'netflix' && css` color: #E50914; `}
  ${({ theme }) => theme.name === 'spotify' && css` color: #1DB954; `}
  ${({ theme }) => theme.name === 'apple' && css` color: ${props => props.theme.colors.textSecondary}; /* Grey for light Apple */ `}
  ${({ theme }) => theme.name === 'google' && css` color: #4285F4; `}

  &:hover { opacity: 0.8; }
`;

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
  display: flex; align-items: center; flex-shrink: 0; /* Prevent search bar from shrinking */
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

// --- NEW: Container for the scrollable list ---
const ListContainer = styled.div`
  flex-grow: 1; /* Take remaining vertical space */
  overflow-y: auto; /* Make ONLY this part scrollable */
  overflow-x: hidden; /* Hide horizontal scroll */
`;


// --- Sidebar Component ---
const Sidebar = ({ onChatSelect }) => {
  const { user, logout } = useAuth();
  const { themeName, cycleTheme, theme } = useTheme();
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
      // No Instagram icon in this reverted state
      default: return <TbBrandNetflix />;
    }
  };

  return (
    <>
      <SidebarContainer>
        <SidebarHeader>
          <HeaderLeft>
            <UserAvatar
              theme={theme} // Keep theme prop for potential future use (like borders)
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

        {/* --- FIX: Use ListContainer for scrolling --- */}
        <ListContainer>
          {isSearching ? (
            <SearchResults results={searchResults} onUserClick={closeSearch} />
          ) : (
            <ChatList onChatSelect={onChatSelect} />
          )}
        </ListContainer>
        {/* --- END FIX --- */}

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

