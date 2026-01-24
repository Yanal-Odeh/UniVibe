import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useChat } from '../../contexts/ChatContext';
import Loader from '../../Components/Loader/Loader';
import './Messages.css';

export default function Messages() {
  const { currentAdmin } = useAdminAuth();
  const { markAsRead } = useChat();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [usersByRole, setUsersByRole] = useState({});
  const [showBrowse, setShowBrowse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const currentUserRef = useRef(null);

  useEffect(() => {
    if (currentAdmin) {
      setCurrentUser(currentAdmin);
      currentUserRef.current = currentAdmin;
    }
  }, [currentAdmin]);

  useEffect(() => {
    if (!currentUser) return;
    
    fetchConversations();
    fetchUsersByRole();
    setupSocket();
    
    // Mark messages as read when component mounts
    markAsRead();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser, markAsRead]);

  useEffect(() => {
    // Search is disabled in browse mode
    setSearchResults([]);
  }, [searchQuery, showBrowse]);

  useEffect(() => {
    // Only scroll if messages were added (not replaced)
    if (messages.length > 0) {
      const timer = setTimeout(() => scrollToBottom(), 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const setupSocket = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found for socket connection');
      return;
    }

    const socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Chat connected');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Chat connection error:', error.message);
    });

    socket.on('new_message', (message) => {
      // Only add messages from other users (not our own)
      if (message.senderId === currentUserRef.current?.id) {
        // This is our own message confirmed by server
        // Replace optimistic message with real one
        setMessages((prev) => {
          const withoutTemp = prev.filter(m => !m.id.toString().startsWith('temp-'));
          return [...withoutTemp, message];
        });
      } else {
        // Message from other user - add it
        setMessages((prev) => [...prev, message]);
        
        // Mark as read if we're viewing this conversation
        if (message.conversationId === selectedConversation?.id) {
          socket.emit('mark_read', { conversationId: message.conversationId });
        }
      }
      
      // Update conversations list
      fetchConversations();
    });

    socket.on('message_notification', () => {
      fetchConversations();
    });

    socketRef.current = socket;
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/conversations', {
        credentials: 'include',
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByRole = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/users/browse', {
        credentials: 'include',
      });
      const data = await response.json();
      setUsersByRole(data);
    } catch (error) {
      console.error('Error fetching users by role:', error);
    }
  };

  const searchUsers = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/chat/users/search?query=${encodeURIComponent(searchQuery)}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const openConversation = async (userId, userName) => {
    try {
      // Immediately show selected user
      const tempConversation = {
        otherUserId: userId,
        otherUser: { 
          id: userId, 
          firstName: userName.split(' ')[0], 
          lastName: userName.split(' ')[1] || '' 
        },
      };
      setSelectedConversation(tempConversation);
      setMessages([]);
      setSearchQuery('');
      setShowBrowse(false);
      setMessagesLoading(true);
      
      // Create or fetch conversation first
      const response = await fetch(
        `http://localhost:5000/api/chat/conversations/${userId}`,
        { credentials: 'include' }
      );
      const conversation = await response.json();
      
      // Update with full conversation data
      const fullConversation = {
        ...tempConversation,
        id: conversation.id,
        createdAt: conversation.createdAt,
      };
      setSelectedConversation(fullConversation);

      if (socketRef.current && conversation.id) {
        socketRef.current.emit('join_conversation', conversation.id);
        socketRef.current.emit('mark_read', { conversationId: conversation.id });
      }

      // Fetch existing messages
      if (conversation.id) {
        await fetchMessages(conversation.id);
      }
      
      setMessagesLoading(false);
      
      // Update conversations list in background
      fetchConversations();
    } catch (error) {
      console.error('Error opening conversation:', error);
      setMessagesLoading(false);
    }
  };

  const selectConversation = async (conv) => {
    setSelectedConversation(conv);
    setMessages([]);
    setMessagesLoading(true);
    
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', conv.id);
      // Mark messages as read when opening conversation
      socketRef.current.emit('mark_read', { conversationId: conv.id });
    }

    await fetchMessages(conv.id);
    setMessagesLoading(false);
    
    // Update conversations list to clear unread count
    fetchConversations();
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/chat/conversations/${conversationId}/messages`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    const currentConv = selectedConversation;
    const messageContent = messageInput.trim();
    
    if (!messageContent || !currentConv || !socketRef.current || !currentConv.id || messagesLoading) {
      return;
    }

    // Clear input immediately
    setMessageInput('');
    
    // Send message directly (conversation already exists)
    sendMessageWithConversation(currentConv.id, messageContent);
  };
  
  const sendMessageWithConversation = (conversationId, messageContent) => {
    if (!socketRef.current || !conversationId) {
      return;
    }
    
    // Create optimistic message with unique ID
    const optimisticMessage = {
      id: 'temp-' + Date.now() + '-' + Math.random(),
      content: messageContent,
      senderId: currentUser?.id,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUser?.id,
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || '',
      },
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    // Send via socket
    socketRef.current.emit('send_message', {
      conversationId: conversationId,
      content: messageContent,
      receiverId: selectedConversation.otherUser.id,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="messages-page">
        <div className="loading-container">
          <Loader text="Loading messages..." />
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      {/* Sidebar with conversations list */}
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <button 
            className="browse-button"
            onClick={() => setShowBrowse(!showBrowse)}
          >
            {showBrowse ? '💬 Chats' : '👥 Browse'}
          </button>
        </div>

        {!showBrowse && (
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <div className="conversations-list">
          {showBrowse ? (
            // Browse users by role
              <div className="browse-users">
                {Object.entries(usersByRole).map(([role, users]) => (
                  users.length > 0 && (
                    <div key={role} className="role-section">
                      <div className="role-header">{role}</div>
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="conversation-item"
                          onClick={() => {
                            setShowBrowse(false);
                            openConversation(user.id, `${user.firstName} ${user.lastName}`);
                          }}
                        >
                          <div className="conversation-avatar">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div className="conversation-content">
                            <div className="conversation-name">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="conversation-email">{user.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ))}
              </div>
            ) : conversations.length > 0 ? (
              conversations.filter(conv => {
                if (!searchQuery) return true;
                const fullName = `${conv.otherUser.firstName} ${conv.otherUser.lastName}`.toLowerCase();
                const query = searchQuery.toLowerCase();
                return fullName.includes(query);
              }).length > 0 ? (
                conversations.filter(conv => {
                  if (!searchQuery) return true;
                  const fullName = `${conv.otherUser.firstName} ${conv.otherUser.lastName}`.toLowerCase();
                  const query = searchQuery.toLowerCase();
                  return fullName.includes(query);
                }).map((conv) => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                    onClick={() => selectConversation(conv)}
                  >
                    <div className="conversation-avatar">
                      {conv.otherUser.firstName[0]}{conv.otherUser.lastName[0]}
                    </div>
                    <div className="conversation-content">
                      <div className="conversation-header">
                        <div className="conversation-name">
                          {conv.otherUser.firstName} {conv.otherUser.lastName}
                        </div>
                        {conv.lastMessage && (
                          <div className="conversation-time">
                            {formatTime(conv.lastMessageAt)}
                          </div>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <div className="conversation-preview">
                          <div className={`last-message ${conv.unreadCount > 0 ? 'unread' : ''}`}>
                            {conv.lastMessage.content}
                          </div>
                          {conv.unreadCount > 0 && (
                            <div className="unread-badge">{conv.unreadCount}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <div>No conversations found</div>
                  <div className="empty-subtext">Try a different search</div>
                </div>
              )
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <div>No messages yet</div>
                <div className="empty-subtext">Search for someone to start chatting</div>
              </div>
            )
          }
        </div>
      </div>

      {/* Chat area */}
      <div className="chat-area">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar">
                  {selectedConversation.otherUser.firstName[0]}
                  {selectedConversation.otherUser.lastName[0]}
                </div>
                <div className="chat-user-name">
                  {selectedConversation.otherUser.firstName}{' '}
                  {selectedConversation.otherUser.lastName}
                </div>
              </div>
            </div>

            <div className="messages-container" ref={messagesContainerRef}>
              {messagesLoading ? (
                <div className="loading-messages">
                  <Loader text="Loading conversation..." />
                </div>
              ) : messages.length === 0 ? (
                <div className="empty-messages">
                  <div className="empty-icon">💬</div>
                  <p>No messages yet</p>
                  <p className="empty-subtext">Start the conversation!</p>
                </div>
              ) : (
                Array.isArray(messages) && messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.senderId === currentUser?.id ? 'own' : 'other'}`}
                  >
                    <div className="message-bubble">
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">{formatTime(message.createdAt)}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <textarea
                className="message-input"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
              />
              <button
                className="send-button"
                onClick={sendMessage}
                disabled={!messageInput.trim() || messagesLoading}
              >
                <span className="send-icon">↑</span>
              </button>
            </div>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="no-conversation-icon">💬</div>
            <div className="no-conversation-text">Select a conversation to start messaging</div>
          </div>
        )}
      </div>
    </div>
  );
}
