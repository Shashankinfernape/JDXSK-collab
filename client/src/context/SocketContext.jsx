import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const useSocketHook = () => useContext(SocketContext);

// --- Revert to using Environment Variable ---
// Ensure REACT_APP_API_URL is correctly set in your Vercel/Render client environment
const SERVER_API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // Fallback for local

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let newSocket = null; // Declare here to access in cleanup

    if (user && SERVER_API_URL) { // Check if user and URL exist
      console.log(`Attempting to connect socket to: ${SERVER_API_URL}`);
      
      // --- Use Default Connection Settings Initially ---
      newSocket = io(SERVER_API_URL, {
        query: { userId: user._id },
        transports: ['websocket', 'polling'], // Allow standard transports
        // Remove aggressive retry limits for now
        // reconnectionAttempts: 3, 
        // reconnectionDelayMax: 5000 
      });
      // --- END FIX ---

      newSocket.on('connect', () => {
        console.log('Socket.IO connected:', newSocket.id);
      });

      // --- Add Error Listeners ---
      newSocket.on('connect_error', (err) => {
        console.error('Socket.IO Connection Error:', err.message, err.cause);
      });
      
      newSocket.on('disconnect', (reason) => {
        console.warn('Socket.IO disconnected:', reason);
      });
      // --- End Error Listeners ---

      setSocket(newSocket);

    } else {
      console.log("User not logged in or API URL missing, skipping socket connection.");
    }

    // Cleanup function: runs when user logs out or component unmounts
    return () => {
      if (newSocket) {
        console.log('Cleaning up socket connection...');
        newSocket.close(); // Ensure socket is closed
        setSocket(null); // Clear socket state
      }
    };
    // Ensure effect runs only when user or API URL changes significantly
  }, [user]); 

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = useSocketHook;

