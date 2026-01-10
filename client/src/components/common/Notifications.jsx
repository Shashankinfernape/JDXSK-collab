import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import userService from '../../services/user.service';
import { IoMdClose } from 'react-icons/io';

const NotificationContainer = styled.div`
    position: absolute;
    top: 60px;
    right: 10px;
    width: 320px;
    background-color: ${props => props.theme.colors.panelBackground};
    border: 1px solid ${props => props.theme.colors.border || '#333'};
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.6);
    z-index: 2000;
    max-height: 400px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
`;

const Header = styled.div`
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${props => props.theme.colors.border || '#333'};
    background-color: ${props => props.theme.colors.headerBackground || 'rgba(0,0,0,0.2)'};
`;

const Title = styled.span`
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
    font-size: 1rem;
`;

const CloseIcon = styled(IoMdClose)`
    cursor: pointer;
    color: ${props => props.theme.colors.textSecondary};
    font-size: 1.2rem;
    &:hover { color: ${props => props.theme.colors.textPrimary}; }
`;

const NotificationItem = styled.div`
    padding: 12px 16px;
    border-bottom: 1px solid ${props => props.theme.colors.border || '#333'};
    display: flex;
    flex-direction: column;
    gap: 8px;
    background-color: ${props => props.read ? 'transparent' : props.theme.colors.inputBackground};
    transition: background 0.2s;

    &:last-child { border-bottom: none; }
    &:hover { background-color: ${props => props.theme.colors.hoverBackground}; }
`;

const Message = styled.p`
    font-size: 0.9rem;
    color: ${props => props.theme.colors.textPrimary};
    margin: 0;
    line-height: 1.4;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 4px;
`;

const ActionBtn = styled.button`
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    background-color: ${props => props.accept ? props.theme.colors.primary : '#444'};
    color: white;
    transition: opacity 0.2s;
    
    &:hover { opacity: 0.9; }
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
                        <Message>{notif.message}</Message>
                        {notif.type === 'friend_request' && (
                            <ButtonGroup>
                                <ActionBtn accept onClick={() => handleAccept(notif.sender._id)}>Accept</ActionBtn>
                                <ActionBtn onClick={() => handleReject(notif.sender._id)}>Reject</ActionBtn>
                            </ButtonGroup>
                        )}
                    </NotificationItem>
                ))
            )}
        </NotificationContainer>
    );
};

export default Notifications;