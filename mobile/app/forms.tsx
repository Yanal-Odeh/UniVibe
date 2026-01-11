import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function FormsApplications() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    studentNumber: '',
    age: '',
    major: '',
    phoneNumber: '',
    city: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCommunities();
  }, [isAuthenticated]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const data = await api.getCommunities();
      // Handle both array response and object with communities property
      const communitiesList = Array.isArray(data) ? data : (data?.communities || []);
      setCommunities(communitiesList);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to join a community');
      router.push('/sign-in');
      return;
    }

    if (!selectedCommunity) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await api.createApplication({
        communityId: selectedCommunity.id,
        name: formData.name,
        studentNumber: formData.studentNumber,
        age: formData.age,
        major: formData.major,
        phoneNumber: formData.phoneNumber,
        city: formData.city
      });

      setFormData({
        name: '',
        studentNumber: '',
        age: '',
        major: '',
        phoneNumber: '',
        city: ''
      });
      setSelectedCommunity(null);
      setMessage({ type: '', text: '' });
      
      setSuccessMessage('Application submitted successfully! You will be notified once reviewed.');
      setTimeout(() => setSuccessMessage(''), 4000);
      
      fetchCommunities();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to submit application. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const openForm = (community: any) => {
    if (!isAuthenticated) {
      router.push('/sign-in');
      return;
    }
    
    setSelectedCommunity(community);
    setMessage({ type: '', text: '' });
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || ''
      }));
    }
  };

  const closeForm = () => {
    setSelectedCommunity(null);
    setFormData({
      name: '',
      studentNumber: '',
      age: '',
      major: '',
      phoneNumber: '',
      city: ''
    });
    setMessage({ type: '', text: '' });
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Join a Community</Text>
          <Text style={styles.heroSubtitle}>
            Apply to join any of our vibrant student communities
          </Text>
        </View>

        {successMessage ? (
          <View style={styles.successAlert}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search communities..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor="#999"
              />
              <Text style={styles.searchIcon}>🔍</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0064a4" />
              <Text style={styles.loaderText}>Loading communities...</Text>
            </View>
          ) : (
            <>
              <View style={styles.communitiesGrid}>
                {filteredCommunities.map(community => (
                  <View key={community.id} style={styles.communityCard}>
                    <View 
                      style={[styles.communityIcon, { backgroundColor: community.color }]}
                    >
                      <Text style={styles.communityIconText}>{community.avatar}</Text>
                    </View>
                    <View style={styles.communityContent}>
                      <Text style={styles.communityName}>{community.name}</Text>
                      <Text style={styles.communityDescription}>{community.description}</Text>
                      <View style={styles.communityMeta}>
                        <Text style={styles.members}>
                          👥 {community.members?.length || 0} members
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={[styles.joinBtn, community.isMember && styles.joinedBtn]}
                      onPress={() => !community.isMember && openForm(community)}
                      disabled={community.isMember}
                    >
                      <Text style={[styles.joinBtnText, community.isMember && styles.joinedBtnText]}>
                        {community.isMember ? 'Joined' : 'Join Community'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {filteredCommunities.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No communities found matching your search.</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Join Form Modal */}
      <Modal
        visible={!!selectedCommunity}
        animationType="slide"
        transparent={true}
        onRequestClose={closeForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={closeForm}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            
            <View 
              style={[styles.modalHeader, { backgroundColor: selectedCommunity?.color }]}
            >
              <Text style={styles.modalIcon}>{selectedCommunity?.avatar}</Text>
              <Text style={styles.modalHeaderTitle}>Join {selectedCommunity?.name}</Text>
              <Text style={styles.modalHeaderSubtitle}>Fill out the form below to apply</Text>
            </View>

            <ScrollView style={styles.modalBody}>
              {message.text ? (
                <View style={[styles.messageBox, message.type === 'error' && styles.errorBox]}>
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
              ) : null}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Student Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.studentNumber}
                  onChangeText={(value) => handleInputChange('studentNumber', value)}
                  placeholder="Enter your student number"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Age *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                  placeholder="Enter your age"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Major *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.major}
                  onChangeText={(value) => handleInputChange('major', value)}
                  placeholder="e.g., Computer Science"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="Enter your city"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelBtn}
                  onPress={closeForm}
                  disabled={submitting}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.submitBtn}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Application</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  successAlert: {
    backgroundColor: '#d1fae5',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 20,
    color: '#059669',
    marginRight: 12,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#059669',
  },
  content: {
    padding: 20,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchBar: {
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 15,
    color: '#333333',
  },
  searchIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    fontSize: 20,
  },
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  communitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  communityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '48%',
    marginBottom: 16,
    minHeight: 240,
  },
  communityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  communityIconText: {
    fontSize: 24,
  },
  communityContent: {
    marginBottom: 12,
    flex: 1,
  },
  communityName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 6,
  },
  communityDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 12,
  },
  communityMeta: {
    flexDirection: 'row',
  },
  members: {
    fontSize: 12,
    color: '#999999',
  },
  joinBtn: {
    backgroundColor: '#0064a4',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinedBtn: {
    backgroundColor: '#e0e0e0',
  },
  joinBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  joinedBtnText: {
    color: '#666666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#666666',
  },
  modalOverlay: {
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
  modalClose: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  modalHeader: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  modalHeaderSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  modalBody: {
    padding: 20,
  },
  messageBox: {
    backgroundColor: '#e0e7ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
  },
  messageText: {
    fontSize: 14,
    color: '#333333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333333',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelBtnText: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#0064a4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
