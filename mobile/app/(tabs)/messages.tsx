import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Conversation = {
  id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
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
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://192.168.1.8:5000/api/chat/conversations', {
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

  const searchUsers = async () => {
    setSearching(true);
    try {
      const response = await fetch(
        `http://192.168.1.8:5000/api/chat/users/search?query=${encodeURIComponent(searchQuery)}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const openConversation = (userId: string, userName: string) => {
    router.push({
      pathname: '/chat',
      params: { userId, userName },
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
      style={[styles.conversationItem, { backgroundColor: colors.background }]}
      onPress={() => openConversation(item.otherUser.id, `${item.otherUser.firstName} ${item.otherUser.lastName}`)}
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

  const renderUserResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { backgroundColor: colors.background }]}
      onPress={() => {
        setSearchQuery('');
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.icon + '30' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.icon + '20' }]}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for users..."
          placeholderTextColor={colors.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searching && <ActivityIndicator size="small" color={colors.tint} />}
      </View>

      {/* List */}
      {searchQuery.length >= 2 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderUserResult}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                No users found
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol name="bubble.left.and.bubble.right" size={64} color={colors.icon} />
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                No messages yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.icon }]}>
                Search for someone to start chatting
              </Text>
            </View>
          }
        />
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});
