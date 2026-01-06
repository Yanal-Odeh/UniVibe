import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Layout from '@/components/Layout';

export default function EventsScreen() {
  const { currentUser, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents({ upcoming: filter === 'upcoming' ? 'true' : undefined });
      const eventsList = data.events || data || [];
      
      // Filter and sort events
      let filteredEvents = eventsList.filter((e: any) => e.status === 'APPROVED');
      
      if (filter === 'past') {
        filteredEvents = filteredEvents.filter((e: any) => new Date(e.startDate) < new Date());
      } else if (filter === 'upcoming') {
        filteredEvents = filteredEvents.filter((e: any) => new Date(e.startDate) >= new Date());
      }
      
      setEvents(filteredEvents);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: number) => {
    if (!isAuthenticated || !currentUser) {
      Alert.alert('Error', 'Please sign in to register for events');
      return;
    }

    try {
      await api.registerForEvent(eventId, currentUser.id);
      Alert.alert('Success', 'Successfully registered for event!');
      fetchEvents();
    } catch (err: any) {
      console.error('Failed to register:', err);
      Alert.alert('Error', err.message || 'Failed to register for event');
    }
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Campus Events</Text>
          <Text style={styles.subtitle}>
            Discover and join exciting events and activities
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'upcoming' && styles.filterTabActive]}
            onPress={() => {
              setFilter('upcoming');
              fetchEvents();
            }}
          >
            <Text style={[styles.filterTabText, filter === 'upcoming' && styles.filterTabTextActive]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => {
              setFilter('all');
              fetchEvents();
            }}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              All Events
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'past' && styles.filterTabActive]}
            onPress={() => {
              setFilter('past');
              fetchEvents();
            }}
          >
            <Text style={[styles.filterTabText, filter === 'past' && styles.filterTabTextActive]}>
              Past
            </Text>
          </TouchableOpacity>
        </View>

        {/* Events List */}
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No events available</Text>
            <Text style={styles.emptySubtext}>Check back later for upcoming events</Text>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {events.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                {event.community && (
                  <View style={[styles.communityBadge, { backgroundColor: event.community.color || '#667eea' }]}>
                    <Text style={styles.communityEmoji}>{event.community.avatar}</Text>
                    <Text style={styles.communityName}>{event.community.name}</Text>
                  </View>
                )}
                
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDescription}>{event.description}</Text>
                
                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📅</Text>
                    <Text style={styles.detailText}>
                      {new Date(event.startDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🕐</Text>
                    <Text style={styles.detailText}>
                      {new Date(event.startDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{event.location}</Text>
                  </View>
                  
                  {event.capacity && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>👥</Text>
                      <Text style={styles.detailText}>
                        {event._count?.registrations || 0}/{event.capacity}
                      </Text>
                    </View>
                  )}
                </View>

                {isAuthenticated && new Date(event.startDate) >= new Date() && (
                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => handleRegister(event.id)}
                  >
                    <Text style={styles.registerButtonText}>Register</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#667eea',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  eventsList: {
    padding: 16,
    gap: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  communityEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  communityName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 24,
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563',
  },
  registerButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

