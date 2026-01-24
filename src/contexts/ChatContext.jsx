import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAdminAuth } from './AdminAuthContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { isAuthenticated, currentAdmin } = useAdminAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  // Fetch unread count from API
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/chat/unread-count', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);

  // Setup socket connection for real-time updates
  useEffect(() => {
    if (!isAuthenticated || !currentAdmin) {
      setUnreadCount(0);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchUnreadCount();

    // Setup socket for real-time updates
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Chat context socket connected');
    });

    socket.on('new_message', (message) => {
      // Only increment if the message is not from us
      if (message.senderId !== currentAdmin?.id) {
        setUnreadCount(prev => prev + 1);
      }
    });

    socket.on('message_read', () => {
      // Refresh count when messages are read
      fetchUnreadCount();
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, currentAdmin, fetchUnreadCount]);

  const markAsRead = useCallback(() => {
    // This will be called when user opens messages page
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const value = {
    unreadCount,
    fetchUnreadCount,
    markAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
