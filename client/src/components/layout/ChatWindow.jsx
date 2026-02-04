import React, { useState } from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';
import ProfileDrawer from '../profile/ProfileDrawer'; 
import ForwardModal from '../chat/ForwardModal'; 
import { AiOutlineSearch } from 'react-icons/ai';
import { IoMdArrowBack, IoMdClose, IoMdTrash, IoMdShareAlt, IoMdUndo, IoMdArrowUp, IoMdArrowDown } from 'react-icons/io'; 

// Helper
const subtleBorder = (theme) => `1px solid ${theme.colors.border || theme.colors.hoverBackground}`;

const ChatWindowContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%; 
  background: ${props => props.theme.colors.chatBackground}; 
  position: relative; 
`;

const ChatHeader = styled.header`
  padding: 0.6rem 1rem;
  background-color: ${props => props.$isSelectionMode ? props.theme.colors.primary : props.theme.colors.headerBackground}; 
  color: ${props => props.$isSelectionMode ? '#FFF' : props.theme.colors.textPrimary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: ${props => subtleBorder(props.theme)};
  flex-shrink: 0; 
  position: relative;
  z-index: 10; 
  height: 60px; 
  transition: background-color 0.2s ease;
  overflow: hidden;
`;

const SearchBarOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: ${props => props.theme.colors.headerBackground};
  display: flex;
  align-items: center;
  padding: 0 1rem;
  z-index: 20;
  transform: translateY(${props => props.$visible ? '0' : '-100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const SearchInputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.colors.inputBackground};
  border-radius: 20px;
  padding: 0.4rem 1rem;
  margin: 0 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.textPrimary};
  outline: none;
  font-size: 0.95rem;
  &::placeholder { color: ${props => props.theme.colors.textSecondary}; }
`;

const IconButton = styled.button`
  background: none; border: none;
  color: ${props => props.$inheritColor ? 'inherit' : props.theme.colors.icon};
  cursor: pointer; font-size: 1.5rem; display: flex; align-items: center;
  padding: 8px; border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease;
  &:hover {
    background-color: ${props => props.$inheritColor ? 'rgba(255,255,255,0.2)' : props.theme.colors.hoverBackground};
    color: ${props => props.$inheritColor ? '#FFF' : props.theme.colors.iconActive};
  }
`;

const BackButton = styled(IconButton)`
  display: none; 
  margin-right: 0.5rem;
  @media (max-width: 900px) { display: flex !important; } 
`;

const ChatInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  min-width: 0; 
  flex-grow: 1; 
`;

const ChatAvatar = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
`;

const InfoTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0; 
`;

const ChatName = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: inherit; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatStatus = styled.span`
  font-size: 0.75rem;
  color: ${props => props.$isSelectionMode ? 'rgba(255,255,255,0.8)' : props.theme.colors.textSecondary};
`;

const HeaderIcons = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ChatWindow = ({ onBack }) => {
    const { 
        activeChat, onlineUsers, selectedMessages, isSelectionMode, 
        clearSelection, setReplyingTo, messages, deleteMessage,
        chatSearchTerm, setChatSearchTerm
    } = useChat();
    const { user } = useAuth();
    
    const [showProfile, setShowProfile] = useState(false);
    const [isForwarding, setIsForwarding] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    if (!activeChat) return null;

    const toggleSearch = () => {
        setIsSearching(!isSearching);
        if (isSearching) setChatSearchTerm('');
    };

    const handleReply = () => {
        const msgId = selectedMessages[0];
        const msg = messages.find(m => m._id === msgId);
        if (msg) setReplyingTo(msg);
        clearSelection();
    };

    const handleDelete = () => {
        if (window.confirm(`Delete ${selectedMessages.length} messages?`)) {
            deleteMessage(selectedMessages);
        }
    };

    const handleForward = () => setIsForwarding(true);
    const handleCloseForward = () => { setIsForwarding(false); clearSelection(); };

    let displayName = 'Chat';
    let displayPicture = `https://i.pravatar.cc/150?u=default`;
    let otherUserId = null;
    let isOnline = false;
    let profileTarget = null;

    if (activeChat.isGroup) {
        displayName = activeChat.groupName || 'Group Chat';
        displayPicture = activeChat.groupIcon || `https://i.pravatar.cc/150?u=${activeChat._id}`;
        profileTarget = {
            _id: activeChat._id,
            name: activeChat.groupName,
            profilePic: activeChat.groupIcon,
            about: activeChat.description || 'Group Chat',
            email: `${activeChat.participants?.length || 0} members`
        };
    } else if (user && activeChat.participants) {
        const otherParticipant = activeChat.participants.find(p => p._id !== user._id);
        if (otherParticipant) {
            displayName = otherParticipant.name;
            displayPicture = otherParticipant.profilePic || `https://i.pravatar.cc/150?u=${otherParticipant._id}`;
            otherUserId = otherParticipant._id;
            isOnline = onlineUsers.includes(otherUserId);
            profileTarget = otherParticipant;
        }
    }

    const msgToForward = selectedMessages.length > 0 ? messages.find(m => m._id === selectedMessages[0]) : null;

  return (
    <ChatWindowContainer>
      <ChatHeader $isSelectionMode={isSelectionMode}>
        {isSelectionMode ? (
            <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <IconButton $inheritColor onClick={clearSelection}><IoMdClose /></IconButton>
                    <ChatName>{selectedMessages.length} selected</ChatName>
                </div>
                <HeaderIcons>
                    {selectedMessages.length === 1 && (
                        <IconButton $inheritColor onClick={handleReply} title="Reply"><IoMdUndo /></IconButton>
                    )}
                    <IconButton $inheritColor onClick={handleDelete} title="Delete"><IoMdTrash /></IconButton>
                    <IconButton $inheritColor onClick={handleForward} title="Forward"><IoMdShareAlt /></IconButton>
                </HeaderIcons>
            </>
        ) : (
            <>
                <ChatInfo onClick={() => setShowProfile(true)}>
                    <BackButton onClick={(e) => { e.stopPropagation(); onBack(); }}><IoMdArrowBack /></BackButton>
                    <ChatAvatar src={displayPicture} alt={displayName} />
                    <InfoTextContainer>
                        <ChatName>{displayName}</ChatName>
                        <ChatStatus $isSelectionMode={false}>
                            {activeChat.isGroup ? `${activeChat.participants?.length || 0} members` : (isOnline ? 'online' : 'offline')}
                        </ChatStatus>
                    </InfoTextContainer>
                </ChatInfo>
                <HeaderIcons>
                    <IconButton onClick={toggleSearch}><AiOutlineSearch /></IconButton>
                </HeaderIcons>
            </>
        )}

        <SearchBarOverlay $visible={isSearching && !isSelectionMode}>
            <IconButton onClick={toggleSearch}><IoMdArrowBack /></IconButton>
            <SearchInputWrapper>
                <SearchInput 
                    autoFocus 
                    placeholder="Search messages..." 
                    value={chatSearchTerm}
                    onChange={(e) => setChatSearchTerm(e.target.value)}
                />
            </SearchInputWrapper>
            <div style={{ display: 'flex' }}>
                <IconButton 
                    style={{ fontSize: '1.2rem' }} 
                    onClick={() => window._searchPrev && window._searchPrev()}
                >
                    <IoMdArrowUp />
                </IconButton>
                <IconButton 
                    style={{ fontSize: '1.2rem' }} 
                    onClick={() => window._searchNext && window._searchNext()}
                >
                    <IoMdArrowDown />
                </IconButton>
            </div>
        </SearchBarOverlay>
      </ChatHeader>

      <MessageList />
      <MessageInput />

      <ProfileDrawer 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
        targetUser={profileTarget}
        activeChat={activeChat}
      />
      
      <ForwardModal
        isOpen={isForwarding}
        onClose={handleCloseForward}
        messageToForward={msgToForward}
      />
    </ChatWindowContainer>
  );
};

export default ChatWindow;