import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || window.location.origin;

    const s = io(backendUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    s.on('connect', () => {
      console.log(
        '[Socket.IO Frontend] Connected to backend signaling server:',
        s.id
      );
      setConnected(true);
    });

    s.on('disconnect', () => {
      console.log('[Socket.IO Frontend] Disconnected');
      setConnected(false);
    });

    s.on('connect_error', (error) => {
      console.error(
        '[Socket.IO Frontend] Connection error:',
        error.message
      );
      setConnected(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
