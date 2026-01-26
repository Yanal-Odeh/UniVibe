import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Layout from '@/components/Layout';

export default function DinePlayShopScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Places', icon: '⭐' },
    { id: 'dining', name: 'Dining', icon: '🍽️' },
    { id: 'cafes', name: 'Cafés', icon: '☕' },
    { id: 'recreation', name: 'Recreation', icon: '🎮' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  ];

  const places = [
    {
      id: 1,
      name: 'Campus Dining Hall',
      category: 'dining',
      description: 'Full-service cafeteria with diverse meal options, salad bar, and daily specials.',
      type: 'Restaurant',
      price: '$$',
      hours: '7 AM - 9 PM',
      location: 'Student Center, 1st Floor',
      rating: 4.5,
      image: '🍽️',
      color: '#f59e0b',
      features: ['Buffet Style', 'Vegetarian Options', 'Halal Food']
    },
    {
      id: 2,
      name: 'Bean & Brew Café',
      category: 'cafes',
      description: 'Cozy coffee shop serving specialty coffee, pastries, and light snacks.',
      type: 'Café',
      price: '$',
      hours: '7 AM - 8 PM',
      location: 'Library Building',
      rating: 4.7,
      image: '☕',
      color: '#0064A4',
      features: ['Free WiFi', 'Study Space', 'Fresh Pastries']
    },
    {
      id: 3,
      name: 'Pizza Corner',
      category: 'dining',
      description: 'Quick-service pizzeria with made-to-order pizzas and Italian favorites.',
      type: 'Fast Food',
      price: '$',
      hours: '11 AM - 11 PM',
      location: 'Student Union',
      rating: 4.3,
      image: '🍕',
      color: '#ef4444',
      features: ['Delivery', 'Late Night', 'Custom Toppings']
    },
    {
      id: 4,
      name: 'Campus Recreation Center',
      category: 'recreation',
      description: 'State-of-the-art fitness center, basketball courts, and swimming pool.',
      type: 'Gym & Sports',
      price: 'Free',
      hours: '6 AM - 10 PM',
      location: 'Recreation Complex',
      rating: 4.8,
      image: '🏀',
      color: '#10b981',
      features: ['Gym', 'Pool', 'Courts', 'Classes']
    },
    {
      id: 5,
      name: 'University Bookstore',
      category: 'shopping',
      description: 'Complete bookstore with textbooks, supplies, apparel, and tech accessories.',
      type: 'Retail',
      price: '$$',
      hours: '8 AM - 6 PM',
      location: 'Main Campus Building',
      rating: 4.2,
      image: '📚',
      color: '#3b82f6',
      features: ['Textbooks', 'Merchandise', 'Electronics']
    },
    {
      id: 6,
      name: 'Smoothie Station',
      category: 'cafes',
      description: 'Fresh fruit smoothies, juices, and healthy snack options.',
      type: 'Juice Bar',
      price: '$',
      hours: '8 AM - 7 PM',
      location: 'Wellness Center',
      rating: 4.6,
      image: '🥤',
      color: '#ec4899',
      features: ['Fresh Juice', 'Protein Shakes', 'Healthy Snacks']
    },
    {
      id: 7,
      name: 'Game Room',
      category: 'recreation',
      description: 'Entertainment hub with pool tables, video games, and board games.',
      type: 'Gaming',
      price: 'Free',
      hours: '10 AM - Midnight',
      location: 'Student Center, Basement',
      rating: 4.4,
      image: '🎮',
      color: '#6366f1',
      features: ['Video Games', 'Pool Tables', 'Board Games']
    },
    {
      id: 8,
      name: 'Sandwich Shop',
      category: 'dining',
      description: 'Made-to-order sandwiches, wraps, and fresh salads.',
      type: 'Deli',
      price: '$',
      hours: '9 AM - 8 PM',
      location: 'Engineering Building',
      rating: 4.5,
      image: '🥪',
      color: '#f97316',
      features: ['Custom Orders', 'Grab & Go', 'Fresh Daily']
    },
    {
      id: 9,
      name: 'Ice Cream Parlor',
      category: 'cafes',
      description: 'Artisan ice cream with rotating flavors and toppings bar.',
      type: 'Dessert Shop',
      price: '$',
      hours: '11 AM - 10 PM',
      location: 'Student Plaza',
      rating: 4.9,
      image: '🍦',
      color: '#14b8a6',
      features: ['Premium Ice Cream', 'Vegan Options', 'Custom Sundaes']
    },
    {
      id: 10,
      name: 'Campus Convenience Store',
      category: 'shopping',
      description: 'Quick stop for snacks, drinks, toiletries, and essentials.',
      type: 'Convenience',
      price: '$',
      hours: '24/7',
      location: 'Residence Hall Complex',
      rating: 4.1,
      image: '🏪',
      color: '#84cc16',
      features: ['Open 24/7', 'Snacks', 'Essentials']
    },
    {
      id: 11,
      name: 'Outdoor Courtyard',
      category: 'recreation',
      description: 'Beautiful outdoor space with seating, games, and relaxation areas.',
      type: 'Outdoor Area',
      price: 'Free',
      hours: '24/7',
      location: 'Central Campus',
      rating: 4.7,
      image: '🌳',
      color: '#059669',
      features: ['Outdoor Seating', 'Green Space', 'Events']
    },
    {
      id: 12,
      name: 'Tech Shop',
      category: 'shopping',
      description: 'Electronics, accessories, and tech support services.',
      type: 'Electronics',
      price: '$$$',
      hours: '9 AM - 6 PM',
      location: 'IT Building',
      rating: 4.3,
      image: '💻',
      color: '#6366f1',
      features: ['Laptops', 'Accessories', 'Repairs']
    }
  ];

  const highlights = [
    {
      icon: '🍽️',
      title: 'Diverse Dining',
      description: 'Multiple restaurants and cafés with international cuisines'
    },
    {
      icon: '🎮',
      title: 'Fun & Recreation',
      description: 'Sports facilities, game rooms, and entertainment areas'
    },
    {
      icon: '🛍️',
      title: 'Convenient Shopping',
      description: 'Bookstores, convenience stores, and specialty shops'
    },
    {
      icon: '🕐',
      title: 'Flexible Hours',
      description: 'Many venues open late and some available 24/7'
    }
  ];

  const tips = [
    {
      number: '1',
      title: 'Meal Plans',
      text: 'Check out meal plan options for convenient and affordable dining.'
    },
    {
      number: '2',
      title: 'Student Discounts',
      text: 'Show your student ID for special discounts at most venues.'
    },
    {
      number: '3',
      title: 'Peak Hours',
      text: 'Visit during off-peak hours to avoid crowds and long waits.'
    },
    {
      number: '4',
      title: 'Campus Events',
      text: 'Many venues host special events and promotions throughout the year.'
    }
  ];

  const filteredPlaces = places.filter(place => {
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          place.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            <Text style={styles.highlight}>Dine</Text>, Play & <Text style={styles.highlight}>Shop</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Everything you need for campus life - from delicious meals to entertainment and essentials
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for dining, recreation, or shopping..."
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

        {/* Highlights Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campus Amenities</Text>
          <View style={styles.highlightsGrid}>
            {highlights.map((highlight, index) => (
              <View key={index} style={styles.highlightCard}>
                <View style={styles.highlightIconContainer}>
                  <Text style={styles.highlightIcon}>{highlight.icon}</Text>
                </View>
                <Text style={styles.highlightTitle}>{highlight.title}</Text>
                <Text style={styles.highlightDescription}>{highlight.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Places Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Explore Campus Venues <Text style={styles.resultCount}>({filteredPlaces.length})</Text>
          </Text>
          <View style={styles.placesGrid}>
            {filteredPlaces.map((place) => (
              <View key={place.id} style={styles.placeCard}>
                <View style={[styles.placeHeader, { backgroundColor: place.color }]}>
                  <Text style={styles.placeEmoji}>{place.image}</Text>
                  <View style={styles.placeRating}>
                    <Text style={styles.starIcon}>⭐</Text>
                    <Text style={styles.ratingText}>{place.rating}</Text>
                  </View>
                </View>
                <View style={styles.placeBody}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.placeTop}>
                      <Text style={styles.placeName}>{place.name}</Text>
                      <View style={styles.placeType}>
                        <Text style={styles.placeTypeText}>{place.type}</Text>
                      </View>
                    </View>
                    <Text style={styles.placeDescription}>{place.description}</Text>
                    
                    <View style={styles.placeDetails}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailIcon}>🕐</Text>
                        <Text style={styles.detailText}>{place.hours}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailIcon}>📍</Text>
                        <Text style={styles.detailText}>{place.location}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailIcon}>💰</Text>
                        <Text style={styles.detailText}>{place.price}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.features}>
                    {place.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureTag}>
                        <Text style={styles.featureText}>{feature}</Text>
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
          <Text style={styles.sectionTitle}>Campus Life Tips</Text>
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
    color: '#1f2937',
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

  // Highlights Grid
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  highlightCard: {
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
  highlightIconContainer: {
    backgroundColor: '#0064a4',
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  highlightIcon: {
    fontSize: 28,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  highlightDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Places Grid
  placesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  placeCard: {
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
  placeHeader: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  placeEmoji: {
    fontSize: 48,
  },
  placeRating: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
  },
  starIcon: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f59e0b',
  },
  placeBody: {
    padding: 16,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  placeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 6,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  placeType: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
  },
  placeTypeText: {
    color: '#92400e',
    fontSize:5,
    fontWeight: '600',
  },
  placeDescription: {
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 14,
    fontSize: 13,
  },
  placeDetails: {
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
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    minHeight: 60,
  },
  featureTag: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fed7aa',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  featureText: {
    color: '#9a3412',
    fontSize: 11,
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
    backgroundColor: '#f0f9ff',
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
});
