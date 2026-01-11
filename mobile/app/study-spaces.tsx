import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { router } from 'expo-router';

export default function StudySpacesScreen() {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [studySpaces, setStudySpaces] = useState<any[]>([]);
  const [userReservations, setUserReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-CA'));

  const categories = [
    { id: 'all', name: 'All Spaces', icon: '📚' },
    { id: 'quiet', name: 'Quiet Zones', icon: '📚' },
    { id: 'collaborative', name: 'Collaborative', icon: '👥' },
    { id: 'cafe', name: 'Café Style', icon: '☕' },
  ];

  // Check for date change every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const newDate = new Date().toLocaleDateString('en-CA');
      if (newDate !== currentDate) {
        setCurrentDate(newDate);
        fetchStudySpaces();
        if (currentUser) {
          fetchUserReservations();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentDate, currentUser]);

  useEffect(() => {
    fetchStudySpaces();
    if (currentUser) {
      fetchUserReservations();
    }
  }, [currentUser]);

  const fetchStudySpaces = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const data = await api.getStudySpaces(today);
      setStudySpaces(data);
    } catch (error: any) {
      console.error('Error fetching study spaces:', error);
      Alert.alert('Error', 'Failed to load study spaces');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReservations = async () => {
    try {
      if (!currentUser) return; // Skip if not logged in
      const data = await api.getMyReservations('ACTIVE');
      setUserReservations(data);
    } catch (error: any) {
      // Silently fail if user is not authenticated or token expired
      console.error('Error fetching reservations:', error);
      setUserReservations([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStudySpaces(),
      currentUser ? fetchUserReservations() : Promise.resolve()
    ]);
    setRefreshing(false);
  };

  const hasUserReserved = (spaceId: string) => {
    if (!userReservations || userReservations.length === 0) return false;
    
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');
    
    return userReservations.some(res => {
      const resDate = new Date(res.date);
      const resDateStr = resDate.toLocaleDateString('en-CA');
      return res.spaceId === spaceId && resDateStr === todayStr && res.status === 'ACTIVE';
    });
  };

  const openReservationModal = (space: any) => {
    if (!currentUser) {
      Alert.alert('Sign In Required', 'Please sign in to reserve a study space', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/sign-in') }
      ]);
      return;
    }
    
    if (hasUserReserved(space.id)) {
      Alert.alert('Already Reserved', 'You already have a reservation for this space today');
      return;
    }
    
    setSelectedSpace(space);
    setShowReservationModal(true);
  };

  const closeReservationModal = () => {
    setShowReservationModal(false);
    setSelectedSpace(null);
  };

  const handleReservation = async () => {
    if (!selectedSpace) return;

    setReserving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.createReservation(selectedSpace.id, today);
      
      Alert.alert('Success', `Successfully reserved ${selectedSpace.name} for today!`);
      
      await Promise.all([
        fetchStudySpaces(),
        fetchUserReservations()
      ]);
      
      closeReservationModal();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create reservation');
    } finally {
      setReserving(false);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return '#10b981';
      case 'Busy': return '#f59e0b';
      case 'Full': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getAvailabilityBgColor = (availability: string) => {
    switch (availability) {
      case 'Available': return '#d1fae5';
      case 'Busy': return '#fed7aa';
      case 'Full': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  const features = [
    {
      icon: '📶',
      title: 'High-Speed WiFi',
      description: 'Free, secure internet access in all study areas'
    },
    {
      icon: '🕐',
      title: 'Flexible Hours',
      description: 'Many spaces open 24/7 during exam periods'
    },
    {
      icon: '👥',
      title: 'Various Environments',
      description: 'Quiet zones to collaborative spaces'
    },
    {
      icon: '☕',
      title: 'Nearby Amenities',
      description: 'Access to cafés and refreshment areas'
    }
  ];

  const tips = [
    {
      number: '1',
      title: 'Arrive Early',
      text: 'Popular spaces fill up quickly, especially during exams.'
    },
    {
      number: '2',
      title: 'Book Ahead',
      text: 'Reserve study pods and rooms in advance when possible.'
    },
    {
      number: '3',
      title: 'Respect Others',
      text: 'Keep noise levels appropriate for the space type.'
    },
    {
      number: '4',
      title: 'Stay Hydrated',
      text: 'Bring water and take regular breaks for better focus.'
    }
  ];

  const filteredSpaces = studySpaces.filter(space => {
    const matchesCategory = selectedCategory === 'all' || space.category === selectedCategory;
    const matchesSearch = space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          space.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Find Your Perfect <Text style={styles.highlight}>Study Space</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Discover quiet zones, collaborative areas, and comfortable spots across campus
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search study spaces..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          <View style={styles.categories}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryBtn, selectedCategory === category.id && styles.categoryBtnActive]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Study On Campus?</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Study Spaces Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Available Study Spaces {!loading && <Text style={styles.resultCount}>({filteredSpaces.length})</Text>}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text style={styles.loadingText}>Loading study spaces...</Text>
            </View>
          ) : (
            <View style={styles.spacesGrid}>
              {filteredSpaces.map((space) => {
                const isReserved = hasUserReserved(space.id);
                const isFull = space.availability === 'Full';
                const canReserve = !isReserved && !isFull;
                
                return (
                  <View key={space.id} style={styles.spaceCard}>
                    <View style={[styles.spaceHeader, { backgroundColor: space.color }]}>
                      <Text style={styles.spaceEmoji}>{space.image}</Text>
                      <View style={[
                        styles.availabilityBadge,
                        { 
                          backgroundColor: getAvailabilityBgColor(space.availability),
                        }
                      ]}>
                        <Text style={[styles.availabilityText, { color: getAvailabilityColor(space.availability) }]}>
                          {space.availability}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.spaceBody}>
                      <View>
                        <Text style={styles.spaceName}>{space.name}</Text>
                        <Text style={styles.spaceDescription}>{space.description}</Text>
                        
                        <View style={styles.spaceDetails}>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailIcon}>👥</Text>
                            <Text style={styles.detailText}>{space.availableSeats} / {space.capacity} available</Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailIcon}>🕐</Text>
                            <Text style={styles.detailText}>{space.hours}</Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailIcon}>📍</Text>
                            <Text style={styles.detailText}>{space.location}</Text>
                          </View>
                        </View>

                        <View style={styles.amenities}>
                          {space.amenities?.map((amenity: string, idx: number) => (
                            <View key={idx} style={styles.amenityTag}>
                              <Text style={styles.amenityText}>{amenity}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.reserveBtn,
                          !canReserve && styles.reserveBtnDisabled,
                          isReserved && styles.reserveBtnReserved
                        ]}
                        onPress={() => canReserve && openReservationModal(space)}
                        disabled={!canReserve}
                      >
                        <Text style={[
                          styles.reserveBtnText,
                          !canReserve && styles.reserveBtnTextDisabled
                        ]}>
                          {isFull ? '❌ Space Full' : isReserved ? '✓ Already Reserved' : '📅 Reserve Space'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Study Tips</Text>
          <View style={styles.tipsGrid}>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>{tip.number}</Text>
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Reservation Modal */}
      <Modal
        visible={showReservationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeReservationModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reserve Study Space</Text>
              <TouchableOpacity onPress={closeReservationModal}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedSpace && (
              <View>
                <View style={styles.modalSpaceInfo}>
                  <Text style={styles.modalSpaceEmoji}>{selectedSpace.image}</Text>
                  <View style={styles.modalSpaceDetails}>
                    <Text style={styles.modalSpaceName}>{selectedSpace.name}</Text>
                    <Text style={styles.modalSpaceLocation}>{selectedSpace.location}</Text>
                    <Text style={styles.modalSpaceAvailability}>
                      {selectedSpace.availableSeats} seats available today
                    </Text>
                  </View>
                </View>

                <View style={styles.modalDateInfo}>
                  <Text style={styles.modalDateIcon}>📅</Text>
                  <View>
                    <Text style={styles.modalDateLabel}>Reservation Date:</Text>
                    <Text style={styles.modalDateValue}>
                      Today ({new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })})
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalInfoText}>
                  This reservation is valid for the entire day and will automatically reset tomorrow.
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={closeReservationModal}
                    disabled={reserving}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalConfirmBtn, reserving && styles.modalConfirmBtnDisabled]}
                    onPress={handleReservation}
                    disabled={reserving}
                  >
                    <Text style={styles.modalConfirmText}>
                      {reserving ? 'Reserving...' : 'Confirm Reservation'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Hero Section
  hero: {
    backgroundColor: '#0064a4',
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 38,
  },
  highlight: {
    color: '#ffffff',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.95,
  },

  // Search Section
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },

  // Categories
  categoriesContainer: {
    marginBottom: 24,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  categoryBtnActive: {
    backgroundColor: '#0064a4',
    borderColor: '#0064a4',
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#ffffff',
  },

  // Section
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultCount: {
    color: '#6b7280',
    fontSize: 20,
    fontWeight: '400',
  },

  // Features Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  featureIconContainer: {
    backgroundColor: '#e0e7ff',
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Spaces Grid
  spacesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  spaceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    width: '48%',
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  spaceHeader: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  spaceEmoji: {
    fontSize: 48,
  },
  availabilityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  availableBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  busyBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  spaceBody: {
    padding: 16,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  spaceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  spaceDescription: {
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 14,
    fontSize: 13,
  },
  spaceDetails: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailIcon: {
    fontSize: 14,
  },
  detailText: {
    color: '#6b7280',
    fontSize: 12,
    flex: 1,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e0e7ff',
    borderRadius: 6,
  },
  amenityText: {
    color: '#4f46e5',
    fontSize: 12,
    fontWeight: '600',
  },

  // Tips Section
  tipsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tipsGrid: {
    gap: 16,
  },
  tipCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#faf5ff',
    borderRadius: 12,
  },
  tipNumber: {
    width: 50,
    height: 50,
    backgroundColor: '#0064a4',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tipNumberText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  tipText: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Loading
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 14,
  },

  // Reserve Button
  reserveBtn: {
    marginTop: 16,
    backgroundColor: '#0064a4',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  reserveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  reserveBtnDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  reserveBtnTextDisabled: {
    color: '#ffffff',
  },
  reserveBtnReserved: {
    backgroundColor: '#10b981',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  modalClose: {
    fontSize: 28,
    color: '#6b7280',
    fontWeight: '300',
  },
  modalSpaceInfo: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fbfaf9ff',
    borderRadius: 12,
    marginBottom: 20,
  },
  modalSpaceEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  modalSpaceDetails: {
    flex: 1,
  },
  modalSpaceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  modalSpaceLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  modalSpaceAvailability: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  modalDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    marginBottom: 16,
  },
  modalDateIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  modalDateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  modalDateValue: {
    fontSize: 13,
    color: '#6b7280',
  },
  modalInfoText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#0064a4',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalConfirmBtnDisabled: {
    backgroundColor: '#af9d9cff',
    opacity: 0.6,
  },
});
