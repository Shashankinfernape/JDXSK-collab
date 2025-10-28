import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const RENDER_API_URL = "https://jdxsk-collab.onrender.com"; // Your Server URL

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // --- FIX: Added reconnectionDelayMax and reduced retries ---
      const newSocket = io(RENDER_API_URL, {
        query: { userId: user._id },
        transports: ['polling'], // Sticking with polling for stability
        reconnectionAttempts: 5, // Limit retries to prevent looping
        reconnectionDelayMax: 5000 // Wait up to 5 seconds before retrying
      });
      // --- END FIX ---

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
