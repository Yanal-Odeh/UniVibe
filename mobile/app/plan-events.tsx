import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Layout from '@/components/Layout';

export default function PlanEventsScreen() {
  const { currentUser, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [revisionResponse, setRevisionResponse] = useState<any>({});
  const [submittingRevision, setSubmittingRevision] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    collegeId: '',
    locationId: '',
    startDate: '',
    endDate: '',
    communityId: '',
    capacity: ''
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [actionModal, setActionModal] = useState<any>({ isOpen: false, event: null, type: '', reason: '' });

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push('/sign-in');
      return;
    }
    
    const userRole = (currentUser.role || '').toString().toUpperCase();
    if (userRole !== 'CLUB_LEADER' && userRole !== 'FACULTY_LEADER') {
      Alert.alert('Access Denied', 'Only Club Leaders and Faculty Leaders can plan events.');
      router.back();
      return;
    }
    
    fetchData();
  }, [isAuthenticated, currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [eventsData, collegesData, communitiesData] = await Promise.all([
        api.getEvents(),
        api.getColleges(),
        api.getCommunities()
      ]);
      
      // Filter to show only events created by current user
      const userEvents = (eventsData.events || eventsData || []).filter(
        (event: any) => event.createdBy === currentUser?.id
      );
      setEvents(userEvents);
      setColleges(collegesData.colleges || collegesData || []);
      
      const communitiesList = Array.isArray(communitiesData) 
        ? communitiesData 
        : (communitiesData?.communities || []);
      setCommunities(communitiesList);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async (collegeId: string) => {
    try {
      const data = await api.getLocations(collegeId);
      setLocations(data.locations || data || []);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'collegeId') {
      fetchLocations(value);
      setFormData(prev => ({ ...prev, locationId: '' }));
    }
  };

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      setFormData(prev => ({ ...prev, startDate: formatDateTime(selectedDate) }));
      // Show time picker after date is selected
      setTimeout(() => setShowStartTimePicker(true), 100);
    }
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(startDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setStartDate(newDate);
      setFormData(prev => ({ ...prev, startDate: formatDateTime(newDate) }));
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      setFormData(prev => ({ ...prev, endDate: formatDateTime(selectedDate) }));
      // Show time picker after date is selected
      setTimeout(() => setShowEndTimePicker(true), 100);
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(endDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setEndDate(newDate);
      setFormData(prev => ({ ...prev, endDate: formatDateTime(newDate) }));
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.description || !formData.collegeId || 
        !formData.locationId || !formData.startDate || !formData.communityId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await api.createEvent({
        title: formData.title,
        description: formData.description,
        collegeId: formData.collegeId,
        locationId: formData.locationId,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        communityId: formData.communityId,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      });

      Alert.alert('Success', 'Event submitted for approval!');
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        collegeId: '',
        locationId: '',
        startDate: '',
        endDate: '',
        communityId: '',
        capacity: ''
      });
      fetchData();
    } catch (err: any) {
      console.error('Failed to create event:', err);
      Alert.alert('Error', err.message || 'Failed to create event');
    }
  };

  const handleRespondToRevision = async (eventId: string) => {
    const response = revisionResponse[eventId];
    if (!response?.trim()) {
      Alert.alert('Error', 'Please provide a response');
      return;
    }

    try {
      setSubmittingRevision(eventId);
      await api.respondToRevision(eventId, { response });
      Alert.alert('Success', 'Response submitted successfully!');
      setRevisionResponse({ ...revisionResponse, [eventId]: '' });
      fetchData();
    } catch (err: any) {
      console.error('Failed to respond to revision:', err);
      Alert.alert('Error', err.message || 'Failed to submit response');
    } finally {
      setSubmittingRevision(null);
    }
  };

  const handleEventAction = async (action: 'approve' | 'reject' | 'revision', event?: any) => {
    const evt = event || actionModal.event;
    const { reason } = actionModal;
    
    if (!evt || !evt.id) {
      Alert.alert('Error', 'Invalid event');
      return;
    }
    
    if ((action === 'reject' || action === 'revision') && !reason.trim()) {
      Alert.alert('Error', 'Please provide a reason');
      return;
    }

    try {
      const role = (currentUser?.role || '').toString().toUpperCase();
      const data = action === 'approve' 
        ? { approved: true }
        : {
            approved: false,
            [action === 'revision' ? 'revisionRequest' : 'rejectionReason']: reason
          };

      if (role === 'FACULTY_LEADER') {
        await api.approveFacultyLeader(evt.id, data);
      } else if (role === 'DEAN_OF_FACULTY') {
        await api.approveDeanOfFaculty(evt.id, data);
      } else if (role === 'DEANSHIP_OF_STUDENT_AFFAIRS') {
        await api.approveDeanship(evt.id, data);
      }

      Alert.alert(
        'Success', 
        action === 'approve' ? 'Event approved!' : 
        action === 'revision' ? 'Revision requested!' : 
        'Event rejected!'
      );
      
      setActionModal({ isOpen: false, event: null, type: '', reason: '' });
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to process action');
    }
  };

  const canApproveEvent = (event: any) => {
    const role = (currentUser?.role || '').toString().toUpperCase();
    const status = event.status;
    
    if (role === 'FACULTY_LEADER' && status === 'PENDING_FACULTY_APPROVAL') return true;
    if (role === 'FACULTY_LEADER' && status === 'NEEDS_REVISION_DEAN') return true;
    
    return false;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#10b981';
      case 'REJECTED':
      case 'FACULTY_REJECTED':
      case 'DEAN_REJECTED':
      case 'DEANSHIP_REJECTED':
        return '#ef4444';
      case 'PENDING_FACULTY_APPROVAL':
      case 'PENDING_DEAN_APPROVAL':
      case 'PENDING_DEANSHIP_APPROVAL':
        return '#f59e0b';
      case 'REQUIRES_REVISION':
      case 'FACULTY_REQUIRES_REVISION':
      case 'DEAN_REQUIRES_REVISION':
      case 'DEANSHIP_REQUIRES_REVISION':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      'PENDING_FACULTY_APPROVAL': 'Pending Faculty Leader',
      'PENDING_DEAN_APPROVAL': 'Pending Dean of Faculty',
      'PENDING_DEANSHIP_APPROVAL': 'Pending Deanship',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'FACULTY_REJECTED': 'Rejected by Faculty Leader',
      'DEAN_REJECTED': 'Rejected by Dean',
      'DEANSHIP_REJECTED': 'Rejected by Deanship',
      'REQUIRES_REVISION': 'Requires Revision',
      'FACULTY_REQUIRES_REVISION': 'Faculty Revision Required',
      'DEAN_REQUIRES_REVISION': 'Dean Revision Required',
      'DEANSHIP_REQUIRES_REVISION': 'Deanship Revision Required',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Plan Events</Text>
          <Text style={styles.subtitle}>Create and manage event proposals</Text>
        </View>

        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.createButtonText}>+ Plan Event</Text>
        </TouchableOpacity>

        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No events created yet</Text>
            <Text style={styles.emptySubtext}>Click "Plan Event" to create your first event!</Text>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {events.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(event.status)}</Text>
                  </View>
                </View>
                
                <Text style={styles.eventDescription}>{event.description}</Text>
                
                <View style={styles.eventDetails}>
                  <Text style={styles.detailText}>📅 {new Date(event.startDate).toLocaleDateString()}</Text>
                  <Text style={styles.detailText}>📍 {event.location}</Text>
                  {event.community && (
                    <Text style={styles.detailText}>🎯 {event.community.name}</Text>
                  )}
                </View>

                {/* Show revision request if exists */}
                {(event.facultyRevisionRequest || event.deanRevisionRequest || event.deanshipRevisionRequest) && (
                  <View style={styles.revisionSection}>
                    <Text style={styles.revisionTitle}>📝 Revision Requested</Text>
                    <Text style={styles.revisionText}>
                      {event.facultyRevisionRequest || event.deanRevisionRequest || event.deanshipRevisionRequest}
                    </Text>
                    
                    <TextInput
                      style={styles.revisionInput}
                      placeholder="Your response..."
                      value={revisionResponse[event.id] || ''}
                      onChangeText={(text) => setRevisionResponse({ ...revisionResponse, [event.id]: text })}
                      multiline
                    />
                    
                    <TouchableOpacity
                      style={styles.submitRevisionButton}
                      onPress={() => handleRespondToRevision(event.id)}
                      disabled={submittingRevision === event.id}
                    >
                      {submittingRevision === event.id ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.submitRevisionText}>Submit Response</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Action buttons for Faculty Leaders */}
                {canApproveEvent(event) && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleEventAction('approve', event)}
                    >
                      <Text style={styles.approveBtnText}>✓ Approve</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => setActionModal({ isOpen: true, event, type: 'reject', reason: '' })}
                    >
                      <Text style={styles.rejectBtnText}>✕ Reject</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.revisionBtn]}
                      onPress={() => setActionModal({ isOpen: true, event, type: 'revision', reason: '' })}
                    >
                      <Text style={styles.revisionBtnText}>📝 Request Revision</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Show rejection reason if exists */}
                {(event.facultyRejectionReason || event.deanRejectionReason || event.deanshipRejectionReason) && (
                  <View style={styles.rejectionSection}>
                    <Text style={styles.rejectionTitle}>❌ Rejection Reason</Text>
                    <Text style={styles.rejectionText}>
                      {event.facultyRejectionReason || event.deanRejectionReason || event.deanshipRejectionReason}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Create Event Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>Create New Event</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Event Title *"
                  value={formData.title}
                  onChangeText={(text) => handleInputChange('title', text)}
                />
                
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description *"
                  value={formData.description}
                  onChangeText={(text) => handleInputChange('description', text)}
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.pickerContainer}>
                  <Text style={styles.label}>Community *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {communities.map((community) => (
                      <TouchableOpacity
                        key={community.id}
                        style={[
                          styles.optionButton,
                          formData.communityId === community.id && styles.optionButtonSelected
                        ]}
                        onPress={() => handleInputChange('communityId', community.id)}
                      >
                        <Text style={styles.optionText}>{community.avatar} {community.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.pickerContainer}>
                  <Text style={styles.label}>College *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {colleges.map((college) => (
                      <TouchableOpacity
                        key={college.id}
                        style={[
                          styles.optionButton,
                          formData.collegeId === college.id && styles.optionButtonSelected
                        ]}
                        onPress={() => handleInputChange('collegeId', college.id)}
                      >
                        <Text style={styles.optionText}>{college.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {formData.collegeId && (
                  <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Location *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {locations.map((location) => (
                        <TouchableOpacity
                          key={location.id}
                          style={[
                            styles.optionButton,
                            formData.locationId === location.id && styles.optionButtonSelected
                          ]}
                          onPress={() => handleInputChange('locationId', location.id)}
                        >
                          <Text style={styles.optionText}>{location.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                
                <View style={styles.datePickerContainer}>
                  <Text style={styles.label}>Start Date & Time *</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formData.startDate || '📅 Select Date & Time'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={onStartDateChange}
                    minimumDate={new Date()}
                  />
                )}

                {showStartTimePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="time"
                    display="default"
                    onChange={onStartTimeChange}
                  />
                )}
                
                <View style={styles.datePickerContainer}>
                  <Text style={styles.label}>End Date & Time (Optional)</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formData.endDate || '📅 Select Date & Time'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={onEndDateChange}
                    minimumDate={startDate}
                  />
                )}

                {showEndTimePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="time"
                    display="default"
                    onChange={onEndTimeChange}
                  />
                )}
                
                <TextInput
                  style={styles.input}
                  placeholder="Capacity (optional)"
                  value={formData.capacity}
                  onChangeText={(text) => handleInputChange('capacity', text)}
                  keyboardType="numeric"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={handleCreateEvent}
                  >
                    <Text style={styles.submitButtonText}>Create Event</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Action Modal for Approve/Reject/Revision */}
        <Modal
          visible={actionModal.isOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setActionModal({ isOpen: false, event: null, type: '', reason: '' })}
        >
          <View style={styles.actionModalOverlay}>
            <View style={styles.actionModalContent}>
              <Text style={styles.actionModalTitle}>
                {actionModal.type === 'reject' ? '✕ Reject Event' : '📝 Request Revision'}
              </Text>
              
              <Text style={styles.actionModalSubtitle}>
                {actionModal.type === 'reject' 
                  ? 'Please provide a reason for rejection:' 
                  : 'Please describe what needs to be revised:'}
              </Text>
              
              <TextInput
                style={styles.actionModalInput}
                placeholder={actionModal.type === 'reject' ? 'Rejection reason...' : 'Revision request...'}
                value={actionModal.reason}
                onChangeText={(text) => setActionModal({ ...actionModal, reason: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              
              <View style={styles.actionModalButtons}>
                <TouchableOpacity
                  style={[styles.actionModalButton, styles.actionModalCancelBtn]}
                  onPress={() => setActionModal({ isOpen: false, event: null, type: '', reason: '' })}
                >
                  <Text style={styles.actionModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionModalButton, styles.actionModalSubmitBtn]}
                  onPress={() => handleEventAction(actionModal.type as 'reject' | 'revision')}
                >
                  <Text style={styles.actionModalSubmitText}>
                    {actionModal.type === 'reject' ? 'Reject' : 'Request Revision'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#0064a4',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  eventsList: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  eventDetails: {
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563',
  },
  revisionSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  revisionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 6,
  },
  revisionText: {
    fontSize: 13,
    color: '#78350f',
    marginBottom: 10,
  },
  revisionInput: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fcd34d',
    marginBottom: 10,
    minHeight: 60,
  },
  submitRevisionButton: {
    backgroundColor: '#8b5cf6',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitRevisionText: {
    color: '#fff',
    fontWeight: '600',
  },
  rejectionSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 6,
  },
  rejectionText: {
    fontSize: 13,
    color: '#7f1d1d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#667eea',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#667eea',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: '#d1fae5',
  },
  approveBtnText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '600',
  },
  rejectBtn: {
    backgroundColor: '#fee2e2',
  },
  rejectBtnText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  revisionBtn: {
    backgroundColor: '#ede9fe',
  },
  revisionBtnText: {
    color: '#8b5cf6',
    fontSize: 13,
    fontWeight: '600',
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  actionModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  actionModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  actionModalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  actionModalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 20,
    fontSize: 15,
  },
  actionModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionModalCancelBtn: {
    backgroundColor: '#f3f4f6',
  },
  actionModalCancelText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 15,
  },
  actionModalSubmitBtn: {
    backgroundColor: '#667eea',
  },
  actionModalSubmitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },});