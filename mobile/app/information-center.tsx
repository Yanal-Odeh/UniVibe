import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Layout from '@/components/Layout';

export default function InformationCenter() {
  const infoCards = [
    {
      icon: '📚',
      title: 'Academic Resources',
      description: 'Access course materials, study guides, and academic calendars.',
      link: '#'
    },
    {
      icon: '🎓',
      title: 'Student Services',
      description: 'Find information about counseling, health services, and support.',
      link: '#'
    },
    {
      icon: '💼',
      title: 'Career Center',
      description: 'Explore internship opportunities and career guidance.',
      link: '#'
    },
    {
      icon: '🏫',
      title: 'Campus Life',
      description: 'Learn about clubs, events, and student organizations.',
      link: '#'
    },
    {
      icon: '📅',
      title: 'Important Dates',
      description: 'View academic calendar, registration deadlines, and events.',
      link: '#'
    },
    {
      icon: '📞',
      title: 'Contact Directory',
      description: 'Find contact information for departments and faculty.',
      link: '#'
    }
  ];

  const announcements = [
    {
      date: 'March 15, 2024',
      title: 'Spring Registration Opens',
      badge: 'Important'
    },
    {
      date: 'March 20, 2024',
      title: 'Campus Career Fair',
      badge: 'Event'
    },
    {
      date: 'March 25, 2024',
      title: 'New Library Hours',
      badge: 'Update'
    }
  ];

  const quickLinks = [
    { name: 'Forms & Applications', path: '/forms' },
    { name: 'Policies & Guidelines', path: '/policies' },
    { name: 'Virtual Tour', path: '/virtual-tour' },
    { name: 'Student Portal', path: '#' },
    { name: 'Library', path: '#' }
  ];

  return (
    <Layout>
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Information Center</Text>
          <Text style={styles.heroSubtitle}>
            Your central hub for all university information and resources
          </Text>
        </View>

        {/* Quick Access Cards */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.cardsGrid}>
            {infoCards.map((card, index) => (
              <TouchableOpacity key={index} style={styles.card}>
                <Text style={styles.cardIcon}>{card.icon}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
                <Text style={styles.cardLink}>Learn More →</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <View style={styles.helpCard}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpText}>
                Our support team is here to assist you with any questions.
              </Text>
              <TouchableOpacity style={styles.helpButton}>
                <Text style={styles.helpButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Announcements */}
          <View style={styles.announcementsCard}>
            <Text style={styles.announcementsTitle}>Recent Announcements</Text>
            <View style={styles.announcementsList}>
              {announcements.map((announcement, index) => (
                <View key={index} style={styles.announcement}>
                  <View style={[styles.announcementBadge, 
                    announcement.badge === 'Important' ? styles.badgeImportant :
                    announcement.badge === 'Event' ? styles.badgeEvent :
                    styles.badgeUpdate
                  ]}>
                    <Text style={styles.badgeText}>{announcement.badge}</Text>
                  </View>
                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <Text style={styles.announcementDate}>{announcement.date}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Links */}
          <View style={styles.quickLinksCard}>
            <Text style={styles.quickLinksTitle}>Quick Links</Text>
            <View style={styles.quickLinksList}>
              {quickLinks.map((link, index) => (
                <TouchableOpacity key={index} style={styles.quickLink}>
                  <Text style={styles.quickLinkText}>→ {link.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  hero: {
    backgroundColor: '#667eea',
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 20,
  },
  cardsGrid: {
    gap: 16,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardLink: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  helpSection: {
    marginBottom: 30,
  },
  helpCard: {
    backgroundColor: '#e8eaf6',
    padding: 28,
    borderRadius: 12,
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  helpButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  helpButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  announcementsCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  announcementsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  announcementsList: {
    gap: 16,
  },
  announcement: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  announcementBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeImportant: {
    backgroundColor: '#fee2e2',
  },
  badgeEvent: {
    backgroundColor: '#dbeafe',
  },
  badgeUpdate: {
    backgroundColor: '#e0e7ff',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333333',
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  announcementDate: {
    fontSize: 13,
    color: '#999999',
  },
  quickLinksCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickLinksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  quickLinksList: {
    gap: 12,
  },
  quickLink: {
    paddingVertical: 8,
  },
  quickLinkText: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '500',
  },
});
