import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, Image, Alert, Dimensions } from 'react-native';
import Layout from '@/components/Layout';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VirtualTour() {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showPanorama, setShowPanorama] = useState(false);
  const [panoramaLocation, setPanoramaLocation] = useState<any>(null);

  const locations = [
    {
      id: 1,
      name: 'Main Campus',
      category: 'Campus',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=2000&q=80',
      description: 'Explore our historic main campus with beautiful architecture and green spaces.',
      features: ['Library', 'Student Center', 'Administrative Offices'],
      color: '#0064A4'
    },
    {
      id: 2,
      name: 'Science Building',
      category: 'Academic',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=2000&q=80',
      description: 'State-of-the-art laboratories and research facilities for STEM students.',
      features: ['Research Labs', 'Computer Labs', 'Study Areas'],
      color: '#4facfe'
    },
    {
      id: 3,
      name: 'Library',
      category: 'Academic',
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=2000&q=80',
      description: 'Modern library with extensive collections and quiet study spaces.',
      features: ['Reading Rooms', 'Digital Resources', 'Group Study Rooms'],
      color: '#f093fb'
    },
    {
      id: 4,
      name: 'Lecture Hall',
      category: 'Academic',
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=2000&q=80',
      description: 'Modern lecture halls equipped with state-of-the-art audio-visual technology.',
      features: ['Tiered Seating', 'Smart Boards', 'Recording Capabilities'],
      color: '#fa709a'
    },
    {
      id: 5,
      name: 'Sports Complex',
      category: 'Recreation',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=2000&q=80',
      description: 'Full-service athletic facilities including gym, pool, and sports fields.',
      features: ['Fitness Center', 'Swimming Pool', 'Basketball Courts'],
      color: '#fee140'
    },
    {
      id: 6,
      name: 'Dining Hall',
      category: 'Dining',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=2000&q=80',
      description: 'Multiple dining options with diverse menu selections for all dietary needs.',
      features: ['Buffet Style', 'Grab & Go', 'Vegetarian Options'],
      color: '#30cfd0'
    },
    {
      id: 8,
      name: 'Student Union',
      category: 'Campus',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=2000&q=80',
      description: 'Hub for student activities, clubs, and social gatherings.',
      features: ['Meeting Rooms', 'Lounge Areas', 'Cafe'],
      color: '#0064A4'
    }
  ];

  const categories = ['All', 'Campus', 'Academic', 'Recreation', 'Dining'];

  const filteredLocations = activeCategory === 'All' 
    ? locations 
    : locations.filter(loc => loc.category === activeCategory);

  return (
    <Layout>
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Virtual Campus Tour</Text>
          <Text style={styles.heroSubtitle}>
            Explore our beautiful campus from anywhere in the world
          </Text>
        </View>

        <View style={styles.content}>
          {/* Intro Card */}
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>Welcome to Our Campus!</Text>
            <Text style={styles.introText}>
              Take a virtual journey through our campus and discover world-class facilities, 
              vibrant student life, and beautiful spaces designed for learning and growth. 
              Click on any location to learn more about what makes our campus special.
            </Text>
          </View>

          {/* Filter Categories */}
          <View style={styles.filterSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categories}
            >
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryBtn, activeCategory === category && styles.categoryBtnActive]}
                  onPress={() => setActiveCategory(category)}
                >
                  <Text style={[styles.categoryBtnText, activeCategory === category && styles.categoryBtnTextActive]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Locations Grid */}
          <View style={styles.locationsGrid}>
            {filteredLocations.map(location => (
              <TouchableOpacity
                key={location.id}
                style={[styles.locationCard, { borderLeftColor: location.color }]}
                onPress={() => setSelectedLocation(location)}
              >
                <Image 
                  source={{ uri: location.image }}
                  style={styles.locationImage}
                  resizeMode="cover"
                />
                <View style={styles.locationContent}>
                  <View style={[styles.categoryBadge, { backgroundColor: location.color }]}>
                    <Text style={styles.categoryBadgeText}>{location.category}</Text>
                  </View>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationDescription}>{location.description}</Text>
                  <View style={styles.features}>
                    {location.features.map((feature, index) => (
                      <View key={index} style={styles.feature}>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={[styles.viewBtn, { backgroundColor: location.color }]}>
                    <Text style={styles.viewBtnText}>View Details →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Call to Action */}
          <View style={styles.callToAction}>
            <View style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>Want to Visit in Person?</Text>
              <Text style={styles.ctaText}>
                Schedule a campus visit and experience our community firsthand. Our admissions team would love to show you around!
              </Text>
              <View style={styles.ctaButtons}>
                <TouchableOpacity style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Schedule a Visit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Contact Admissions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Location Detail Modal */}
      <Modal
        visible={!!selectedLocation}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedLocation(null)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setSelectedLocation(null)}
            >
              <Text style={styles.closeBtnText}>×</Text>
            </TouchableOpacity>
            
            <Image 
              source={{ uri: selectedLocation?.image }}
              style={styles.modalHeaderImage}
              resizeMode="cover"
            />
            <View style={styles.modalHeaderOverlay}>
              <Text style={styles.modalHeaderTitle}>{selectedLocation?.name}</Text>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescription}>{selectedLocation?.description}</Text>
              <Text style={styles.modalFeaturesTitle}>Key Features:</Text>
              <View style={styles.featuresList}>
                {selectedLocation?.features.map((feature: string, index: number) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureBullet}>•</Text>
                    <Text style={styles.featureItemText}>{feature}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity 
                style={[styles.tourBtn, { backgroundColor: selectedLocation?.color }]}
                onPress={() => {
                  console.log('Launch 360° Tour pressed');
                  console.log('Selected location:', selectedLocation?.name);
                  setPanoramaLocation(selectedLocation); // Save location for panorama
                  setShowPanorama(true);
                  setSelectedLocation(null); // Close detail modal
                  console.log('showPanorama set to true');
                }}
              >
                <Text style={styles.tourBtnText}>Launch 360° Tour</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Panorama Viewer Modal */}
      <Modal
        visible={showPanorama}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => {
          console.log('Panorama modal closing');
          setPanoramaLocation(null);
        }}
      >
        <View style={styles.panoramaContainer}>
          <TouchableOpacity 
            style={styles.panoramaCloseBtn}
            onPress={() => {
              console.log('Close button pressed');
              setShowPanorama(false);
              setPanoramaLocation(null);
            }}
          >
            <Text style={styles.panoramaCloseBtnText}>✕ Close</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: panoramaLocation?.panorama }}
            style={styles.panoramaImage}
            resizeMode="cover"
          />
          <View style={styles.panoramaInfo}>
            <Text style={styles.panoramaTitle}>{panoramaLocation?.name}</Text>
            <Text style={styles.panoramaHint}>Swipe to explore the 360° view</Text>
          </View>
        </View>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  hero: {
    backgroundColor: '#0064a4',
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.95,
  },
  content: {
    padding: 20,
  },
  introCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  introText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  filterSection: {
    marginBottom: 24,
  },
  categories: {
    flexDirection: 'row',
  },
  categoryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryBtnActive: {
    backgroundColor: '#0064a4',
    borderColor: '#0064a4',
  },
  categoryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  categoryBtnTextActive: {
    color: '#ffffff',
  },
  locationsGrid: {
    gap: 20,
  },
  locationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
  },
  locationImage: {
    width: '100%',
    height: 200,
  },
  locationContent: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  locationName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  locationDescription: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 16,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  feature: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  featureText: {
    fontSize: 13,
    color: '#666666',
  },
  viewBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  callToAction: {
    marginTop: 32,
    marginBottom: 20,
  },
  ctaCard: {
    backgroundColor: '#0064a4',
    padding: 28,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    opacity: 0.95,
  },
  ctaButtons: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#0064a4',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '600',
  },
  modalHeaderImage: {
    width: '100%',
    height: 200,
  },
  modalHeaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalFeaturesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 20,
    color: '#0064a4',
    marginRight: 8,
  },
  featureItemText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 24,
  },
  tourBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  tourBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  panoramaContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  panoramaCloseBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  panoramaCloseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  panoramaScrollView: {
    flex: 1,
  },
  panoramaScrollContent: {
    flexGrow: 1,
  },
  panoramaImage: {
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT,
  },
  panoramaInfo: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 12,
  },
  panoramaTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  panoramaHint: {
    color: '#ccc',
    fontSize: 14,
  },
});
