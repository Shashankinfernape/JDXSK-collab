import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

// --- FIX: Exporting both the hook and the provider below ---
export const useSocket = () => useContext(SocketContext);

const RENDER_API_URL = "https://jdxsk-collab.onrender.com"; // Your Server URL

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(RENDER_API_URL, {
        query: { userId: user._id },
        transports: ['polling'],
        reconnectionAttempts: 3,
        reconnectionDelayMax: 5000 
      });

      newSocket.on('connect', () => {
        console.log('Socket.IO connected:', newSocket.id);
      });

      setSocket(newSocket);

      return () => {
        console.log('Socket.IO disconnecting...');
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user, socket]); 

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
