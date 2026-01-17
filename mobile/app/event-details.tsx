import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import EventMediaGallery from '@/components/EventMediaGallery';

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { currentUser, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getEvent(id as any);
      setEvent(data.event || data);
    } catch (err) {
      console.error('Failed to fetch event:', err);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated || !currentUser) {
      Alert.alert('Error', 'Please sign in to register for events');
      return;
    }

    try {
      await api.registerForEvent(event.id, currentUser.id);
      Alert.alert('Success', 'Successfully registered for event!');
      fetchEventDetails();
    } catch (err: any) {
      console.error('Failed to register:', err);
      Alert.alert('Error', err.message || 'Failed to register for event');
    }
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Event not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  const eventDate = new Date(event.startDate);
  const eventEndDate = event.endDate ? new Date(event.endDate) : null;
  const registrationCount = event._count?.registrations || 0;
  const isEventFull = event.capacity && registrationCount >= event.capacity;
  const spotsLeft = event.capacity ? event.capacity - registrationCount : null;

  return (
    <Layout>
      <ScrollView style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        {/* Event Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          {event.category && (
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
          )}
        </View>

        {/* Event Details Card */}
        <View style={styles.card}>
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Description</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Date & Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Date & Time</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start:</Text>
              <Text style={styles.detailValue}>
                {eventDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>
                {eventDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {eventEndDate && ` - ${eventEndDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}`}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Location</Text>
            <Text style={styles.detailValue}>
              {event.location?.name || event.location || 'TBA'}
            </Text>
          </View>

          {/* Capacity */}
          {event.capacity && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👥 Capacity</Text>
              <View style={styles.capacityInfo}>
                <Text style={styles.detailValue}>
                  {registrationCount} / {event.capacity} registered
                </Text>
                {spotsLeft !== null && (
                  <Text style={[
                    styles.spotsLeft,
                    spotsLeft === 0 ? styles.spotsLeftFull : spotsLeft < 10 ? styles.spotsLeftLow : {}
                  ]}>
                    {spotsLeft === 0 ? 'Event Full' : `${spotsLeft} spots left`}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Community */}
          {event.community && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏛️ Organized by</Text>
              <View style={[styles.communityBadge, { backgroundColor: event.community.color || '#3b82f6' }]}>
                <Text style={styles.communityEmoji}>{event.community.avatar}</Text>
                <Text style={styles.communityName}>{event.community.name}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Register Button */}
        {isAuthenticated && new Date(event.startDate) >= new Date() && !isEventFull && (
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Register for Event</Text>
          </TouchableOpacity>
        )}

        {isEventFull && (
          <View style={styles.fullBanner}>
            <Text style={styles.fullBannerText}>⚠️ This event is full</Text>
          </View>
        )}

        {/* Event Media Gallery */}
        <View style={{ margin: 16, marginTop: 0 }}>
          <EventMediaGallery
            eventId={id as string}
            isClubLeader={currentUser && event.community?.clubLeaderId === currentUser.id}
          />
        </View>
      </ScrollView>
    </Layout>
  );
}

function getCategoryColor(category: string) {
  const colors: any = {
    'Technology': '#4f46e5',
    'Cultural': '#ec4899',
    'Educational': '#10b981',
    'Career': '#f59e0b',
    'Sports': '#ef4444',
    'General': '#6b7280'
  };
  return colors[category] || '#6b7280';
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
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 20,
  },
  backBtn: {
    padding: 16,
  },
  backBtnText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: '#6b7280',
    width: 80,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  capacityInfo: {
    gap: 8,
  },
  spotsLeft: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  spotsLeftLow: {
    color: '#f59e0b',
  },
  spotsLeftFull: {
    color: '#ef4444',
  },
  communityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  communityEmoji: {
    fontSize: 20,
  },
  communityName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  registerButton: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  fullBanner: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  fullBannerText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
