import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const { width } = Dimensions.get('window');

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: User;
};

type Conversation = {
  id: string;
  otherUser: User;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
};

export default function MessagesScreen() {
  const colorScheme = useColorScheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersByRole, setUsersByRole] = useState<Record<string, User[]>>({});
  const [showBrowse, setShowBrowse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<any>(null);

  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    initializeChat();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeChat = async () => {
    try {
      // Get current user
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setCurrentUser(userData);
      }

      // Fetch conversations and users
      await fetchConversations();
      await fetchUsersByRole();

      // Setup Socket.IO
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setupSocket(token);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = (token: string) => {
    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Chat connected');
    });

    socket.on('connect_error', (error: any) => {
      console.error('❌ Chat connection error:', error.message);
    });

    socket.on('new_message', (message: Message) => {
      // Only add messages from other users (our own messages are added optimistically)
      if (message.senderId !== currentUser?.id) {
        // Message from other user
        setMessages((prev) => [...prev, message]);
        
        // Mark as read if viewing this conversation
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
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchUsersByRole = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/chat/users/browse`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUsersByRole(data);
    } catch (error) {
      console.error('Error fetching users by role:', error);
    }
  };

  const openConversation = async (userId: string, userName: string) => {
    try {
      // Immediately show selected user
      const [firstName, lastName] = userName.split(' ');
      const tempConversation: any = {
        otherUserId: userId,
        otherUser: { 
          id: userId, 
          firstName: firstName || '', 
          lastName: lastName || '' 
        },
      };
      setSelectedConversation(tempConversation);
      setMessages([]);
      setShowBrowse(false);
      setMessagesLoading(true);
      
      // Create or fetch conversation
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
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
      
      // Update conversations list
      fetchConversations();
    } catch (error) {
      console.error('Error opening conversation:', error);
      setMessagesLoading(false);
    }
  };

  const selectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    setMessages([]);
    setMessagesLoading(true);
    
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', conv.id);
      socketRef.current.emit('mark_read', { conversationId: conv.id });
    }

    await fetchMessages(conv.id);
    setMessagesLoading(false);
    
    // Update conversations list to clear unread count
    fetchConversations();
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = () => {
    const messageContent = messageInput.trim();
    
    if (!messageContent || !selectedConversation || !socketRef.current || !selectedConversation.id || messagesLoading) {
      return;
    }

    // Clear input immediately
    setMessageInput('');
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: 'temp-' + Date.now() + '-' + Math.random(),
      content: messageContent,
      senderId: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUser?.id || '',
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || '',
        email: currentUser?.email || '',
      },
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    // Send via socket
    socketRef.current.emit('send_message', {
      conversationId: selectedConversation.id,
      content: messageContent,
      receiverId: selectedConversation.otherUser.id,
    });
  };

  const formatTime = (dateString: string) => {
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

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem, 
        { backgroundColor: selectedConversation?.id === item.id ? colors.tint + '20' : colors.background }
      ]}
      onPress={() => selectConversation(item)}
    >
      <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
        <Text style={styles.avatarText}>
          {item.otherUser.firstName[0]}{item.otherUser.lastName[0]}
        </Text>
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {item.otherUser.firstName} {item.otherUser.lastName}
          </Text>
          {item.lastMessage && (
            <Text style={[styles.time, { color: colors.icon }]}>
              {formatTime(item.lastMessageAt)}
            </Text>
          )}
        </View>
        
        {item.lastMessage && (
          <View style={styles.lastMessageRow}>
            <Text
              style={[
                styles.lastMessage,
                { color: colors.icon },
                item.unreadCount > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.content}
            </Text>
            {item.unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderUserResult = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { backgroundColor: colors.background }]}
      onPress={() => {
        openConversation(item.id, `${item.firstName} ${item.lastName}`);
      }}
    >
      <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
        <Text style={styles.avatarText}>
          {item.firstName[0]}{item.lastName[0]}
        </Text>
      </View>
      
      <View style={styles.conversationContent}>
        <Text style={[styles.userName, { color: colors.text }]}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={[styles.email, { color: colors.icon }]}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === currentUser?.id;
    
    return (
      <View
        style={[
          styles.messageContainer,
          isOwn ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isOwn ? colors.tint : colors.icon + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isOwn ? 'white' : colors.text },
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              { color: isOwn ? 'rgba(255,255,255,0.7)' : colors.icon },
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const fullName = `${conv.otherUser.firstName} ${conv.otherUser.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Conversations List */}
      {!selectedConversation && (
      <View style={[styles.sidebar, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.sidebarHeader, { borderBottomColor: colors.icon + '30' }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: showBrowse ? colors.tint : colors.icon + '20' }]}
            onPress={() => setShowBrowse(!showBrowse)}
          >
            <IconSymbol name={showBrowse ? "bubble.left.and.bubble.right" : "person.2.fill"} size={16} color={showBrowse ? "white" : colors.text} />
            <Text style={[styles.browseButtonText, { color: showBrowse ? "white" : colors.text }]}>
              {showBrowse ? 'Chats' : 'Browse'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar (only in chats mode) */}
        {!showBrowse && (
          <View style={[styles.searchContainer, { backgroundColor: colors.icon + '20' }]}>
            <IconSymbol name="magnifyingglass" size={18} color={colors.icon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search conversations..."
              placeholderTextColor={colors.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}

        {/* List */}
        <FlatList
          data={showBrowse ? [] : filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          ListHeaderComponent={
            showBrowse ? (
              <View>
                {Object.entries(usersByRole).map(([role, users]) => (
                  users.length > 0 && (
                    <View key={role}>
                      <Text style={[styles.roleHeader, { color: colors.icon }]}>{role}</Text>
                      {users.map((user) => (
                        <View key={user.id}>
                          {renderUserResult({ item: user })}
                        </View>
                      ))}
                    </View>
                  )
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            !showBrowse ? (
              <View style={styles.emptyContainer}>
                <IconSymbol name="bubble.left.and.bubble.right" size={64} color={colors.icon} />
                <Text style={[styles.emptyText, { color: colors.icon }]}>
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.icon }]}>
                  {searchQuery ? 'Try a different search' : 'Browse users to start chatting'}
                </Text>
              </View>
            ) : null
          }
        />
      </View>
      )}

      {/* Chat Area */}
      {selectedConversation && (
          <KeyboardAvoidingView
            style={styles.chatContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            {/* Chat Header */}
            <View style={[styles.chatHeader, { backgroundColor: colors.background, borderBottomColor: colors.icon + '30' }]}>
              <TouchableOpacity onPress={() => setSelectedConversation(null)} style={styles.backButton}>
                <IconSymbol name="chevron.left" size={24} color={colors.tint} />
              </TouchableOpacity>
              <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                <Text style={styles.avatarText}>
                  {selectedConversation.otherUser.firstName[0]}{selectedConversation.otherUser.lastName[0]}
                </Text>
              </View>
              <Text style={[styles.chatUserName, { color: colors.text }]}>
                {selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}
              </Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Messages */}
            {messagesLoading ? (
              <View style={[styles.centered, { flex: 1 }]}>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={[styles.loadingText, { color: colors.icon }]}>Loading conversation...</Text>
              </View>
            ) : messages.length === 0 ? (
              <View style={[styles.centered, { flex: 1 }]}>
                <IconSymbol name="bubble.left.and.bubble.right" size={64} color={colors.icon} />
                <Text style={[styles.emptyText, { color: colors.icon }]}>No messages yet</Text>
                <Text style={[styles.emptySubtext, { color: colors.icon }]}>Start the conversation!</Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                onLayout={() => flatListRef.current?.scrollToEnd()}
              />
            )}

            {/* Input */}
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.icon + '30' }]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.icon + '20',
                    color: colors.text,
                  },
                ]}
                placeholder="Type a message..."
                placeholderTextColor={colors.icon}
                value={messageInput}
                onChangeText={setMessageInput}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: messageInput.trim() ? colors.tint : colors.icon + '30',
                  },
                ]}
                onPress={sendMessage}
                disabled={!messageInput.trim() || messagesLoading}
              >
                <IconSymbol name="arrow.up" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebar: {
    flex: 1,
  },
  sidebarHeader: {
    paddingTop: 60,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  browseButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    fontSize: 11,
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 13,
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginLeft: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 12,
  },
  roleHeader: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    paddingTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 6,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 4,
  },
  headerSpacer: {
    width: 32,
  },
  chatUserName: {
    fontSize: 16,
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 10,
    maxWidth: '75%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 3,
  },
  messageTime: {
    fontSize: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});
