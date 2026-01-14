import React, { useState } from 'react';
import styled from 'styled-components';
import { IoMdClose, IoMdSend } from 'react-icons/io';
import { useChat } from '../../context/ChatContext';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background-color: ${props => props.theme.colors.panelBackground};
  width: 90%;
  max-width: 450px;
  max-height: 80vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.headerBackground};
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  color: ${props => props.theme.colors.textPrimary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.icon};
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  margin: 10px 16px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.inputBackground};
  color: ${props => props.theme.colors.textPrimary};
  outline: none;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ContactList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ccc;
  margin-right: 12px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ContactName = styled.span`
  flex: 1;
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary};
`;

const Checkbox = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.$checked ? props.theme.colors.primary : props.theme.colors.icon};
  background-color: ${props => props.$checked ? props.theme.colors.primary : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &::after {
    content: '✓';
    color: white;
    font-size: 12px;
    display: ${props => props.$checked ? 'block' : 'none'};
  }
`;

const Footer = styled.div`
  padding: 16px;
  border-top: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.headerBackground};
  display: flex;
  justify-content: flex-end;
`;

const SendFab = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.icon};
    cursor: not-allowed;
  }
`;

const PreviewText = styled.div`
  padding: 8px 16px;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-style: italic;
`;

const ForwardModal = ({ isOpen, onClose, messageToForward }) => {
  const { chats, sendMessageToChat, user } = useChat();
  const [selectedChats, setSelectedChats] = useState([]);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const toggleChat = (chatId) => {
    setSelectedChats(prev => 
      prev.includes(chatId) 
        ? prev.filter(id => id !== chatId) 
        : [...prev, chatId]
    );
  };

  const handleSend = () => {
    if (!messageToForward) return;
    
    selectedChats.forEach(chatId => {
      sendMessageToChat(chatId, messageToForward.content);
    });
    
    onClose();
    setSelectedChats([]);
  };
  
  // Filter chats logic
  const filteredChats = chats.filter(chat => {
      // Find the name to display (group name or other user's name)
      const chatName = chat.isGroup 
        ? chat.chatName 
        : chat.users.find(u => u._id !== user._id)?.name || "User";
        
      return chatName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Header>
          <CloseButton onClick={onClose}><IoMdClose /></CloseButton>
          <Title>Forward message to...</Title>
          <div style={{width: 24}}></div> {/* Spacer */}
        </Header>
        
        {messageToForward && (
            <PreviewText>
                "{messageToForward.content}"
            </PreviewText>
        )}
        
        <SearchInput 
          placeholder="Search..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
        
        <ContactList>
          {filteredChats.map(chat => {
             const otherUser = !chat.isGroup ? chat.users.find(u => u._id !== user._id) : null;
             const name = chat.isGroup ? chat.chatName : (otherUser?.name || "Unknown");
             const pic = chat.isGroup ? chat.groupAdmin?.profilePic : otherUser?.profilePic;
             
             return (
               <ContactItem key={chat._id} onClick={() => toggleChat(chat._id)}>
                 <Avatar>
                   <img src={pic || "https://via.placeholder.com/40"} alt={name} />
                 </Avatar>
                 <ContactName>{name}</ContactName>
                 <Checkbox $checked={selectedChats.includes(chat._id)} />
               </ContactItem>
             );
          })}
        </ContactList>
        
        {selectedChats.length > 0 && (
          <Footer>
            <SendFab onClick={handleSend}>
              <IoMdSend style={{ marginLeft: 4 }}/>
            </SendFab>
          </Footer>
        )}
      </ModalContainer>
    </Overlay>
  );
};

export default ForwardModal;
