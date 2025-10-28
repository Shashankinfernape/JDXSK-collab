import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import ChatList from '../chat/ChatList';
import ProfileDrawer from '../profile/ProfileDrawer';
import SettingsModal from '../settings/SettingsModal';
import userService from '../../services/user.service';
import SearchResults from '../search/SearchResults';
import { useTheme } from '../../context/ThemeContext'; // Import theme hook
import { TbBrandNetflix } from 'react-icons/tb';
import { BsSpotify, BsApple, BsGoogle } from 'react-icons/bs'; // Add Apple/Google icons
import { HiDotsVertical } from 'react-icons/hi';
import { CgProfile } from 'react-icons/cg';
import { IoMdSettings, IoMdLogOut } from 'react-icons/io';
import { AiOutlineSearch } from 'react-icons/ai';

// Helper for subtle borders
const subtleBorder = (theme) => `1px solid ${theme.colors.border || theme.colors.hoverBackground}`;

// --- Styled Components using new theme structure ---
const SidebarContainer = styled.div`
  width: ${props => props.theme.panel_width};
  max-width: ${props => props.theme.max_panel_width};
  min-width: 300px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.panelBackground}; // Use panelBackground
  position: relative;
  border-right: ${props => subtleBorder(props.theme)}; // Add subtle right border
`;

const SidebarHeader = styled.header`
  padding: 0.6rem 1rem; // Adjust padding like WhatsApp
  background-color: ${props => props.theme.colors.headerBackground};
  display: flex;
  justify-content: space-between;
  align-items: center;
  // No border needed here
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
    color: ${props => props.theme.colors.iconActive}; // Use active color on hover
  }
`;

const ThemeSwitcher = styled(IconButton)`
  font-size: 1.6rem;
  color: ${props => props.theme.colors.icon}; // Standard icon color
  &:hover {
    color: ${props => props.theme.colors.iconActive};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 120%;
  right: 0;
  background-color: ${props => props.theme.colors.hoverBackground}; // Background for dropdown
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); // Softer shadow
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
    background-color: ${props => props.theme.colors.inputBackground}; // Use input bg for hover
  }

  &.logout {
    color: ${props => props.theme.colors.primary}; // Use primary color for logout
    font-weight: 600;
  }
`;

const SearchBar = styled.div`
  padding: 0.5rem 0.8rem; // WhatsApp style padding
  background-color: ${props => props.theme.colors.panelBackground}; // Match sidebar bg
  border-bottom: ${props => subtleBorder(props.theme)}; // Subtle border below search
  display: flex;
  align-items: center;
`;

const SearchInputWrapper = styled.div` // Wrapper for input + icon
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.colors.inputBackground}; // Input field bg
  border-radius: 8px;
  padding: 0.4rem 0.8rem; // Inner padding
`;

const SearchIcon = styled(AiOutlineSearch)`
  color: ${props => props.theme.colors.icon};
  font-size: 1.1rem; // Adjust size
  margin-right: 0.8rem; // Space between icon and text
`;

const SearchInput = styled.input`
  width: 100%;
  background: transparent; // Background handled by wrapper
  border: none;
  padding: 0.2rem 0; // Minimal vertical padding
  color: ${props => props.theme.colors.textPrimary};
  outline: none;
  font-size: 0.9rem; // Adjust font size
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
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
              src={user?.profilePic || `https://i.pravatar.cc/150?u=${user?._id}`} // Fallback
              alt={user?.name}
              onClick={() => setShowProfile(true)}
            />
             {/* Theme switcher moved to the right */}
          </HeaderLeft>
          <HeaderIcons>
             <ThemeSwitcher onClick={cycleTheme}>
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

        {isSearching ? (
          <SearchResults results={searchResults} onUserClick={closeSearch} />
        ) : (
          <ChatList />
        )}
      </SidebarContainer>

      {/* Modals/Drawers */}
      <ProfileDrawer
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

export default Sidebar;

