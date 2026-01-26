import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function CommunitiesScreen() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCommunities();
      setCommunities(data.communities || data);
    } catch (err: any) {
      console.error('Failed to fetch communities:', err);
      setError(err.message || 'Failed to load communities. Make sure server is running.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunities = communities.filter(comm =>
    comm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0064A4" />
          <Text style={styles.loadingText}>Loading communities...</Text>
        </View>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCommunities}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Our Communities</Text>
          <Text style={styles.headerSubtitle}>
            Join vibrant communities and connect with like-minded students
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#718096"
          />
        </View>

        {/* Communities Grid */}
        <View style={styles.grid}>
          {filteredCommunities.map(community => (
            <TouchableOpacity
              key={community.id}
              style={styles.card}
              onPress={() => setSelectedCommunity(community)}
            >
              <View style={[styles.cardHeader, { backgroundColor: community.color }]}>
                <Text style={styles.avatar}>{community.avatar}</Text>
              </View>
              
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{community.name}</Text>
                <Text style={styles.cardDescription}>{community.description}</Text>
                
                {/* Key Members */}
                {community.members.filter((m: any) => m.role === 'club_leader' || m.role === 'admin').length > 0 && (
                  <View style={styles.keyMembers}>
                    <Text style={styles.keyMembersTitle}>Community Leaders</Text>
                    {community.members
                      .filter((m: any) => m.role === 'club_leader' || m.role === 'admin')
                      .slice(0, 3)
                      .map((member: any) => (
                        <View key={member.id} style={styles.keyMemberBadge}>
                          <View style={styles.keyMemberAvatar}>
                            <Text style={styles.keyMemberAvatarText}>{member.name[0]}</Text>
                          </View>
                          <View style={styles.keyMemberInfo}>
                            <Text style={styles.keyMemberName}>{member.name}</Text>
                            <View style={styles.keyMemberRole}>
                              <Text style={styles.keyMemberRoleText}>👑 Leader</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                  </View>
                )}
                
                {/* Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.memberCount}>
                    <Text style={styles.memberCountIcon}>👥</Text>
                    <Text style={styles.memberCountText}>{community.memberCount} members</Text>
                  </View>
                  <TouchableOpacity style={styles.joinBtn}>
                    <Text style={styles.joinBtnText}>Join</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modal */}
      {selectedCommunity && (
        <Modal
          visible={!!selectedCommunity}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setSelectedCommunity(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalOverlayTouch}
              activeOpacity={1}
              onPress={() => setSelectedCommunity(null)}
            />
            
            <View style={styles.modalContent}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSelectedCommunity(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>

              {/* Modal Header */}
              <View style={[styles.modalHeader, { backgroundColor: selectedCommunity.color }]}>
                <Text style={styles.modalAvatar}>{selectedCommunity.avatar}</Text>
                <Text style={styles.modalTitle}>{selectedCommunity.name}</Text>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalDescription}>{selectedCommunity.description}</Text>

                {/* Community Leaders */}
                {selectedCommunity.members.filter((m: any) => m.role === 'club_leader' || m.role === 'admin').length > 0 && (
                  <View style={styles.membersSection}>
                    <Text style={styles.membersSectionTitle}>👑 Community Leaders</Text>
                    {selectedCommunity.members
                      .filter((m: any) => m.role === 'club_leader' || m.role === 'admin')
                      .map((member: any) => (
                        <View key={member.id} style={styles.memberItem}>
                          <View style={styles.memberInfo}>
                            <View style={styles.memberAvatar}>
                              <Text style={styles.memberAvatarText}>{member.name[0]}</Text>
                            </View>
                            <View>
                              <Text style={styles.memberName}>{member.name}</Text>
                              <Text style={styles.memberEmail}>{member.email}</Text>
                            </View>
                          </View>
                          <View style={styles.roleBadgeLeader}>
                            <Text style={styles.roleBadgeText}>👑 Leader</Text>
                          </View>
                        </View>
                      ))}
                  </View>
                )}

                {/* All Members */}
                <View style={styles.membersSection}>
                  <Text style={styles.membersSectionTitle}>
                    👥 All Members ({selectedCommunity.members.filter((m: any) => m.role !== 'club_leader' && m.role !== 'admin').length})
                  </Text>
                  {selectedCommunity.members
                    .filter((m: any) => m.role !== 'club_leader' && m.role !== 'admin')
                    .map((member: any) => (
                      <View key={member.id} style={styles.memberItem}>
                        <View style={styles.memberInfo}>
                          <View style={styles.memberAvatar}>
                            <Text style={styles.memberAvatarText}>{member.name[0]}</Text>
                          </View>
                          <View>
                            <Text style={styles.memberName}>{member.name}</Text>
                            <Text style={styles.memberEmail}>{member.email}</Text>
                          </View>
                        </View>
                        <View style={member.role === 'moderator' ? styles.roleBadgeModerator : styles.roleBadgeMember}>
                          <Text style={styles.roleBadgeText}>
                            {member.role === 'moderator' ? '🛡️ moderator' : '👤 member'}
                          </Text>
                        </View>
                      </View>
                    ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0064a4',
    marginBottom: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
  },

  // Grid
  grid: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 24,
  },

  // Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  cardHeader: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatar: {
    fontSize: 48,
    zIndex: 1,
  },
  cardBody: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 22,
    marginBottom: 16,
  },

  // Key Members
  keyMembers: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  keyMembersTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  keyMemberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  keyMemberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0064a4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  keyMemberAvatarText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  keyMemberInfo: {
    flex: 1,
  },
  keyMemberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  keyMemberRole: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  keyMemberRoleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0064a4',
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCountIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  memberCountText: {
    fontSize: 14,
    color: '#718096',
  },
  joinBtn: {
    backgroundColor: '#0064a4',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ffffff',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#2d3748',
  },
  modalHeader: {
    padding: 40,
    alignItems: 'center',
  },
  modalAvatar: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  modalBody: {
    padding: 24,
  },
  modalDescription: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 24,
    marginBottom: 24,
  },

  // Members Section
  membersSection: {
    marginBottom: 24,
  },
  membersSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0064a4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 18,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 12,
    color: '#718096',
  },
  roleBadgeLeader: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadgeModerator: {
    backgroundColor: 'rgba(67, 233, 123, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadgeMember: {
    backgroundColor: 'rgba(113, 128, 150, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d3748',
  },
  text: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  
  // Loading & Error States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#718096',
  },
  errorText: {
    fontSize: 16,
    color: '#fa709a',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0064a4',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
