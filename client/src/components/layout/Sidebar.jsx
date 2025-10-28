import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
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

// --- Helper for subtle borders ---
const subtleBorder = (theme) => `1px solid ${theme.colors.border}`;

// --- Styled components ---
const SidebarContainer = styled.div`
  width: ${props => props.theme.panel_width};
  max-width: ${props => props.theme.max_panel_width};
  min-width: 300px;
  /* --- Height set to 100% of parent --- */
  height: 100%;
  display: flex;
  flex-direction: column; /* Stack header, search, list vertically */
  background-color: ${props => props.theme.colors.panelBackground};
  position: relative;
  border-right: ${props => subtleBorder(props.theme)};
  overflow: hidden; /* Prevent this container from scrolling */
`;

const SidebarHeader = styled.header`
  padding: 0.6rem 1rem;
  background-color: ${props => props.theme.colors.headerBackground};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; /* Prevent header from shrinking */
`;

const HeaderLeft = styled.div`/* ... */`;
const UserAvatar = styled.img`/* ... */`;
const HeaderIcons = styled.div`/* ... */`;
const IconWrapper = styled.div`/* ... */`;
const IconButton = styled.button`/* ... */`;
const ThemeSwitcher = styled(IconButton)`/* ... */`;
const DropdownMenu = styled.div`/* ... */`;
const DropdownItem = styled.button`/* ... */`;

const SearchBar = styled.div`
  padding: 0.5rem 0.8rem;
  background-color: ${props => props.theme.colors.panelBackground};
  border-bottom: ${props => subtleBorder(props.theme)};
  display: flex; align-items: center; flex-shrink: 0; /* Prevent search bar from shrinking */
`;
const SearchInputWrapper = styled.div`/* ... */`;
const SearchIcon = styled(AiOutlineSearch)`/* ... */`;
const SearchInput = styled.input`/* ... */`;


// --- Container for the scrollable list ---
const ListContainer = styled.div`
  flex-grow: 1; /* Take remaining vertical space */
  overflow-y: auto; /* Make ONLY this part scrollable */
  overflow-x: hidden;
  min-height: 0; /* Allows container to shrink correctly */
`;


// --- Sidebar Component ---
const Sidebar = ({ onChatSelect }) => {
    // State and effect hooks remain the same
    const { user, logout } = useAuth();
    const { themeName, cycleTheme, theme } = useTheme();
    const [showMenu, setShowMenu] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => { /* Search debounce logic */ }, [searchQuery]);
    const handleSearchChange = (e) => {/* ... */};
    const closeSearch = () => {/* ... */};
    const renderThemeIcon = () => {/* ... */};

  // The return statement uses the corrected structure
  return (
    <>
      <SidebarContainer>
        {/* Header - Fixed */}
        <SidebarHeader>
          <HeaderLeft>
            <UserAvatar /* ... props ... */ />
          </HeaderLeft>
          <HeaderIcons>
             <ThemeSwitcher /* ... props ... */>
              {renderThemeIcon()}
            </ThemeSwitcher>
            <IconWrapper>
              <IconButton /* ... props ... */>
                <HiDotsVertical />
              </IconButton>
              {showMenu && ( <DropdownMenu> {/* ... */} </DropdownMenu> )}
            </IconWrapper>
          </HeaderIcons>
        </SidebarHeader>

        {/* SearchBar - Fixed */}
        <SearchBar>
          <SearchInputWrapper>
            <SearchIcon />
            <SearchInput /* ... props ... */ />
          </SearchInputWrapper>
        </SearchBar>

        {/* ListContainer - Scrollable */}
        <ListContainer>
          {isSearching ? (
            <SearchResults results={searchResults} onUserClick={closeSearch} />
          ) : (
            // Pass onChatSelect down correctly
            <ChatList onChatSelect={onChatSelect} />
          )}
        </ListContainer>

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

