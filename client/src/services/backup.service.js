import api from './api';

// Tell the server to create a new backup
const createBackup = () => {
  return api.post('/backup/create');
};

// Get a list of available backups from the server
const getBackups = () => {
  return api.get('/backup/list');
};

// Tell the server to restore a specific backup
const restoreBackup = (backupId) => {
  return api.post(`/backup/restore/${backupId}`);
};

const backupService = {
  createBackup,
  getBackups,
  restoreBackup,
};

export default backupService;