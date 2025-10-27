import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider } from './context/ChatContext';
import { AppThemeProvider } from './context/ThemeContext'; // Import theme provider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* All providers go here */}
      <AppThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <ChatProvider>
              {/* App is inside all providers */}
              <App />
            </ChatProvider>
          </SocketProvider>
        </AuthProvider>
      </AppThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
