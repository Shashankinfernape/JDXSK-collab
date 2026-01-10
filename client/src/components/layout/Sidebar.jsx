import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ChatList from '../chat/ChatList';
import ProfileDrawer from '../profile/ProfileDrawer';
import SettingsModal from '../settings/SettingsModal';
import userService from '../../services/user.service';
import SearchResults from '../search/SearchResults';
import { useTheme } from '../../context/ThemeContext';
import Notifications from '../common/Notifications';
// --- FIX: Add FaInstagram back ---
import { TbBrandNetflix } from 'react-icons/tb';
import { BsSpotify, BsApple, BsGoogle } from 'react-icons/bs';
import { FaInstagram } from 'react-icons/fa'; // Instagram Icon
// --- END FIX ---
// Icons for dropdown
import { HiDotsVertical } from 'react-icons/hi';
import { CgProfile } from 'react-icons/cg';
import { IoMdSettings, IoMdLogOut, IoMdNotificationsOutline } from 'react-icons/io';
import { AiOutlineSearch } from 'react-icons/ai';

// --- Helper for subtle borders (Defined locally) ---
const subtleBorder = (theme) => `1px solid ${theme.colors.border || theme.colors.hoverBackground}`;

// --- Styled components ---
// Using 100vh height as reverted
const SidebarContainer = styled.div`
  width: ${props => props.theme.panel_width};
  max-width: ${props => props.theme.max_panel_width};
  min-width: 300px;
  height: 100vh; // Reverted height
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
  /* Include Instagram border logic based on theme */
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
      padding: 2px; /* Control border thickness */
      background: ${theme.gradient};
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
      z-index: -1; /* Place behind avatar */
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

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  font-size: 0.7rem;
  padding: 2px 5px;
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.headerBackground};
`;

// --- FIX: Add Instagram color rule back ---
const ThemeSwitcher = styled(IconButton)`
  font-size: 1.6rem;
  color: ${props => props.theme.colors.icon};

  ${({ theme }) => theme.name === 'netflix' && css` color: #E50914; `}
  ${({ theme }) => theme.name === 'spotify' && css` color: #1DB954; `}
  ${({ theme }) => theme.name === 'apple' && css` color: ${props => props.theme.colors.textPrimary}; `} /* White for dark apple */
  ${({ theme }) => theme.name === 'google' && css` color: #4285F4; `}
  ${({ theme }) => theme.name === 'instagram' && css` color: #C13584; `} /* Pink for monolithic insta */

  &:hover { opacity: 0.8; }
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

// Container for the scrollable list (reverted - no min-height)
const ListContainer = styled.div`
  flex-grow: 1; /* Take remaining vertical space */
  overflow-y: auto; /* Make ONLY this part scrollable */
  overflow-x: hidden;
`;


// --- Sidebar Component ---
const Sidebar = ({ onChatSelect }) => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const { themeName, cycleTheme, theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Refs for click outside
  const notificationRef = useRef(null);
  const menuRef = useRef(null);

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

  // Socket Notification Listener
  useEffect(() => {
      if (!socket) return;
      
      const handleNotification = (notif) => {
          setUnreadNotifications(prev => prev + 1);
      };
      
      socket.on('newNotification', handleNotification);
      return () => socket.off('newNotification', handleNotification);
  }, [socket]);

  // Handle clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
        if (notificationRef.current && !notificationRef.current.contains(event.target)) {
            setShowNotifications(false);
        }
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setShowMenu(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef, menuRef]);

  const toggleNotifications = () => {
      if (!showNotifications) {
          setUnreadNotifications(0);
      }
      setShowNotifications(!showNotifications);
      setShowMenu(false); // Close other menu
  };

  const toggleMenu = () => {
      setShowMenu(!showMenu);
      setShowNotifications(false); // Close other menu
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsSearching(true);
  };

  const closeSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // --- FIX: Add Instagram case back ---
  const renderThemeIcon = () => {
    switch (themeName) {
      case 'netflix': return <TbBrandNetflix />;
      case 'spotify': return <BsSpotify />;
      case 'apple': return <BsApple />;
      case 'google': return <BsGoogle />;
      case 'instagram': return <FaInstagram />; // Added back
      default: return <TbBrandNetflix />;
    }
  };
  // --- END FIX ---

  return (
    <>
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
            
            <IconWrapper ref={notificationRef}>
                <IconButton onClick={toggleNotifications}>
                    <IoMdNotificationsOutline />
                    {unreadNotifications > 0 && <Badge>{unreadNotifications}</Badge>}
                </IconButton>
                {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}
            </IconWrapper>

            <IconWrapper ref={menuRef}>
              <IconButton onClick={toggleMenu}>
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

        <ListContainer>
          {isSearching ? (
            <SearchResults results={searchResults} onUserClick={closeSearch} />
          ) : (
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