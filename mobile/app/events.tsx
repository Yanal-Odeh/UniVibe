import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Layout from '@/components/Layout';

export default function EventsScreen() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuth();
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'registered' | 'saved'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
    if (isAuthenticated) {
      fetchUserEvents();
    }
  }, [isAuthenticated]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      const eventsList = data.events || data || [];
      
      // Filter only approved events
      const approvedEvents = eventsList.filter((e: any) => e.status === 'APPROVED');
      setAllEvents(approvedEvents);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async () => {
    if (!currentUser) return;
    
    try {
      // Fetch registered events
      const registrations = await api.getMyRegistrations('CONFIRMED');
      const regList = Array.isArray(registrations) ? registrations : (registrations.registrations || []);
      setRegisteredEvents(regList.map((r: any) => r.event).filter((e: any) => e));
      
      // TODO: Fetch saved events when API is available
      setSavedEvents([]);
    } catch (err) {
      console.error('Failed to fetch user events:', err);
      setRegisteredEvents([]);
      setSavedEvents([]);
    }
  };

  const getFilteredEvents = () => {
    const now = new Date();
    let filtered = [];

    switch (activeTab) {
      case 'upcoming':
        filtered = allEvents.filter((e: any) => new Date(e.startDate) >= now);
        break;
      case 'past':
        filtered = allEvents.filter((e: any) => new Date(e.startDate) < now);
        break;
      case 'registered':
        filtered = registeredEvents;
        break;
      case 'saved':
        filtered = savedEvents;
        break;
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((e: any) => 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.community?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getUpcomingCount = () => {
    const now = new Date();
    return allEvents.filter((e: any) => new Date(e.startDate) >= now).length;
  };

  const getPastCount = () => {
    const now = new Date();
    return allEvents.filter((e: any) => new Date(e.startDate) < now).length;
  };

  const filteredEvents = getFilteredEvents();

  if (loading) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0064A4" />
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events by title, location, or community..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'upcoming' && styles.filterTabActive]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={styles.filterIcon}>📅</Text>
            <Text style={[styles.filterTabText, activeTab === 'upcoming' && styles.filterTabTextActive]}>
              Upcoming Events
            </Text>
            <View style={[styles.badge, activeTab === 'upcoming' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'upcoming' && styles.badgeTextActive]}>
                {getUpcomingCount()}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'past' && styles.filterTabActive]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={styles.filterIcon}>📅</Text>
            <Text style={[styles.filterTabText, activeTab === 'past' && styles.filterTabTextActive]}>
              Past Events
            </Text>
            <View style={[styles.badge, activeTab === 'past' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'past' && styles.badgeTextActive]}>
                {getPastCount()}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'registered' && styles.filterTabActive]}
            onPress={() => setActiveTab('registered')}
          >
            <Text style={styles.filterIcon}>✓</Text>
            <Text style={[styles.filterTabText, activeTab === 'registered' && styles.filterTabTextActive]}>
              My Registrations
            </Text>
            <View style={[styles.badge, activeTab === 'registered' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'registered' && styles.badgeTextActive]}>
                {registeredEvents.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'saved' && styles.filterTabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Text style={styles.filterIcon}>🔖</Text>
            <Text style={[styles.filterTabText, activeTab === 'saved' && styles.filterTabTextActive]}>
              Saved Events
            </Text>
            <View style={[styles.badge, activeTab === 'saved' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'saved' && styles.badgeTextActive]}>
                {savedEvents.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No events found</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'upcoming' && 'Check back later for upcoming events'}
              {activeTab === 'past' && 'No past events to display'}
              {activeTab === 'registered' && 'You haven\'t registered for any events yet'}
              {activeTab === 'saved' && 'You haven\'t saved any events yet'}
            </Text>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {filteredEvents.map((event) => (
              <TouchableOpacity 
                key={event.id} 
                style={styles.eventCard}
                onPress={() => router.push(`/event-details?id=${event.id}`)}
              >
                <Text style={styles.eventTitle}>{event.title}</Text>
                
                <View style={styles.eventInfo}>
                  <Text style={styles.eventDate}>
                    {formatDate(event.startDate)} at {formatTime(event.startDate)}
                  </Text>
                  
                  <Text style={styles.eventLocation}>
                    {event.location}
                  </Text>
                  
                  {event.community && (
                    <View style={styles.communityRow}>
                      <Text style={styles.communityIcon}>🌐</Text>
                      <Text style={styles.communityText}>{event.community.name}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
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
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  filterTabs: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterTabActive: {
    backgroundColor: '#0064A4',
    borderColor: '#0064A4',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  filterTabText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  badge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: '#818cf8',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
  },
  badgeTextActive: {
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  eventsList: {
    padding: 16,
    gap: 16,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  eventInfo: {
    gap: 8,
  },
  eventDate: {
    fontSize: 15,
    color: '#4b5563',
    fontWeight: '500',
  },
  eventLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  communityIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  communityText: {
    fontSize: 14,
    color: '#0064A4',
    fontWeight: '500',
  },
});

