import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import userService from '../../services/user.service';
import { IoMdClose } from 'react-icons/io';

const NotificationContainer = styled.div`
    position: fixed;
    top: 60px;
    left: 400px; /* Positioned just to the right of the standard sidebar */
    width: 350px;
    background-color: ${props => props.theme.colors.panelBackground};
    border: 1px solid ${props => props.theme.colors.border || 'rgba(255,255,255,0.1)'};
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    z-index: 10000;
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    /* Handle mobile/small screens */
    @media (max-width: 768px) {
        left: 10px;
        right: 10px;
        width: auto;
        top: 70px;
    }
`;

const Header = styled.div`
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${props => props.theme.colors.border || 'rgba(255,255,255,0.1)'};
    background-color: ${props => props.theme.colors.headerBackground};
    position: sticky;
    top: 0;
    z-index: 1;
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
    font-size: 1.4rem;
    transition: color 0.2s;
    &:hover { color: ${props => props.theme.colors.primary}; }
`;

const NotificationItem = styled.div`
    padding: 1rem;
    border-bottom: 1px solid ${props => props.theme.colors.border || 'rgba(255,255,255,0.05)'};
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background-color: ${props => props.read ? 'transparent' : 'rgba(0, 149, 246, 0.05)'};
    
    &:hover {
        background-color: ${props => props.theme.colors.hoverBackground};
    }
`;

const ContentWrapper = styled.div`
    flex: 1;
`;

const Message = styled.p`
    font-size: 0.95rem;
    color: ${props => props.theme.colors.textPrimary};
    margin: 0 0 8px 0;
    line-height: 1.4;
`;

const Time = styled.span`
    font-size: 0.75rem;
    color: ${props => props.theme.colors.textSecondary};
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
    margin-top: 10px;
`;

const ActionBtn = styled.button`
    padding: 6px 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s;
    background-color: ${props => props.accept ? '#0095F6' : props.theme.colors.inputBackground || '#363636'};
    color: ${props => props.accept ? '#fff' : props.theme.colors.textPrimary};
    
    &:hover { opacity: 0.8; }
`;

const EmptyState = styled.div`
    padding: 30px;
    text-align: center;
    color: ${props => props.theme.colors.textSecondary};
    font-size: 0.9rem;
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
            loadNotifications(); // Reload to refresh list
        } catch(e) { console.error(e); alert('Failed to accept'); }
    };

    const handleReject = async (senderId) => {
        try {
            await userService.rejectFriendRequest(senderId);
            loadNotifications();
        } catch(e) { console.error(e); }
    };

    return (
        <NotificationContainer>
            <Header>
                <Title>Notifications</Title>
                <CloseIcon onClick={onClose}/>
            </Header>
            
            {loading ? (
                <EmptyState>Loading...</EmptyState>
            ) : notifications.length === 0 ? (
                <EmptyState>No new notifications</EmptyState>
            ) : (
                notifications.map(notif => (
                    <NotificationItem key={notif._id} read={notif.isRead}>
                        <ContentWrapper>
                            <Message>{notif.message}</Message>
                            <Time>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Time>
                            {notif.type === 'friend_request' && (
                                <ButtonGroup>
                                    <ActionBtn accept onClick={() => handleAccept(notif.sender._id)}>Accept</ActionBtn>
                                    <ActionBtn onClick={() => handleReject(notif.sender._id)}>Reject</ActionBtn>
                                </ButtonGroup>
                            )}
                        </ContentWrapper>
                    </NotificationItem>
                ))
            )}
        </NotificationContainer>
    );
};

export default Notifications;