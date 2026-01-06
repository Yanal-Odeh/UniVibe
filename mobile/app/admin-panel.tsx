import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function AdminPanel() {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [activeSection, setActiveSection] = useState('communities');
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [isAddingCommunity, setIsAddingCommunity] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [rejectionModal, setRejectionModal] = useState<any>({ isOpen: false, application: null, reason: '' });
  const [eventRevisionModal, setEventRevisionModal] = useState<any>({ isOpen: false, event: null, reason: '' });
  const [loading, setLoading] = useState(true);
  
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    avatar: '🎯',
    color: '#667eea'
  });

  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student'
  });

  const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ffd16a'];
  const emojis = ['🎯', '🖥️', '🎨', '⚽', '📚', '🎵', '🎮', '🌟', '💡', '🚀'];

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push('/sign-in');
      return;
    }
    
    const userRole = (currentUser.role || '').toString().toUpperCase();
    if (userRole !== 'ADMIN') {
      Alert.alert('Access Denied', 'You need administrator privileges to access this page.');
      router.push('/');
      return;
    }
    
    fetchData();
  }, [isAuthenticated, currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [communitiesData, studentsData, applicationsData, eventsData] = await Promise.all([
        api.getCommunities(),
        api.getStudents(),
        api.getApplications().catch(() => ({ applications: [] })),
        api.getEvents().catch(() => ({ events: [] }))
      ]);
      
      const communitiesList = Array.isArray(communitiesData) ? communitiesData : (communitiesData?.communities || []);
      setCommunities(communitiesList);
      
      const studentsList = studentsData.students || studentsData || [];
      setStudents(Array.isArray(studentsList) ? studentsList : []);
      
      setApplications(applicationsData.applications || []);
      setEvents(eventsData.events || eventsData || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(tabs)');
  };

  const formatRole = (role: string) => {
    const r = (role || '').toString().toLowerCase();
    if (!r) return '';
    if (r === 'club_leader' || r === 'clubleader') return 'Club Leader';
    if (r === 'faculty_leader' || r === 'facultyleader') return 'Faculty Leader';
    if (r === 'dean_of_faculty' || r === 'deanoffaculty') return 'Dean of Faculty';
    if (r === 'deanship_of_student_affairs' || r === 'deanshipofstudentaffairs') return 'Deanship of Student Affairs';
    if (r === 'admin') return 'Admin';
    if (r === 'student') return 'Student';
    return r.replace(/_/g, ' ').replace(/(^|\s)\S/g, t => t.toUpperCase());
  };

  const handleAddCommunity = async () => {
    if (newCommunity.name && newCommunity.description) {
      try {
        await api.createCommunity(newCommunity);
        setNewCommunity({ name: '', description: '', avatar: '🎯', color: '#667eea' });
        setIsAddingCommunity(false);
        fetchData();
      } catch (err: any) {
        Alert.alert('Error', 'Failed to add community: ' + err.message);
      }
    }
  };

  const handleDeleteCommunity = async (id: string) => {
    Alert.alert(
      'Delete Community',
      'Are you sure you want to delete this community?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteCommunity(id);
              setSelectedCommunity(null);
              fetchData();
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete community: ' + err.message);
            }
          }
        }
      ]
    );
  };

  const handleAddStudent = async () => {
    if (newStudent.firstName && newStudent.lastName && newStudent.email && newStudent.password) {
      try {
        const roleMapping: any = {
          'student': 'STUDENT',
          'club_leader': 'CLUB_LEADER',
          'faculty_leader': 'FACULTY_LEADER',
          'dean_of_faculty': 'DEAN_OF_FACULTY',
          'deanship_of_student_affairs': 'DEANSHIP_OF_STUDENT_AFFAIRS',
          'admin': 'ADMIN'
        };

        const studentData = {
          firstName: newStudent.firstName,
          lastName: newStudent.lastName,
          email: newStudent.email,
          password: newStudent.password,
          role: roleMapping[newStudent.role] || 'STUDENT'
        };
        
        await api.createStudent(studentData);
        
        setNewStudent({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'student'
        });
        setIsAddingStudent(false);
        fetchData();
      } catch (err: any) {
        Alert.alert('Error', 'Failed to add student: ' + err.message);
      }
    }
  };

  const handleDeleteStudent = async (id: string) => {
    Alert.alert(
      'Delete Student',
      'Are you sure you want to delete this student account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteStudent(id);
              fetchData();
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete student: ' + err.message);
            }
          }
        }
      ]
    );
  };

  const handleRejectApplication = async () => {
    if (!rejectionModal.reason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    try {
      await api.updateApplicationStatus(rejectionModal.application.id, 'REJECTED', rejectionModal.reason);
      setRejectionModal({ isOpen: false, application: null, reason: '' });
      fetchData();
    } catch (err) {
      Alert.alert('Error', 'Failed to reject application');
    }
  };

  const filteredCommunities = Array.isArray(communities) ? communities.filter(c =>
    c && c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredStudents = Array.isArray(students) ? students.filter(s => {
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const email = (s.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const roleLower = (s.role || '').toLowerCase();

    const matchesSearch = name.includes(search) || email.includes(search);
    const matchesCategory = selectedCategory === 'all' ? true : roleLower === selectedCategory;

    return matchesSearch && matchesCategory;
  }) : [];

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loaderText}>Loading Admin Panel...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !currentUser || currentUser.role?.toUpperCase() !== 'ADMIN') {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.adminInfo}>
          <View style={styles.adminAvatar}>
            <Text style={styles.adminAvatarText}>
              {currentUser?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <View style={styles.adminDetails}>
            <Text style={styles.adminName}>{currentUser?.name}</Text>
            <Text style={styles.adminRole}>{formatRole(currentUser?.role)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Section Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.sectionNav}
      >
        <TouchableOpacity
          style={[styles.navItem, activeSection === 'communities' && styles.navItemActive]}
          onPress={() => setActiveSection('communities')}
        >
          <Text style={[styles.navItemText, activeSection === 'communities' && styles.navItemTextActive]}>
            👥 Communities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeSection === 'users' && styles.navItemActive]}
          onPress={() => setActiveSection('users')}
        >
          <Text style={[styles.navItemText, activeSection === 'users' && styles.navItemTextActive]}>
            👤 Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeSection === 'applications' && styles.navItemActive]}
          onPress={() => setActiveSection('applications')}
        >
          <Text style={[styles.navItemText, activeSection === 'applications' && styles.navItemTextActive]}>
            📋 Applications
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeSection === 'events' && styles.navItemActive]}
          onPress={() => setActiveSection('events')}
        >
          <Text style={[styles.navItemText, activeSection === 'events' && styles.navItemTextActive]}>
            📅 Events
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Communities Section */}
      {activeSection === 'communities' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Manage Communities</Text>
              <Text style={styles.sectionSubtitle}>Create, edit, and manage all university communities</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setIsAddingCommunity(true)}>
              <Text style={styles.addBtnText}>+ New</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={[styles.statCard, { borderLeftColor: '#667eea' }]}>
              <Text style={styles.statValue}>{communities.length}</Text>
              <Text style={styles.statLabel}>Total Communities</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#4facfe' }]}>
              <Text style={styles.statValue}>{communities.reduce((acc, c) => acc + (c.memberCount || 0), 0)}</Text>
              <Text style={styles.statLabel}>Total Members</Text>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search communities..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#999"
            />
          </View>

          {/* Communities List */}
          <View style={styles.list}>
            {filteredCommunities.map(community => (
              <View key={community.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.communityAvatar, { backgroundColor: community.color }]}>
                    <Text style={styles.communityAvatarText}>{community.avatar}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{community.name}</Text>
                    <Text style={styles.cardDescription}>{community.description}</Text>
                    <Text style={styles.cardMeta}>👥 {community.memberCount || 0} members</Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => setSelectedCommunity(community)}
                  >
                    <Text style={styles.actionBtnText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDeleteCommunity(community.id)}
                  >
                    <Text style={[styles.actionBtnText, styles.deleteBtnText]}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Users Section */}
      {activeSection === 'users' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Manage Students</Text>
              <Text style={styles.sectionSubtitle}>Register and manage student accounts</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setIsAddingStudent(true)}>
              <Text style={styles.addBtnText}>+ Register</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={[styles.statCard, { borderLeftColor: '#667eea' }]}>
              <Text style={styles.statValue}>{students.length}</Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#fa709a' }]}>
              <Text style={styles.statValue}>{students.filter(s => (s.role || '').toLowerCase() === 'club_leader').length}</Text>
              <Text style={styles.statLabel}>Club Leaders</Text>
            </View>
          </View>

          {/* Role Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.roleFilter}
          >
            {[
              { key: 'all', label: 'All' },
              { key: 'student', label: 'Students' },
              { key: 'club_leader', label: 'Club Leaders' },
              { key: 'faculty_leader', label: 'Faculty Leaders' },
              { key: 'dean_of_faculty', label: 'Dean of Faculty' },
              { key: 'deanship_of_student_affairs', label: 'Deanship of Student Affairs' },
              { key: 'admin', label: 'Admins' }
            ].map(r => (
              <TouchableOpacity
                key={r.key}
                style={[styles.roleBtn, selectedCategory === r.key && styles.roleBtnActive]}
                onPress={() => setSelectedCategory(r.key)}
              >
                <Text style={[styles.roleBtnText, selectedCategory === r.key && styles.roleBtnTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search students..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#999"
            />
          </View>

          {/* Students List */}
          <View style={styles.list}>
            {filteredStudents.map(student => (
              <View key={student.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.communityAvatar, { backgroundColor: '#667eea' }]}>
                    <Text style={styles.communityAvatarText}>
                      {student.firstName?.[0]}{student.lastName?.[0]}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{student.firstName} {student.lastName}</Text>
                    <Text style={styles.cardDescription}>{student.email}</Text>
                    <Text style={styles.cardMeta}>{formatRole(student.role)}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteStudent(student.id)}
                >
                  <Text style={[styles.actionBtnText, styles.deleteBtnText]}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Applications Section */}
      {activeSection === 'applications' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Manage Applications</Text>
              <Text style={styles.sectionSubtitle}>Review and approve community join applications</Text>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search applications..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#999"
            />
          </View>

          {/* Applications List */}
          <View style={styles.list}>
            {applications
              .filter(app => {
                const searchLower = searchTerm.toLowerCase();
                const community = communities.find(c => c.id === app.communityId);
                return (
                  app.name.toLowerCase().includes(searchLower) ||
                  app.studentNumber.toLowerCase().includes(searchLower) ||
                  community?.name.toLowerCase().includes(searchLower) ||
                  ''
                );
              })
              .map(application => {
                const community = communities.find(c => c.id === application.communityId);
                return (
                  <View key={application.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.communityAvatar, { backgroundColor: '#667eea' }]}>
                        <Text style={styles.communityAvatarText}>
                          {application.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{application.name}</Text>
                        <Text style={styles.cardDescription}>
                          {community ? `${community.avatar} ${community.name}` : 'N/A'}
                        </Text>
                        <Text style={styles.cardMeta}>
                          {application.studentNumber} • {application.major} • {application.phoneNumber}
                        </Text>
                        <View style={[
                          styles.statusBadge,
                          application.status === 'PENDING' ? styles.statusPending :
                          application.status === 'APPROVED' ? styles.statusApproved :
                          styles.statusRejected
                        ]}>
                          <Text style={styles.statusText}>{application.status}</Text>
                        </View>
                      </View>
                    </View>
                    {application.status === 'PENDING' && (
                      <View style={styles.cardActions}>
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.approveBtn]}
                          onPress={async () => {
                            try {
                              await api.updateApplicationStatus(application.id, 'APPROVED');
                              fetchData();
                            } catch (err) {
                              Alert.alert('Error', 'Failed to approve application');
                            }
                          }}
                        >
                          <Text style={[styles.actionBtnText, styles.approveBtnText]}>✓ Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.rejectBtn]}
                          onPress={() => setRejectionModal({ isOpen: true, application, reason: '' })}
                        >
                          <Text style={[styles.actionBtnText, styles.rejectBtnText]}>✕ Reject</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            {applications.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No applications submitted yet</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Events Section */}
      {activeSection === 'events' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Manage Events</Text>
              <Text style={styles.sectionSubtitle}>Review and approve event proposals</Text>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#999"
            />
          </View>

          {/* Events List */}
          <View style={styles.list}>
            {events
              .filter(event => {
                const searchLower = searchTerm.toLowerCase();
                return (
                  event.title.toLowerCase().includes(searchLower) ||
                  event.description?.toLowerCase().includes(searchLower) ||
                  event.community?.name.toLowerCase().includes(searchLower) ||
                  ''
                );
              })
              .map(event => {
                const getStatusColor = () => {
                  if (event.status === 'APPROVED') return '#10b981';
                  if (event.status.includes('REJECTED')) return '#ef4444';
                  if (event.status.includes('REVISION')) return '#8b5cf6';
                  return '#f59e0b';
                };

                const canApprove = () => {
                  const role = (currentUser.role || '').toString().toUpperCase();
                  if (role === 'FACULTY_LEADER' && event.status === 'PENDING_FACULTY_APPROVAL') return true;
                  if (role === 'DEAN_OF_FACULTY' && event.status === 'PENDING_DEAN_APPROVAL') return true;
                  if (role === 'DEANSHIP_OF_STUDENT_AFFAIRS' && event.status === 'PENDING_DEANSHIP_APPROVAL') return true;
                  return false;
                };

                return (
                  <View key={event.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.communityAvatar, { backgroundColor: event.community?.color || '#667eea' }]}>
                        <Text style={styles.communityAvatarText}>{event.community?.avatar || '📅'}</Text>
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{event.title}</Text>
                        <Text style={styles.cardDescription}>{event.description}</Text>
                        <Text style={styles.cardMeta}>
                          📅 {new Date(event.startDate).toLocaleDateString()} • 📍 {event.location}
                        </Text>
                        {event.community && (
                          <Text style={styles.cardMeta}>
                            🎯 {event.community.name}
                          </Text>
                        )}
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                          <Text style={styles.statusText}>{event.status.replace(/_/g, ' ')}</Text>
                        </View>
                      </View>
                    </View>
                    
                    {canApprove() && (
                      <View style={styles.cardActions}>
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.approveBtn]}
                          onPress={async () => {
                            try {
                              const role = (currentUser.role || '').toString().toUpperCase();
                              if (role === 'FACULTY_LEADER') {
                                await api.approveFacultyLeader(event.id, { approved: true });
                              } else if (role === 'DEAN_OF_FACULTY') {
                                await api.approveDeanOfFaculty(event.id, { approved: true });
                              } else if (role === 'DEANSHIP_OF_STUDENT_AFFAIRS') {
                                await api.approveDeanship(event.id, { approved: true });
                              }
                              Alert.alert('Success', 'Event approved successfully!');
                              fetchData();
                            } catch (err: any) {
                              Alert.alert('Error', err.message || 'Failed to approve event');
                            }
                          }}
                        >
                          <Text style={[styles.actionBtnText, styles.approveBtnText]}>✓ Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.rejectBtn]}
                          onPress={() => setEventRevisionModal({ isOpen: true, event, reason: '', type: 'reject' })}
                        >
                          <Text style={[styles.actionBtnText, styles.rejectBtnText]}>✕ Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.revisionBtn]}
                          onPress={() => setEventRevisionModal({ isOpen: true, event, reason: '', type: 'revision' })}
                        >
                          <Text style={[styles.actionBtnText, styles.revisionBtnText]}>📝 Revision</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            {events.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No events submitted yet</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Add Community Modal */}
      <Modal
        visible={isAddingCommunity}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddingCommunity(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Community</Text>
            
            <Text style={styles.label}>Community Name</Text>
            <TextInput
              style={styles.input}
              value={newCommunity.name}
              onChangeText={(text) => setNewCommunity({ ...newCommunity, name: text })}
              placeholder="Enter community name"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={newCommunity.description}
              onChangeText={(text) => setNewCommunity({ ...newCommunity, description: text })}
              placeholder="Enter community description"
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Avatar</Text>
            <View style={styles.emojiSelector}>
              {emojis.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emojiBtn, newCommunity.avatar === emoji && styles.emojiBtnActive]}
                  onPress={() => setNewCommunity({ ...newCommunity, avatar: emoji })}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Color Theme</Text>
            <View style={styles.colorSelector}>
              {colors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorBtn, 
                    { backgroundColor: color },
                    newCommunity.color === color && styles.colorBtnActive
                  ]}
                  onPress={() => setNewCommunity({ ...newCommunity, color })}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddingCommunity(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddCommunity}>
                <Text style={styles.submitBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Student Modal */}
      <Modal
        visible={isAddingStudent}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddingStudent(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Register New Student</Text>
            
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={newStudent.firstName}
              onChangeText={(text) => setNewStudent({ ...newStudent, firstName: text })}
              placeholder="Enter first name"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={newStudent.lastName}
              onChangeText={(text) => setNewStudent({ ...newStudent, lastName: text })}
              placeholder="Enter last name"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={newStudent.email}
              onChangeText={(text) => setNewStudent({ ...newStudent, email: text })}
              placeholder="student@univibe.edu"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={newStudent.password}
              onChangeText={(text) => setNewStudent({ ...newStudent, password: text })}
              placeholder="Enter password"
              secureTextEntry
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Role</Text>
            <View style={styles.roleOptions}>
              {[
                { key: 'student', label: 'Student' },
                { key: 'club_leader', label: 'Club Leader' },
                { key: 'faculty_leader', label: 'Faculty Leader' },
                { key: 'dean_of_faculty', label: 'Dean of Faculty' },
                { key: 'deanship_of_student_affairs', label: 'Deanship of Student Affairs' },
                { key: 'admin', label: 'Admin' }
              ].map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleOption, newStudent.role === r.key && styles.roleOptionActive]}
                  onPress={() => setNewStudent({ ...newStudent, role: r.key })}
                >
                  <Text style={[styles.roleOptionText, newStudent.role === r.key && styles.roleOptionTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddingStudent(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddStudent}>
                <Text style={styles.submitBtnText}>Register</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        visible={rejectionModal.isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRejectionModal({ isOpen: false, application: null, reason: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Application</Text>
            <Text style={styles.modalSubtitle}>Please provide a reason for rejection</Text>
            
            <Text style={styles.label}>Rejection Reason *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={rejectionModal.reason}
              onChangeText={(text) => setRejectionModal(prev => ({ ...prev, reason: text }))}
              placeholder="Explain why this application is being rejected..."
              multiline
              numberOfLines={5}
              placeholderTextColor="#999"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setRejectionModal({ isOpen: false, application: null, reason: '' })}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitBtn, styles.rejectSubmitBtn]} 
                onPress={handleRejectApplication}
              >
                <Text style={styles.submitBtnText}>Reject Application</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Event Revision/Rejection Modal */}
      <Modal
        visible={eventRevisionModal.isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEventRevisionModal({ isOpen: false, event: null, reason: '', type: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {eventRevisionModal.type === 'revision' ? '📝 Request Revision' : '✕ Reject Event'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {eventRevisionModal.event?.title}
            </Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder={
                eventRevisionModal.type === 'revision'
                  ? 'Describe what needs to be changed...'
                  : 'Provide rejection reason...'
              }
              value={eventRevisionModal.reason}
              onChangeText={(text) => setEventRevisionModal({ ...eventRevisionModal, reason: text })}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setEventRevisionModal({ isOpen: false, event: null, reason: '', type: '' })}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitBtn, eventRevisionModal.type === 'reject' && styles.rejectSubmitBtn]} 
                onPress={async () => {
                  if (!eventRevisionModal.reason.trim()) {
                    Alert.alert('Error', 'Please provide a reason');
                    return;
                  }
                  
                  try {
                    const role = (currentUser.role || '').toString().toUpperCase();
                    const data = {
                      approved: false,
                      [eventRevisionModal.type === 'revision' ? 'revisionRequest' : 'rejectionReason']: eventRevisionModal.reason
                    };
                    
                    if (role === 'FACULTY_LEADER') {
                      await api.approveFacultyLeader(eventRevisionModal.event.id, data);
                    } else if (role === 'DEAN_OF_FACULTY') {
                      await api.approveDeanOfFaculty(eventRevisionModal.event.id, data);
                    } else if (role === 'DEANSHIP_OF_STUDENT_AFFAIRS') {
                      await api.approveDeanship(eventRevisionModal.event.id, data);
                    }
                    
                    Alert.alert('Success', 
                      eventRevisionModal.type === 'revision' 
                        ? 'Revision request sent!' 
                        : 'Event rejected'
                    );
                    setEventRevisionModal({ isOpen: false, event: null, reason: '', type: '' });
                    fetchData();
                  } catch (err: any) {
                    Alert.alert('Error', err.message || 'Failed to process request');
                  }
                }}
              >
                <Text style={styles.submitBtnText}>
                  {eventRevisionModal.type === 'revision' ? 'Request Revision' : 'Reject Event'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adminAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  adminDetails: {},
  adminName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  adminRole: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionNav: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  navItemActive: {
    backgroundColor: '#667eea',
  },
  navItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  navItemTextActive: {
    color: '#ffffff',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  addBtn: {
    backgroundColor: '#667eea',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666666',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333333',
  },
  roleFilter: {
    marginBottom: 20,
  },
  roleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  roleBtnActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  roleBtnTextActive: {
    color: '#ffffff',
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  communityAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  communityAvatarText: {
    fontSize: 24,
    color: '#ffffff',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: '#999999',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    borderColor: '#fee2e2',
  },
  deleteBtnText: {
    color: '#dc2626',
  },
  approveBtn: {
    backgroundColor: '#d1fae5',
    borderColor: '#d1fae5',
  },
  approveBtnText: {
    color: '#059669',
  },
  rejectBtn: {
    backgroundColor: '#fee2e2',
    borderColor: '#fee2e2',
  },
  rejectBtnText: {
    color: '#dc2626',
  },
  revisionBtn: {
    backgroundColor: '#ede9fe',
    borderColor: '#ede9fe',
  },
  revisionBtnText: {
    color: '#8b5cf6',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusApproved: {
    backgroundColor: '#d1fae5',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333333',
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginTop: 12,
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
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  emojiSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiBtn: {
    width: 50,
    height: 50,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  emojiBtnActive: {
    borderColor: '#667eea',
    backgroundColor: '#e8eaf6',
  },
  emoji: {
    fontSize: 24,
  },
  colorSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  colorBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorBtnActive: {
    borderColor: '#333333',
  },
  roleOptions: {
    gap: 8,
  },
  roleOption: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  roleOptionActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  roleOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  roleOptionTextActive: {
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  rejectSubmitBtn: {
    backgroundColor: '#dc2626',
  },
});
