import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

// 1. Define the hook immediately
const useSocketHook = () => useContext(SocketContext);

const RENDER_API_URL = "https://jdxsk-collab.onrender.com"; // Your Server URL

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // --- CRITICAL STABILITY FIX ---
      const newSocket = io(RENDER_API_URL, {
        query: { userId: user._id },
        transports: ['polling'], // Forced polling to avoid WebSocket failures
        reconnectionAttempts: 3, // Limited retries to 3 attempts
        reconnectionDelayMax: 5000 // Max delay of 5 seconds between retries
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

// 2. Export the hook cleanly
export const useSocket = useSocketHook;
