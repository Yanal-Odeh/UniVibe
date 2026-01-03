import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Linking } from 'react-native';
import Layout from '@/components/Layout';

export default function ServicesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Services', icon: '📖' },
    { id: 'academic', name: 'Academic', icon: '🎓' },
    { id: 'student-support', name: 'Student Support', icon: '❤️' },
    { id: 'campus', name: 'Campus Life', icon: '👥' },
    { id: 'career', name: 'Career', icon: '💼' },
  ];

  const services = [
    {
      id: 1,
      name: 'Academic Advising',
      category: 'academic',
      description: 'Professional guidance for course selection, degree planning, and academic success.',
      icon: '🎓',
      color: '#4f46e5',
      contact: 'advising@university.edu',
      phone: '(555) 123-4567',
      location: 'Academic Affairs Building, Room 201',
      hours: 'Mon-Fri: 8 AM - 5 PM',
      features: ['Degree Planning', 'Course Selection', 'Academic Progress Review']
    },
    {
      id: 2,
      name: 'Counseling Services',
      category: 'student-support',
      description: 'Confidential mental health support and wellness counseling for students.',
      icon: '❤️',
      color: '#ec4899',
      contact: 'counseling@university.edu',
      phone: '(555) 234-5678',
      location: 'Student Health Center, 2nd Floor',
      hours: 'Mon-Fri: 9 AM - 6 PM',
      features: ['Individual Counseling', 'Group Therapy', 'Crisis Support']
    },
    {
      id: 3,
      name: 'Career Services',
      category: 'career',
      description: 'Career counseling, resume building, interview prep, and job placement assistance.',
      icon: '💼',
      color: '#10b981',
      contact: 'careers@university.edu',
      phone: '(555) 345-6789',
      location: 'Career Center, Main Campus',
      hours: 'Mon-Fri: 9 AM - 5 PM',
      features: ['Resume Review', 'Mock Interviews', 'Job Portal Access']
    },
    {
      id: 4,
      name: 'IT Support',
      category: 'campus',
      description: 'Technical support for campus technology, software, and network issues.',
      icon: '💻',
      color: '#3b82f6',
      contact: 'itsupport@university.edu',
      phone: '(555) 456-7890',
      location: 'IT Services Building',
      hours: 'Mon-Fri: 8 AM - 8 PM',
      features: ['Software Support', 'Network Help', 'Device Troubleshooting']
    },
    {
      id: 5,
      name: 'Library Services',
      category: 'academic',
      description: 'Access to extensive collections, research assistance, and study resources.',
      icon: '📖',
      color: '#8b5cf6',
      contact: 'library@university.edu',
      phone: '(555) 567-8901',
      location: 'Main Library',
      hours: '24/7 (Staffed: 8 AM - 10 PM)',
      features: ['Book Loans', 'Research Help', 'Digital Resources']
    },
    {
      id: 6,
      name: 'Student Housing',
      category: 'campus',
      description: 'On-campus housing options and residential life support services.',
      icon: '🏠',
      color: '#f59e0b',
      contact: 'housing@university.edu',
      phone: '(555) 678-9012',
      location: 'Housing Office, Student Center',
      hours: 'Mon-Fri: 8 AM - 5 PM',
      features: ['Dorm Assignment', 'Maintenance Requests', 'Community Programs']
    },
    {
      id: 7,
      name: 'Transportation Services',
      category: 'campus',
      description: 'Campus shuttle services, parking permits, and transportation assistance.',
      icon: '🚌',
      color: '#14b8a6',
      contact: 'transport@university.edu',
      phone: '(555) 789-0123',
      location: 'Transportation Office',
      hours: 'Mon-Fri: 7 AM - 7 PM',
      features: ['Shuttle Routes', 'Parking Permits', 'Bike Rentals']
    },
    {
      id: 8,
      name: 'International Student Services',
      category: 'student-support',
      description: 'Support for international students including visa assistance and cultural programs.',
      icon: '🌍',
      color: '#6366f1',
      contact: 'international@university.edu',
      phone: '(555) 890-1234',
      location: 'International Center',
      hours: 'Mon-Fri: 9 AM - 5 PM',
      features: ['Visa Support', 'Cultural Events', 'Language Help']
    },
    {
      id: 9,
      name: 'Financial Aid Office',
      category: 'student-support',
      description: 'Assistance with scholarships, grants, loans, and financial planning.',
      icon: '📄',
      color: '#ef4444',
      contact: 'finaid@university.edu',
      phone: '(555) 901-2345',
      location: 'Financial Aid Office, Admin Building',
      hours: 'Mon-Fri: 8:30 AM - 4:30 PM',
      features: ['Scholarship Info', 'FAFSA Help', 'Payment Plans']
    },
    {
      id: 10,
      name: 'Disability Services',
      category: 'student-support',
      description: 'Accommodations and support services for students with disabilities.',
      icon: '🛡️',
      color: '#a855f7',
      contact: 'disability@university.edu',
      phone: '(555) 012-3456',
      location: 'Accessibility Services Center',
      hours: 'Mon-Fri: 8 AM - 5 PM',
      features: ['Accommodations', 'Assistive Technology', 'Advocacy']
    },
    {
      id: 11,
      name: 'Tutoring Center',
      category: 'academic',
      description: 'Free peer tutoring and academic support in various subjects.',
      icon: '👥',
      color: '#0ea5e9',
      contact: 'tutoring@university.edu',
      phone: '(555) 123-9876',
      location: 'Learning Commons, Library',
      hours: 'Mon-Thu: 10 AM - 9 PM, Fri: 10 AM - 5 PM',
      features: ['Subject Tutoring', 'Writing Help', 'Study Groups']
    },
    {
      id: 12,
      name: 'Wellness & Recreation',
      category: 'campus',
      description: 'Fitness facilities, wellness programs, and recreational activities.',
      icon: '📈',
      color: '#84cc16',
      contact: 'wellness@university.edu',
      phone: '(555) 234-8765',
      location: 'Recreation Center',
      hours: 'Mon-Fri: 6 AM - 11 PM, Sat-Sun: 8 AM - 10 PM',
      features: ['Gym Access', 'Fitness Classes', 'Wellness Programs']
    }
  ];

  const quickAccess = [
    {
      icon: '☎️',
      title: 'Emergency Line',
      description: 'Campus Security',
      value: '(555) 911-HELP'
    },
    {
      icon: '🎧',
      title: 'IT Help Desk',
      description: 'Technical Support',
      value: '(555) 456-7890'
    },
    {
      icon: '❤️',
      title: 'Crisis Support',
      description: '24/7 Counseling',
      value: '(555) 234-5678'
    },
    {
      icon: '✉️',
      title: 'General Inquiries',
      description: 'Main Office',
      value: 'info@university.edu'
    }
  ];

  const resources = [
    {
      number: '1',
      title: 'Student Portal',
      text: 'Access grades, schedules, and academic records online.'
    },
    {
      number: '2',
      title: 'Campus Map',
      text: 'Interactive map to help you navigate campus buildings.'
    },
    {
      number: '3',
      title: 'Service Requests',
      text: 'Submit maintenance and service requests online.'
    },
    {
      number: '4',
      title: 'FAQs',
      text: 'Find answers to commonly asked questions.'
    }
  ];

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContact = (value: string) => {
    if (value.includes('@')) {
      Linking.openURL(`mailto:${value}`);
    } else {
      Linking.openURL(`tel:${value}`);
    }
  };

  return (
    <Layout>
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Campus <Text style={styles.highlight}>Services</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Comprehensive support services designed to enhance your university experience
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for services..."
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

        {/* Quick Access Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            {quickAccess.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickAccessCard}
                onPress={() => handleContact(item.value)}
              >
                <View style={styles.quickAccessIcon}>
                  <Text style={styles.quickAccessIconText}>{item.icon}</Text>
                </View>
                <View style={styles.quickAccessInfo}>
                  <Text style={styles.quickAccessTitle}>{item.title}</Text>
                  <Text style={styles.quickAccessDescription}>{item.description}</Text>
                  <Text style={styles.quickAccessValue}>{item.value}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Services Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Available Services <Text style={styles.resultCount}>({filteredServices.length})</Text>
          </Text>
          <View style={styles.servicesGrid}>
            {filteredServices.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={[styles.serviceHeader, { backgroundColor: service.color }]}>
                  <Text style={styles.serviceIcon}>{service.icon}</Text>
                </View>
                <View style={styles.serviceBody}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                  
                  <View style={styles.serviceDetails}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailIcon}>🕐</Text>
                      <Text style={styles.detailText}>{service.hours}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailIcon}>📍</Text>
                      <Text style={styles.detailText}>{service.location}</Text>
                    </View>
                    <TouchableOpacity style={styles.detailItem} onPress={() => handleContact(service.contact)}>
                      <Text style={styles.detailIcon}>✉️</Text>
                      <Text style={styles.detailTextLink}>{service.contact}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.detailItem} onPress={() => handleContact(service.phone)}>
                      <Text style={styles.detailIcon}>☎️</Text>
                      <Text style={styles.detailTextLink}>{service.phone}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.features}>
                    <Text style={styles.featuresTitle}>Key Features:</Text>
                    <View style={styles.featuresList}>
                      {service.features.map((feature, idx) => (
                        <View key={idx} style={styles.featureItem}>
                          <Text style={styles.featureCheck}>✓</Text>
                          <Text style={styles.featureItemText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Resources Section */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          <View style={styles.resourcesGrid}>
            {resources.map((resource, index) => (
              <View key={index} style={styles.resourceCard}>
                <View style={styles.resourceNumber}>
                  <Text style={styles.resourceNumberText}>{resource.number}</Text>
                </View>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceText}>{resource.text}</Text>
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
    backgroundColor: '#4facfe',
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
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
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

  // Quick Access
  quickAccessGrid: {
    gap: 16,
  },
  quickAccessCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  quickAccessIcon: {
    backgroundColor: '#dbeafe',
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccessIconText: {
    fontSize: 24,
  },
  quickAccessInfo: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  quickAccessDescription: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 6,
  },
  quickAccessValue: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
  },

  // Services Grid
  servicesGrid: {
    gap: 20,
  },
  serviceCard: {
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
  serviceHeader: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIcon: {
    fontSize: 64,
  },
  serviceBody: {
    padding: 20,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  serviceDescription: {
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 20,
    fontSize: 14,
  },
  serviceDetails: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  detailTextLink: {
    color: '#3b82f6',
    fontSize: 14,
    flex: 1,
  },
  features: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  featuresTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureCheck: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 14,
  },
  featureItemText: {
    color: '#6b7280',
    fontSize: 13,
    flex: 1,
  },

  // Resources Section
  resourcesSection: {
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
  resourcesGrid: {
    gap: 16,
  },
  resourceCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
  },
  resourceNumber: {
    width: 50,
    height: 50,
    backgroundColor: '#3b82f6',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  resourceNumberText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  resourceText: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
