import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../common/Button';
import { FcGoogle } from 'react-icons/fc';

// ... (All styled-components are correct, no changes here) ...
const BackupContainer = styled.div`
  width: 100%;
`;

const Title = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.white};
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.grey_light};
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const StatusMessage = styled.p`
  font-size: 0.9rem;
  color: ${props => props.isError ? props.theme.colors.primary : '#4CAF50'};
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
`;

const BackupList = styled.div`
  margin-top: 2rem;
  width: 100%;
`;

const BackupItem = styled.div`
  background: ${props => props.theme.colors.inputBackground};
  color: ${props => props.theme.colors.textPrimary};
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const RestoreButton = styled.button`
  background: transparent;
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 6px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${props => props.theme.colors.primary}; color: #fff; }
`;

const BackupRestore = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [backups, setBackups] = useState([
    { id: 'backup-1', date: new Date().toLocaleDateString() }
  ]); 

  const handleBackup = async () => {
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Simulate success
      
      setMessage('Backup created successfully!');
      setBackups([{ id: `backup-${Date.now()}`, date: new Date().toLocaleString() }, ...backups]);
    } catch (err) {
      console.error(err);
      setMessage('Backup failed. Please try again.');
      setIsError(true);
    }
    setLoading(false);
  };

  const handleRestore = async (backupId) => {
     setMessage(`Restoring backup ${backupId}...`);
     setIsError(false);
     await new Promise(resolve => setTimeout(resolve, 2000));
     setMessage('Restore complete! Please restart the app.');
  };

  return (
    <BackupContainer>
      <Title>Chat Backup</Title>
      <Description>
        Back up your messages to Google Drive. You can restore them when
        you reinstall Chatflix.
      </Description>
      <Button onClick={handleBackup} disabled={loading} style={{ width: '100%' }}>
        <FcGoogle size={22} />
        {loading ? 'Backing up...' : 'Back Up Now'}
      </Button>
      
      {message && <StatusMessage isError={isError}>{message}</StatusMessage>}

      <BackupList>
         <Title style={{ marginTop: '2rem' }}>Available Backups</Title>
         {backups.map(backup => (
          <BackupItem key={backup.id}>
            <span>{backup.date}</span>
            <RestoreButton onClick={() => handleRestore(backup.id)}>
              Restore
            </RestoreButton>
          </BackupItem> // <-- This was the typo </BGackupItem>
         ))}
      </BackupList>
    </BackupContainer>
  );
};

export default BackupRestore;