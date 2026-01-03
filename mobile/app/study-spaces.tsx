import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Layout from '@/components/Layout';

export default function StudySpacesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Spaces', icon: '📚' },
    { id: 'quiet', name: 'Quiet Zones', icon: '📚' },
    { id: 'collaborative', name: 'Collaborative', icon: '👥' },
    { id: 'cafe', name: 'Café Style', icon: '☕' },
  ];

  const studySpaces = [
    {
      id: 1,
      name: 'Main Library - Level 3',
      category: 'quiet',
      description: 'Silent study area with individual desks and excellent lighting.',
      capacity: '120 seats',
      amenities: ['Wifi', 'Power Outlets', 'Silent Zone'],
      hours: '24/7',
      location: 'Main Library, 3rd Floor',
      availability: 'Available',
      image: '📚',
      color: '#4f46e5'
    },
    {
      id: 2,
      name: 'Collaborative Learning Center',
      category: 'collaborative',
      description: 'Open space perfect for group projects and discussions.',
      capacity: '80 seats',
      amenities: ['Wifi', 'Whiteboards', 'Group Tables', 'Projectors'],
      hours: '8 AM - 10 PM',
      location: 'Student Center, 2nd Floor',
      availability: 'Available',
      image: '👥',
      color: '#10b981'
    },
    {
      id: 3,
      name: 'Science Library Reading Room',
      category: 'quiet',
      description: 'Dedicated quiet space for focused individual study.',
      capacity: '60 seats',
      amenities: ['Wifi', 'Power Outlets', 'Natural Light'],
      hours: '7 AM - Midnight',
      location: 'Science Building, 1st Floor',
      availability: 'Available',
      image: '🔬',
      color: '#3b82f6'
    },
    {
      id: 4,
      name: 'Campus Café Study Area',
      category: 'cafe',
      description: 'Casual study space with coffee and light background music.',
      capacity: '40 seats',
      amenities: ['Wifi', 'Coffee', 'Snacks', 'Comfortable Seating'],
      hours: '7 AM - 8 PM',
      location: 'Student Union Building',
      availability: 'Busy',
      image: '☕',
      color: '#f59e0b'
    },
    {
      id: 5,
      name: 'Engineering Study Pods',
      category: 'collaborative',
      description: 'Private study rooms for small groups with tech equipment.',
      capacity: '6-8 per pod',
      amenities: ['Wifi', 'Smart TV', 'Whiteboards', 'Bookable'],
      hours: '8 AM - 10 PM',
      location: 'Engineering Building, Ground Floor',
      availability: 'Available',
      image: '🔧',
      color: '#8b5cf6'
    },
    {
      id: 6,
      name: 'Garden Study Terrace',
      category: 'quiet',
      description: 'Outdoor study space with natural ambiance and fresh air.',
      capacity: '30 seats',
      amenities: ['Wifi', 'Shade', 'Natural Setting'],
      hours: '8 AM - 6 PM',
      location: 'Behind Main Library',
      availability: 'Available',
      image: '🌿',
      color: '#059669'
    },
    {
      id: 7,
      name: 'Digital Learning Lab',
      category: 'collaborative',
      description: 'Tech-enabled space with computers and multimedia resources.',
      capacity: '50 seats',
      amenities: ['Wifi', 'Computers', 'Printers', 'Scanners'],
      hours: '8 AM - 9 PM',
      location: 'Library, Basement',
      availability: 'Available',
      image: '💻',
      color: '#6366f1'
    },
    {
      id: 8,
      name: 'Cozy Corner Lounge',
      category: 'cafe',
      description: 'Comfortable seating area for relaxed studying and reading.',
      capacity: '25 seats',
      amenities: ['Wifi', 'Soft Seating', 'Coffee Table', 'Warm Lighting'],
      hours: '9 AM - 9 PM',
      location: 'Arts Building, 2nd Floor',
      availability: 'Available',
      image: '🛋️',
      color: '#ec4899'
    }
  ];

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
      <ScrollView style={styles.container}>
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
            Available Study Spaces <Text style={styles.resultCount}>({filteredSpaces.length})</Text>
          </Text>
          <View style={styles.spacesGrid}>
            {filteredSpaces.map((space) => (
              <View key={space.id} style={styles.spaceCard}>
                <View style={[styles.spaceHeader, { backgroundColor: space.color }]}>
                  <Text style={styles.spaceEmoji}>{space.image}</Text>
                  <View style={[styles.availabilityBadge, space.availability === 'Available' ? styles.availableBadge : styles.busyBadge]}>
                    <Text style={styles.availabilityText}>{space.availability}</Text>
                  </View>
                </View>
                <View style={styles.spaceBody}>
                  <Text style={styles.spaceName}>{space.name}</Text>
                  <Text style={styles.spaceDescription}>{space.description}</Text>
                  
                  <View style={styles.spaceDetails}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailIcon}>👥</Text>
                      <Text style={styles.detailText}>{space.capacity}</Text>
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
                    {space.amenities.map((amenity, idx) => (
                      <View key={idx} style={styles.amenityTag}>
                        <Text style={styles.amenityText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
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
    backgroundColor: '#667eea',
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
    color: '#fbbf24',
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
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
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
    gap: 20,
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
  },
  spaceHeader: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
  },
  spaceEmoji: {
    fontSize: 64,
  },
  availabilityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
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
    padding: 20,
  },
  spaceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  spaceDescription: {
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 16,
    fontSize: 14,
  },
  spaceDetails: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailText: {
    color: '#6b7280',
    fontSize: 14,
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
    backgroundColor: '#4f46e5',
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
});
