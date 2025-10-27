import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const RENDER_API_URL = "https://jdxsk-collab.onrender.com"; // --- HARDCODE FIX ---

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // --- FIX: Added 'transports: ["websocket", "polling"]' ---
      const newSocket = io(RENDER_API_URL, {
        query: { userId: user._id },
        transports: ["websocket", "polling"] 
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
  }, [user, socket]); // <-- FIX: Added 'user' and 'socket'

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
