import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection - dynamically detect server URL
      const getSocketUrl = () => {
        if (process.env.REACT_APP_SERVER_URL) {
          return process.env.REACT_APP_SERVER_URL;
        }
        
        const hostname = window.location.hostname;
        
        // If accessing from localhost, use localhost for socket
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'http://localhost:5002';
        }
        
        // For network access, use the same hostname with port 5002
        return `http://${hostname}:5002`;
      };
      
      const serverUrl = getSocketUrl();
      const newSocket = io(serverUrl, {
        transports: ['websocket'],
        upgrade: true,
        rememberUpgrade: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);
        
        // Join user-specific room for notifications
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      // Listen for notifications
      newSocket.on('notification', (notification) => {
        console.log('New notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
      });

      // Listen for messages
      newSocket.on('receive_message', (message) => {
        console.log('🔔 Socket.io message received:', message);
        console.log('🔔 Dispatching newMessage event with detail:', message);
        // Emit custom event for components to listen to
        window.dispatchEvent(new CustomEvent('newMessage', { detail: message }));
      });

      // Listen for message errors
      newSocket.on('message_error', (error) => {
        console.error('Message error:', error);
        // Emit custom event for components to handle errors
        window.dispatchEvent(new CustomEvent('messageError', { detail: error }));
      });

      // Listen for exchange status changes
      newSocket.on('status_changed', (data) => {
        console.log('Exchange status changed:', data);
        window.dispatchEvent(new CustomEvent('exchangeStatusChanged', { detail: data }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    } else {
      // Clean up socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  const joinExchange = (exchangeId) => {
    if (socket && connected) {
      socket.emit('join_exchange', exchangeId);
    }
  };

  const leaveExchange = (exchangeId) => {
    if (socket && connected) {
      socket.emit('leave_exchange', exchangeId);
    }
  };

  const sendMessage = (messageData) => {
    if (socket && connected) {
      socket.emit('send_message', messageData);
    }
  };

  const updateExchangeStatus = (exchangeId, status) => {
    if (socket && connected) {
      socket.emit('status_update', { exchangeId, status });
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    connected,
    notifications,
    joinExchange,
    leaveExchange,
    sendMessage,
    updateExchangeStatus,
    markNotificationAsRead,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};






