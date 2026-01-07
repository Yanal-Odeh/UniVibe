import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <View style={styles.footer}>
      {/* Footer Content */}
      <View style={styles.footerContent}>
        {/* Quick Contact */}
        <View style={styles.quickContact}>
          <Text style={styles.brandName}>UniVibe</Text>
          <Text style={styles.tagline}>Student Center & Event Services</Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>📍 Student Center Building</Text>
            <Text style={styles.contactText}>📞 (555) 123-4567</Text>
            <Text style={styles.contactText}>✉️ contact@univibe.edu</Text>
          </View>
          
          {/* Social Icons */}
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialIcon}>
              <Text style={styles.socialIconText}>f</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Text style={styles.socialIconText}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Collapsible Sections */}
        <View style={styles.collapsibleSections}>
          {/* Information */}
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('information')}
          >
            <Text style={styles.sectionTitle}>Information</Text>
            <Text style={styles.expandIcon}>{expandedSection === 'information' ? '−' : '+'}</Text>
          </TouchableOpacity>
          {expandedSection === 'information' && (
            <View style={styles.sectionContent}>
              <TouchableOpacity style={styles.linkItem}>
                <Text style={styles.linkText}>Information Center</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <Text style={styles.linkText}>Forms and Applications</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <Text style={styles.linkText}>Policies and Guidelines</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <Text style={styles.linkText}>Virtual Tour</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Events */}
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('events')}
          >
            <Text style={styles.sectionTitle}>Events</Text>
            <Text style={styles.expandIcon}>{expandedSection === 'events' ? '−' : '+'}</Text>
          </TouchableOpacity>
          {expandedSection === 'events' && (
            <View style={styles.sectionContent}>
              <TouchableOpacity style={styles.linkItem}>
                <Text style={styles.linkText}>Plan In-Person Events</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <Text style={styles.linkText}>Virtual Meetings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <Text style={styles.linkText}>Event Calendar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Services */}
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('services')}
          >
            <Text style={styles.sectionTitle}>Services</Text>
            <Text style={styles.expandIcon}>{expandedSection === 'services' ? '−' : '+'}</Text>
          </TouchableOpacity>
          {expandedSection === 'services' && (
            <View style={styles.sectionContent}>
              <TouchableOpacity style={styles.linkItem}>
                <Text style={styles.linkText}>Study Spaces</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <Text style={styles.linkText}>Dine, Play, Shop</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <Text style={styles.linkText}>Wellness Resources</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Bottom Footer */}
      <View style={styles.footerBottom}>
        <Text style={styles.copyrightText}>
          © {currentYear} University - Student Affairs
        </Text>
        <View style={styles.bottomLinks}>
          <TouchableOpacity>
            <Text style={styles.bottomLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>·</Text>
          <TouchableOpacity>
            <Text style={styles.bottomLink}>Terms of Use</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#0064a4', // Blue background
    paddingTop: 40,
    paddingBottom: 80, // Extra padding for bottom tab navigation
    width: '100%',
  },
  footerContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Quick Contact Section
  quickContact: {
    marginBottom: 30,
    alignItems: 'center',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#e5e7eb',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactInfo: {
    marginBottom: 16,
    alignItems: 'center',
  },
  contactText: {
    fontSize: 13,
    color: '#f9fafb',
    marginVertical: 3,
    textAlign: 'center',
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  socialIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Collapsible Sections
  collapsibleSections: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  expandIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '300',
  },
  sectionContent: {
    paddingVertical: 12,
    paddingLeft: 16,
  },
  linkItem: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 20,
  },

  // Bottom Footer
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 12,
  },
  bottomLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  bottomLink: {
    fontSize: 11,
    color: '#d1d5db',
    textDecorationLine: 'underline',
  },
  separator: {
    color: '#d1d5db',
    marginHorizontal: 8,
    fontSize: 12,
  },
});
