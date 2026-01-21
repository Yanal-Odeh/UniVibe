import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  read: boolean;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { userId, userName } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<any>(null);

  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    initializeChat();
    return () => {
      // Cleanup socket on unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeChat = async () => {
    try {
      // Get current user ID and token
      const token = await AsyncStorage.getItem('authToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setCurrentUserId(userData.id);
      }

      // Get or create conversation
      const response = await fetch(
        `http://192.168.1.8:5000/api/chat/conversations/${userId}`,
        { credentials: 'include' }
      );
      const conversation = await response.json();
      setConversationId(conversation.id);

      // Fetch messages
      await fetchMessages(conversation.id);

      // Setup Socket.IO
      if (token) {
        setupSocket(token, conversation.id);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = (token: string, convId: string) => {
    const socket = io('http://192.168.1.8:5000', {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('Connected to chat server');
      socket.emit('join_conversation', convId);
    });

    socket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      // Mark as read if we're viewing this conversation
      socket.emit('mark_read', { conversationId: convId });
    });

    socket.on('user_typing', () => {
      // Show typing indicator (implement if needed)
    });

    socket.on('user_stopped_typing', () => {
      // Hide typing indicator
    });

    socketRef.current = socket;
  };

  const fetchMessages = async (convId: string) => {
    try {
      const response = await fetch(
        `http://192.168.1.8:5000/api/chat/conversations/${convId}/messages`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !conversationId || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      conversationId,
      content: messageInput.trim(),
      receiverId: userId,
    });

    setMessageInput('');
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isOwnMessage ? colors.tint : colors.icon + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isOwnMessage ? 'white' : colors.text },
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.icon },
            ]}
          >
            {formatMessageTime(item.createdAt)}
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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.icon + '30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.tint} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{userName}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

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
          disabled={!messageInput.trim()}
        >
          <IconSymbol name="arrow.up" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 32,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '75%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
