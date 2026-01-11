import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, StatusBar, Platform } from 'react-native';
import { Link, useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const menuItems = [
    {
      title: 'INFORMATION',
      path: '/information',
      dropdown: [
        { name: 'Information Center', path: '/information-center' },
        { name: 'Forms and Applications', path: '/forms' },
        { name: 'Policies and Guidelines', path: '/policies' },
        { name: 'Virtual Tour', path: '/tour' }
      ]
    },
    {
      title: 'EVENTS',
      path: '/events',
      dropdown: [
        { name: 'Plan Events', path: '/plan-events' },
        { name: 'Event Calendar', path: '/calendar' },
        { name: 'Saved Events', path: '/saved-events' },
        { name: 'Virtual Events', path: '/virtual-events' }
      ]
    },
    {
      title: 'LEARN & ENJOY',
      path: '/learn',
      dropdown: [
        { name: 'Study Spaces', path: '/study-spaces' },
        { name: 'Dine, Play, Shop', path: '/dine-play-shop' },
        { name: 'Services', path: '/services' }
      ]
    },
    {
      title: 'COMMUNITIES',
      path: '/communities'
    },
    {
      title: 'ABOUT',
      path: '/about'
    }
  ];

  const handleNavigate = (path: string) => {
    setMobileMenuOpen(false);
    // Use Expo Router for navigation
    try {
      if (path === '/') {
        router.push('/(tabs)');
      } else if (path === '/communities') {
        router.push('/communities');
      } else if (path === '/about') {
        router.push('/about');
      } else if (path === '/events') {
        router.push('/events');
      } else if (path === '/study-spaces') {
        router.push('/study-spaces');
      } else if (path === '/dine-play-shop') {
        router.push('/dine-play-shop');
      } else if (path === '/services') {
        router.push('/services');
      } else if (path === '/information-center') {
        router.push('/information-center');
      } else if (path === '/forms') {
        router.push('/forms');
      } else if (path === '/policies') {
        router.push('/policies');
      } else if (path === '/tour' || path === '/virtual-tour') {
        router.push('/virtual-tour');
      } else if (path === '/plan-events') {
        router.push('/plan-events');
      } else if (path === '/calendar') {
        router.push('/event-calendar');
      } else if (path === '/saved-events') {
        router.push('/saved-events');
      } else if (path === '/virtual-events') {
        router.push('/virtual-events');
      }
      // Add more routes as needed
    } catch (error) {
      console.log('Navigation error:', error);
    }
  };

  return (
    <>
      {/* Navbar - matching web styling */}
      <View style={styles.navbar}>
        <View style={styles.navbarContainer}>
          {/* Logo */}
          <TouchableOpacity 
            style={styles.logo}
            onPress={() => handleNavigate('/')}
          >
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>UniVibe</Text>
            </View>
            <View style={styles.logoSubtext}>
              <Text style={styles.logoSubtextLine}>Student Center</Text>
              <Text style={styles.logoSubtextLine}>& Event Services</Text>
            </View>
          </TouchableOpacity>

          {/* Right side: Notifications + User + Menu */}
          <View style={styles.authArea}>
            {/* Notifications */}
            {isAuthenticated && (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => {
                  router.push('/notifications');
                  fetchUnreadCount();
                }}
              >
                <Text style={styles.iconText}>🔔</Text>
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            
            {/* User Profile */}
            {!isAuthenticated ? (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => router.push('/sign-in')}
              >
                <Text style={styles.iconText}>👤</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.userProfile}
                onPress={() => router.push('/')}
              >
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {currentUser?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Hamburger Menu Button */}
            <TouchableOpacity 
              onPress={() => setMobileMenuOpen(true)}
              style={styles.menuButton}
            >
              <View style={styles.hamburger}>
                <View style={styles.hamburgerLine} />
                <View style={styles.hamburgerLine} />
                <View style={styles.hamburgerLine} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Mobile Menu Modal */}
      <Modal
        visible={mobileMenuOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMobileMenuOpen(false)}
      >
        <View style={styles.mobileMenuOverlay}>
          <TouchableOpacity 
            style={styles.overlayBackground}
            activeOpacity={1}
            onPress={() => setMobileMenuOpen(false)}
          />
          
          <View style={styles.mobileMenuContent}>
            {/* Close Button */}
            <TouchableOpacity 
              onPress={() => setMobileMenuOpen(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {/* Menu Items */}
            <ScrollView style={styles.menuScrollView} showsVerticalScrollIndicator={false}>
              {/* User info if signed in */}
              {isAuthenticated && currentUser && (
                <View style={styles.mobileUserInfo}>
                  <View style={styles.mobileUserAvatar}>
                    <Text style={styles.mobileUserAvatarText}>
                      {currentUser?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.mobileUserDetails}>
                    <Text style={styles.mobileUserName}>{currentUser?.name || 'User'}</Text>
                    <Text style={styles.mobileUserRole}>
                      {currentUser?.role === 'ADMIN' ? 'Administrator' : 
                       currentUser?.role === 'CLUB_LEADER' ? 'Club Leader' :
                       currentUser?.role === 'DEAN' ? 'Dean' :
                       currentUser?.role === 'STUDENT' ? 'Student' :
                       currentUser?.role || 'User'}
                    </Text>
                  </View>
                </View>
              )}

              {menuItems.map((item, index) => (
                <View key={index} style={styles.mobileMenuItem}>
                  <TouchableOpacity
                    onPress={() => handleNavigate(item.path || '#')}
                    style={styles.mobileMenuLink}
                  >
                    <Text style={styles.mobileMenuLinkText}>{item.title}</Text>
                  </TouchableOpacity>
                  
                  {item.dropdown && (
                    <View style={styles.mobileDropdown}>
                      {item.dropdown.map((subItem, subIndex) => (
                        <TouchableOpacity
                          key={subIndex}
                          onPress={() => handleNavigate(subItem.path)}
                          style={styles.mobileDropdownItem}
                        >
                          <Text style={styles.mobileDropdownItemText}>
                            {subItem.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              {/* Logout button if signed in */}
              {isAuthenticated && (
                <View style={styles.mobileMenuItem}>
                  <TouchableOpacity
                    onPress={async () => {
                      await logout();
                      setMobileMenuOpen(false);
                      router.replace('/(tabs)');
                    }}
                    style={styles.mobileMenuLink}
                  >
                    <Text style={[styles.mobileMenuLinkText, styles.logoutText]}>SIGN OUT</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Navbar styles matching web
  navbar: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
  },
  navbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 70,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    backgroundColor: '#0064a4',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 4,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  logoSubtext: {
    flexDirection: 'column',
  },
  logoSubtextLine: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333333',
    lineHeight: 14,
  },
  authArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 6,
    position: 'relative',
  },
  iconText: {
    fontSize: 18,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0064a4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  menuButton: {
    padding: 8,
  },
  hamburger: {
    gap: 3,
    width: 22,
  },
  hamburgerLine: {
    height: 2,
    backgroundColor: '#333333',
    borderRadius: 2,
  },
  
  // Mobile Menu styles
  mobileMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  overlayBackground: {
    flex: 1,
  },
  mobileMenuContent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 350,
    maxWidth: '85%',
    height: '100%',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 32,
    color: '#333333',
    lineHeight: 32,
  },
  menuScrollView: {
    flex: 1,
    marginTop: 60,
  },
  mobileUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 20,
  },
  mobileUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0064a4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mobileUserAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  mobileUserDetails: {
    flex: 1,
  },
  mobileUserName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  mobileUserRole: {
    fontSize: 14,
    color: '#666666',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  mobileMenuItem: {
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  mobileMenuLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  mobileMenuLinkText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
  },
  mobileDropdown: {
    paddingLeft: 15,
    gap: 8,
  },
  mobileDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  mobileDropdownItemText: {
    fontSize: 15,
    color: '#666666',
  },
});
