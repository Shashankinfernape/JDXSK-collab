import React, { useState, useEffect } from 'react'; // <-- THIS IS THE FIX
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import ChatList from '../chat/ChatList';
import ProfileDrawer from '../profile/ProfileDrawer';
import SettingsModal from '../settings/SettingsModal';
import userService from '../../services/user.service';
import SearchResults from '../search/SearchResults';
import { HiDotsVertical } from 'react-icons/hi';
import { CgProfile } from 'react-icons/cg';
import { IoMdSettings, IoMdLogOut } from 'react-icons/io';
import { AiOutlineSearch } from 'react-icons/ai';

// --- Import new theme items ---
import { useTheme } from '../../context/ThemeContext';
import { TbBrandNetflix } from 'react-icons/tb';
import { BsSpotify } from 'react-icons/bs';

// ... (All styled-components are correct, no changes needed) ...
const SidebarContainer = styled.div`
  width: ${props => props.theme.panel_width};
  max-width: ${props => props.theme.max_panel_width};
  min-width: 300px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.black};
  position: relative; /* For positioning search results */
`;


const SidebarHeader = styled.header`
  padding: 1rem;
  background-color: ${props => props.theme.colors.black_lighter};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.colors.black};
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
  border: 2px solid transparent;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
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
  color: ${props => props.theme.colors.grey_light};
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.black_lightest};
    color: ${props => props.theme.colors.white};
  }
`;

const ThemeSwitcher = styled(IconButton)`
  font-size: 1.7rem;
  color: ${props => props.themeName === 'netflix' ? props.theme.colors.primary : props.theme.colors.grey_light};

  /* Spotify Icon Color */
  & > .spotify-icon {
    color: ${props => props.themeName === 'spotify' ? props.theme.colors.primary : props.theme.colors.grey_light};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 120%;
  right: 0;
  background-color: ${props => props.theme.colors.black_lightest};
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
  color: ${props => props.theme.colors.text};
  padding: 0.8rem 1rem;
  width: 100%;
  text-align: left;
  font-size: 0.95rem;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.theme.colors.black_lighter};
  }

  &.logout {
    color: ${props => props.theme.colors.primary};
    font-weight: 600;
  }
`;

const SearchBar = styled.div`
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme.colors.black_lighter};
  border-bottom: 1px solid ${props => props.theme.colors.black};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
`;

const SearchIcon = styled(AiOutlineSearch)`
  color: ${props => props.theme.colors.grey};
  font-size: 1.2rem;
  position: absolute;
  left: 1.75rem;
`;

const SearchInput = styled.input`
  width: 100%;
  background: ${props => props.theme.colors.black};
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  color: ${props => props.theme.colors.text};
  outline: none;
  font-size: 0.95rem;
  transition: background-color 0.2s ease;

  &:focus {
    background-color: ${props => props.theme.colors.black_lightest};
  }
`;
// ... (End of styled-components)


const Sidebar = () => {
  const { user, logout } = useAuth();
  const { themeName, toggleTheme } = useTheme(); // Get theme state
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // --- New Search State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  // ---

  // This is the function (Line 182) that was causing the error
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
      }
    };

    // "Debounce" the search: wait 300ms after user stops typing
    const delay = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(delay); // Clear timeout on re-render
  }, [searchQuery]);


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsSearching(true);
  };
  
  const closeSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  }

  return (
    <>
      <SidebarContainer>
        <SidebarHeader>
          <HeaderLeft>
            <UserAvatar
              src={user.profilePic}
              alt={user.name}
              onClick={() => setShowProfile(true)}
            />
            {/* --- Add the switcher button --- */}
            <ThemeSwitcher onClick={toggleTheme} themeName={themeName}>
              {themeName === 'netflix' ? <BsSpotify className='spotify-icon' /> : <TbBrandNetflix />}
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

        {/* --- Conditionally render search or chats --- */}
        {isSearching ? (
          <SearchResults results={searchResults} onUserClick={closeSearch} />
        ) : (
          <ChatList />
        )}

      </SidebarContainer>

      {/* These components are hidden by default */}
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