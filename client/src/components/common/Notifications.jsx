import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import userService from '../../services/user.service';
import { IoMdClose, IoMdTime } from 'react-icons/io';
import { FaUserFriends } from 'react-icons/fa';

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const NotificationContainer = styled.div`
    position: fixed;
    top: 60px;
    left: 400px;
    width: 380px;
    background-color: ${props => props.theme.colors.panelBackground};
    border: 1px solid ${props => props.theme.colors.border || 'rgba(255,255,255,0.08)'};
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
    z-index: 10000;
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    animation: ${fadeIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(10px);

    /* Scrollbar styling */
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 4px; }
    
    @media (max-width: 768px) {
        left: 50%;
        transform: translateX(-50%);
        width: 90vw;
        top: 70px;
        animation: none; /* Simplify on mobile */
    }
`;

const Header = styled.div`
    padding: 1.2rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${props => props.theme.colors.border || 'rgba(255,255,255,0.08)'};
    background-color: ${props => props.theme.colors.headerBackground}; /* Sticky header bg */
    position: sticky;
    top: 0;
    z-index: 10;
`;

const Title = styled.h3`
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: ${props => props.theme.colors.textPrimary};
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const BadgeCount = styled.span`
    background-color: ${props => props.theme.colors.primary};
    color: white;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
`;

const CloseIcon = styled(IoMdClose)`
    cursor: pointer;
    color: ${props => props.theme.colors.textSecondary};
    font-size: 1.5rem;
    transition: all 0.2s;
    padding: 4px;
    border-radius: 50%;
    &:hover { 
        color: ${props => props.theme.colors.textPrimary}; 
        background-color: rgba(255,255,255,0.1);
    }
`;

const NotificationList = styled.div`
    display: flex;
    flex-direction: column;
`;

const NotificationItem = styled.div`
    padding: 1.2rem 1.5rem;
    border-bottom: 1px solid ${props => props.theme.colors.border || 'rgba(255,255,255,0.04)'};
    display: flex;
    align-items: flex-start;
    gap: 16px;
    background-color: ${props => props.read ? 'transparent' : 'rgba(0, 149, 246, 0.04)'};
    transition: background-color 0.2s ease;
    animation: ${slideIn} 0.3s ease-out;
    animation-fill-mode: backwards;
    /* Staggered animation effect would need JS index, keeping simple for now */

    &:hover {
        background-color: ${props => props.theme.colors.hoverBackground || 'rgba(255,255,255,0.03)'};
    }
    
    &:last-child { border-bottom: none; }
`;

const Avatar = styled.img`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid ${props => props.theme.colors.panelBackground};
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
`;

const ContentWrapper = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const MessageHTML = styled.div`
    font-size: 0.95rem;
    color: ${props => props.theme.colors.textPrimary};
    line-height: 1.45;
    
    strong {
        font-weight: 600;
        color: ${props => props.theme.colors.textPrimary};
    }
`;

const MetaInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
`;

const Time = styled.span`
    font-size: 0.75rem;
    color: ${props => props.theme.colors.textSecondary};
    display: flex;
    align-items: center;
    gap: 4px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 12px;
`;

const ActionBtn = styled.button`
    padding: 8px 20px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    
    /* Primary (Accept) */
    background-color: ${props => props.accept ? '#0095F6' : 'transparent'};
    color: ${props => props.accept ? '#fff' : props.theme.colors.textSecondary};
    border: ${props => props.accept ? 'none' : `1px solid ${props.theme.colors.border || '#555'}`};

    &:hover { 
        transform: translateY(-1px);
        filter: brightness(1.1);
        ${props => !props.accept && `
            border-color: ${props.theme.colors.textPrimary};
            color: ${props.theme.colors.textPrimary};
        `}
    }
    
    &:active { transform: translateY(0); }
`;

const EmptyState = styled.div`
    padding: 3rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: ${props => props.theme.colors.textSecondary};
    text-align: center;
    
    svg {
        font-size: 3rem;
        opacity: 0.5;
        color: ${props => props.theme.colors.primary};
    }
    
    p {
        font-size: 0.95rem;
        max-width: 80%;
        line-height: 1.5;
    }
`;

const Notifications = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const { data } = await userService.getNotifications();
            setNotifications(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (senderId) => {
        try {
            await userService.acceptFriendRequest(senderId);
            loadNotifications(); 
        } catch(e) { console.error(e); alert('Failed to accept'); }
    };

    const handleReject = async (senderId) => {
        try {
            await userService.rejectFriendRequest(senderId);
            loadNotifications();
        } catch(e) { console.error(e); }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <NotificationContainer>
            <Header>
                <Title>
                    Notifications 
                    {notifications.filter(n => !n.isRead).length > 0 && 
                        <BadgeCount>{notifications.filter(n => !n.isRead).length}</BadgeCount>
                    }
                </Title>
                <CloseIcon onClick={onClose}/>
            </Header>
            
            <NotificationList>
                {loading ? (
                    <EmptyState><p>Loading updates...</p></EmptyState>
                ) : notifications.length === 0 ? (
                    <EmptyState>
                        <FaUserFriends />
                        <p>No new notifications.<br/>Updates from your friends will appear here.</p>
                    </EmptyState>
                ) : (
                    notifications.map((notif, index) => (
                        <NotificationItem key={notif._id} read={notif.isRead} style={{ animationDelay: `${index * 0.05}s` }}>
                            {/* Use sender profile pic if available */}
                            <Avatar 
                                src={notif.sender?.profilePic || `https://i.pravatar.cc/150?u=${notif.sender?._id || 'unknown'}`} 
                                alt={notif.sender?.name || 'User'} 
                            />
                            
                            <ContentWrapper>
                                {/* Make the name bold by parsing the message or constructing it */}
                                <MessageHTML>
                                    <strong>{notif.sender?.name || 'Someone'}</strong> {notif.message.replace(`${notif.sender?.name || ''}`, '').trim()}
                                </MessageHTML>
                                
                                <MetaInfo>
                                    <Time><IoMdTime size={12}/> {formatTime(notif.createdAt)}</Time>
                                </MetaInfo>

                                {notif.type === 'friend_request' && (
                                    <ButtonGroup>
                                        <ActionBtn accept onClick={() => handleAccept(notif.sender._id)}>Confirm</ActionBtn>
                                        <ActionBtn onClick={() => handleReject(notif.sender._id)}>Delete</ActionBtn>
                                    </ButtonGroup>
                                )}
                            </ContentWrapper>
                        </NotificationItem>
                    ))
                )}
            </NotificationList>
        </NotificationContainer>
    );
};

export default Notifications;