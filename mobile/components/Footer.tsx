import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <ImageBackground
      source={require('../assets/images/NNU-footer.jpg')}
      style={styles.footer}
      resizeMode="cover"
      imageStyle={{ alignSelf: 'center' }}
    >
      {/* Dark Overlay */}
      <View style={styles.overlay} />
      
      {/* Footer Content */}
      <View style={styles.footerContent}>
        {/* Contact Section */}
        <View style={styles.footerColumn}>
          <Text style={styles.footerHeading}>Contact</Text>
          <Text style={styles.footerSubheading}>UniVibe Student Hub</Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>Student Center Building</Text>
            <Text style={styles.contactText}>University Campus, 12345</Text>
            <Text style={styles.contactText}>📞 (555) 123-4567</Text>
            <Text style={styles.contactText}>✉️ contact@univibe.edu</Text>
          </View>
          
          <TouchableOpacity style={styles.staffDirectoryBtn}>
            <Text style={styles.staffDirectoryBtnText}>Staff Directory</Text>
          </TouchableOpacity>

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

        {/* Information Section */}
        <View style={styles.footerColumn}>
          <Text style={styles.footerHeading}>Information</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Information Center</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Forms and Applications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Policies and Guidelines</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Virtual Tour</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footerHeading, { marginTop: 20 }]}>Events</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Plan In-Person Events</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Virtual Meetings and Events</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Event Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Learn & Enjoy Section */}
        <View style={styles.footerColumn}>
          <Text style={styles.footerHeading}>Learn & Enjoy</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Study</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Dine, Play, Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Services</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footerHeading, { marginTop: 20 }]}>Get Involved</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Student Employment Opportunities</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Student Center Board of Advisors</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footerHeading, { marginTop: 20 }]}>Wellness Resources</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Meditation Space</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.footerColumn}>
          <Text style={styles.footerHeading}>About</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Our Organization</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Staff Directory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Sustainability</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Student Center Board of Advisors</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Student Center IT Developers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Submit Work Order</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footerHeading, { marginTop: 20 }]}>Student Center Blog</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Read Our Blog</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Footer */}
      <View style={styles.footerBottom}>
        <View style={styles.footerBottomContent}>
          <View style={styles.footerLinksHorizontal}>
            <TouchableOpacity>
              <Text style={styles.footerBottomLink}>Privacy Policy & Terms of Use</Text>
            </TouchableOpacity>
            <Text style={styles.separator}>·</Text>
            <TouchableOpacity>
              <Text style={styles.footerBottomLink}>Web Support</Text>
            </TouchableOpacity>
            <Text style={styles.separator}>·</Text>
            <TouchableOpacity>
              <Text style={styles.footerBottomLink}>UniVibe Homepage</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footerMeta}>Page last modified {currentDate}</Text>
        </View>
      </View>

      {/* Copyright Section */}
      <View style={styles.footerCopyright}>
        <View style={styles.copyrightContent}>
          <View style={styles.copyrightText}>
            <Text style={styles.copyrightLine}>
              Produced by the UniVibe Student Center, a division of Student Affairs.
            </Text>
            <Text style={styles.copyrightLine}>© {currentYear} University</Text>
          </View>
          
          <View style={styles.universityLogo}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoTitle}>Student Affairs</Text>
              <Text style={styles.logoInfo}>studentaffairs@univibe.edu</Text>
              <Text style={styles.logoInfo}>Campus Building</Text>
              <Text style={styles.logoInfo}>University, State 12345-6789</Text>
              <Text style={styles.logoInfo}>(555) 824-4804</Text>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'relative',
    paddingTop: 80,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  footerContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 40,
  },
  footerColumn: {
    marginBottom: 20,
  },
  footerHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  footerSubheading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: -10,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  contactInfo: {
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#f0f0f0',
    marginVertical: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  staffDirectoryBtn: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginTop: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  staffDirectoryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 15,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconText: {
    fontSize: 18,
    color: '#ffffff',
  },
  footerLinks: {
    gap: 10,
  },
  footerLinkItem: {
    paddingVertical: 4,
  },
  footerLinkText: {
    fontSize: 14,
    color: '#e8e8e8',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footerBottom: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 25,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  footerBottomContent: {
    paddingHorizontal: 20,
    gap: 15,
  },
  footerLinksHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  footerBottomLink: {
    fontSize: 13,
    color: '#e8e8e8',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  separator: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 13,
  },
  footerMeta: {
    fontSize: 12,
    color: '#b0b0b0',
    fontStyle: 'italic',
  },
  footerCopyright: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  copyrightContent: {
    gap: 30,
  },
  copyrightText: {
    gap: 4,
  },
  copyrightLine: {
    fontSize: 13,
    color: '#d0d0d0',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  universityLogo: {
    marginTop: 10,
  },
  logoPlaceholder: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  logoTitle: {
    fontSize: 16,
    color: '#a5b4fc',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  logoInfo: {
    fontSize: 12,
    color: '#e8e8e8',
    marginVertical: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
