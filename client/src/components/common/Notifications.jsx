import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import userService from '../../services/user.service';
import { IoMdClose } from 'react-icons/io';
import { FaUserFriends } from 'react-icons/fa';

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; margin-top: -10px; }
  to { opacity: 1; margin-top: 0; }
`;

const NotificationContainer = styled.div`
    position: fixed;
    top: 60px;
    left: 400px;
    width: 420px; /* Slightly wider for Insta style */
    background-color: ${props => props.theme.colors.panelBackground};
    border: 1px solid ${props => props.theme.colors.border || 'rgba(255,255,255,0.08)'};
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
    z-index: 10000;
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    animation: ${fadeIn} 0.25s ease-out;
    backdrop-filter: blur(10px);

    /* Scrollbar styling */
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 4px; }
    
    @media (max-width: 768px) {
        left: 50%;
        transform: translateX(-50%);
        width: 95vw;
        top: 70px;
    }
`;

const Header = styled.div`
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${props => props.theme.colors.border || 'rgba(255,255,255,0.08)'};
    background-color: ${props => props.theme.colors.headerBackground};
    position: sticky;
    top: 0;
    z-index: 10;
`;

const Title = styled.h3`
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${props => props.theme.colors.textPrimary};
`;

const CloseIcon = styled(IoMdClose)`
    cursor: pointer;
    color: ${props => props.theme.colors.textSecondary};
    font-size: 1.5rem;
    padding: 4px;
    border-radius: 50%;
    &:hover { background-color: rgba(255,255,255,0.1); color: ${props => props.theme.colors.textPrimary}; }
`;

const NotificationList = styled.div`
    display: flex;
    flex-direction: column;
`;

const NotificationItem = styled.div`
    padding: 12px 16px;
    display: flex;
    align-items: center; /* Center items vertically */
    gap: 14px;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: ${props => props.theme.colors.hoverBackground || 'rgba(255,255,255,0.03)'};
    }
`;

const Avatar = styled.img`
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid ${props => props.theme.colors.border || '#333'};
`;

const TextContent = styled.div`
    flex: 1;
    font-size: 0.9rem;
    color: ${props => props.theme.colors.textPrimary};
    line-height: 1.4;
    
    strong {
        font-weight: 600;
        cursor: pointer;
    }
    
    span.time {
        color: ${props => props.theme.colors.textSecondary};
        font-size: 0.8rem;
        margin-left: 6px;
    }
`;

const ActionButtons = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const Button = styled.button`
    padding: 7px 16px;
    border-radius: 8px;
    border: none;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
    white-space: nowrap;

    /* Primary (Confirm) -> Blue */
    ${props => props.primary && css`
        background-color: #0095F6;
        color: white;
    `}

    /* Secondary (Delete/Loading) -> Grey */
    ${props => !props.primary && css`
        background-color: ${props.theme.colors.inputBackground || '#363636'};
        color: ${props.theme.colors.textPrimary};
        border: 1px solid ${props.theme.colors.border || '#555'};
    `}

    &:hover { opacity: 0.85; }
    &:disabled { opacity: 0.6; cursor: default; }
`;

const EmptyState = styled.div`
    padding: 3rem;
    text-align: center;
    color: ${props => props.theme.colors.textSecondary};
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    
    svg { font-size: 2.5rem; opacity: 0.5; }
`;


const Notifications = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    // Track local status changes for instant UI feedback { [notificationId]: 'confirmed' | 'deleted' }
    const [statusMap, setStatusMap] = useState({});

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const { data } = await userService.getNotifications();
            // Deduplicate just in case
            const uniqueNotifications = Array.from(new Map(data.map(item => [item._id, item])).values());
            setNotifications(uniqueNotifications);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (notifId, senderId) => {
        // Optimistic update
        setStatusMap(prev => ({ ...prev, [notifId]: 'confirmed' }));
        
        try {
            await userService.acceptFriendRequest(senderId);
            // Optionally reload to sync, but we rely on local state for smoothness
        } catch(e) { 
            console.error(e); 
            alert('Failed to accept');
            // Revert on failure
            setStatusMap(prev => {
                const newState = { ...prev };
                delete newState[notifId];
                return newState;
            });
        }
    };

    const handleReject = async (notifId, senderId) => {
        // Optimistic update
        setStatusMap(prev => ({ ...prev, [notifId]: 'deleted' }));
        
        try {
            await userService.rejectFriendRequest(senderId);
        } catch(e) { console.error(e); }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds
        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    return (
        <NotificationContainer>
            <Header>
                <Title>Notifications</Title>
                <CloseIcon onClick={onClose}/>
            </Header>
            
            <NotificationList>
                {loading ? (
                    <EmptyState><p>Loading...</p></EmptyState>
                ) : notifications.length === 0 ? (
                    <EmptyState>
                        <FaUserFriends />
                        <p>No notifications yet.</p>
                    </EmptyState>
                ) : (
                    notifications.map((notif) => {
                        const status = statusMap[notif._id];
                        // If deleted locally, hide it
                        if (status === 'deleted') return null;

                        const senderName = notif.sender?.name || 'User';
                        // Clean message: "John accepted..." -> "accepted..."
                        const messageText = (notif.message || '').replace(senderName, '').trim();

                        return (
                            <NotificationItem key={notif._id}>
                                <Avatar 
                                    src={notif.sender?.profilePic || `https://i.pravatar.cc/150?u=${notif.sender?._id || 'u'}`} 
                                    alt={senderName} 
                                />
                                
                                <TextContent>
                                    <strong>{senderName}</strong> {messageText}
                                    <span className="time">{formatTime(notif.createdAt)}</span>
                                </TextContent>

                                {notif.type === 'friend_request' && (
                                    <ActionButtons>
                                        {status === 'confirmed' ? (
                                            <Button disabled>Following</Button>
                                        ) : (
                                            <>
                                                <Button primary onClick={() => handleAccept(notif._id, notif.sender._id)}>
                                                    Confirm
                                                </Button>
                                                <Button onClick={() => handleReject(notif._id, notif.sender._id)}>
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </ActionButtons>
                                )}
                                
                                {notif.type === 'friend_request_confirmed' && (
                                    <ActionButtons>
                                         <Button disabled>Following</Button>
                                    </ActionButtons>
                                )}
                            </NotificationItem>
                        );
                    })
                )}
            </NotificationList>
        </NotificationContainer>
    );
};

export default Notifications;