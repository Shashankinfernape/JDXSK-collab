import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
// --- FIX: Add missing imports ---
import ChatList from '../chat/ChatList';
import ProfileDrawer from '../profile/ProfileDrawer';
import SettingsModal from '../settings/SettingsModal';
import userService from '../../services/user.service';
import SearchResults from '../search/SearchResults';
// --- END FIX ---
import { useTheme } from '../../context/ThemeContext';
import { TbBrandNetflix } from 'react-icons/tb';
import { BsSpotify, BsApple, BsGoogle } from 'react-icons/bs';
import { HiDotsVertical } from 'react-icons/hi';
import { CgProfile } from 'react-icons/cg';
import { IoMdSettings, IoMdLogOut } from 'react-icons/io';
import { AiOutlineSearch } from 'react-icons/ai';

// --- Styled components ---
const SidebarContainer = styled.div`
  width: ${props => props.theme.panel_width};
  max-width: ${props => props.theme.max_panel_width};
  min-width: 300px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.panelBackground};
  position: relative; /* For positioning search results */
`;

const SidebarHeader = styled.header`
  padding: 1rem;
  background-color: ${props => props.theme.colors.headerBackground};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.colors.hoverBackground}; // Subtle border
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
  background: none;
  border: none;
  color: ${props => props.theme.colors.icon}; // Use theme color
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    color: ${props => props.theme.colors.iconHover};
  }
`;

const ThemeSwitcher = styled(IconButton)`
  font-size: 1.6rem; // Adjust size if needed
  color: ${props => props.theme.colors.primary}; // Use primary color for active theme icon
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 120%;
  right: 0;
  background-color: ${props => props.theme.colors.hoverBackground};
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 100;
  width: 220px;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  color: ${props => props.theme.colors.textPrimary}; // Use primary text color
  padding: 0.8rem 1rem;
  width: 100%;
  text-align: left;
  font-size: 0.95rem;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.theme.colors.inputBackground}; // Use input background for hover
  }

  &.logout {
    color: ${props => props.theme.colors.primary}; // Use primary color for logout
    font-weight: 600;
  }
`;

const SearchBar = styled.div`
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme.colors.headerBackground}; // Match header bg
  border-bottom: 1px solid ${props => props.theme.colors.hoverBackground};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
`;

const SearchIcon = styled(AiOutlineSearch)`
  color: ${props => props.theme.colors.icon};
  font-size: 1.2rem;
  position: absolute;
  left: 1.75rem;
  z-index: 1; // Ensure icon is above input background
`;

const SearchInput = styled.input`
  width: 100%;
  background: ${props => props.theme.colors.inputBackground}; // Use input background
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem 0.6rem 2.5rem; // Padding for icon
  color: ${props => props.theme.colors.textPrimary}; // Use primary text color
  outline: none;
  font-size: 0.95rem;
  transition: background-color 0.2s ease;

  &:focus {
    background-color: ${props => props.theme.colors.hoverBackground}; // Use hover background on focus
  }
`;

// --- Sidebar Component ---
const Sidebar = () => {
  const { user, logout } = useAuth();
  const { themeName, cycleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search Debounce Effect
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
        setSearchResults([]); // Clear results on error
      }
    };

    const delay = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsSearching(true); // Show results immediately while typing/debouncing
  };

  const closeSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Helper to render the correct theme icon
  const renderThemeIcon = () => {
    switch (themeName) {
      case 'netflix': return <TbBrandNetflix />;
      case 'spotify': return <BsSpotify />;
      case 'apple': return <BsApple />;
      case 'google': return <BsGoogle />;
      default: return <TbBrandNetflix />;
    }
  };

  return (
    <>
      <SidebarContainer>
        <SidebarHeader>
          <HeaderLeft>
            <UserAvatar
              src={user.profilePic || `https://i.pravatar.cc/150?u=${user._id}`} // Add fallback avatar
              alt={user.name}
              onClick={() => setShowProfile(true)}
            />
            <ThemeSwitcher onClick={cycleTheme}>
              {renderThemeIcon()}
            </ThemeSwitcher>
          </HeaderLeft>

          <HeaderIcons>
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
          <SearchIcon />
          <SearchInput
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </SearchBar>

        {/* --- Lines with potential errors --- */}
        {isSearching ? (
          <SearchResults results={searchResults} onUserClick={closeSearch} /> // Line ~181
        ) : (
          <ChatList /> // Line ~183
        )}
      </SidebarContainer>

      {/* --- Lines with potential errors --- */}
      <ProfileDrawer
        isOpen={showProfile}
        onClose={() => setShowProfile(false)} // Line ~189
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)} // Line ~190
      />
    </>
  );
};

export default Sidebar;
