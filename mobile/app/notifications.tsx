import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Layout from '@/components/Layout';

export default function NotificationsScreen() {
  const { currentUser, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [actionModal, setActionModal] = useState<any>({ 
    isOpen: false, 
    notification: null, 
    type: '', 
    reason: '' 
  });

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push('/sign-in');
      return;
    }
    
    fetchNotifications();
  }, [isAuthenticated, currentUser]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data.notifications || data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      Alert.alert('Success', 'All notifications marked as read');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'EVENT_PENDING_APPROVAL':
        return '📅';
      case 'EVENT_APPROVED':
        return '✅';
      case 'EVENT_REJECTED':
        return '❌';
      case 'EVENT_NEEDS_REVISION':
        return '📝';
      case 'EVENT_REMINDER':
        return '🔔';
      case 'APPLICATION_APPROVED':
        return '🎉';
      case 'APPLICATION_REJECTED':
        return '❌';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const canApproveEvent = (notification: any) => {
    if (!notification.eventId) return false;
    
    const role = (currentUser?.role || '').toString().toUpperCase();
    
    // Faculty Leader can approve pending events or events needing revision from Dean
    if (role === 'FACULTY_LEADER') {
      return notification.type === 'EVENT_PENDING_APPROVAL' || notification.type === 'EVENT_NEEDS_REVISION';
    }
    
    // Dean of Faculty can approve pending events or events needing revision from Deanship
    if (role === 'DEAN_OF_FACULTY') {
      return notification.type === 'EVENT_PENDING_APPROVAL' || notification.type === 'EVENT_NEEDS_REVISION';
    }
    
    // Deanship can only approve pending events
    if (notification.type === 'EVENT_PENDING_APPROVAL') {
      return role === 'DEANSHIP_OF_STUDENT_AFFAIRS';
    }
    
    return false;
  };

  const canRespondToRevision = (notification: any) => {
    // Club Leaders, Faculty Leaders, and Dean of Faculty can respond to revision requests
    if (!notification.eventId) return false;
    const role = (currentUser?.role || '').toString().toUpperCase();
    const isRevisionNotification = notification.type === 'EVENT_NEEDS_REVISION';
    
    console.log('🔍 Checking respond button:', {
      notificationId: notification.id,
      role,
      type: notification.type,
      isRevisionNotification,
      read: notification.read
    });
    
    // Allow all roles in the approval chain to respond to revisions
    return (
      role === 'CLUB_LEADER' || 
      role === 'FACULTY_LEADER' || 
      role === 'DEAN_OF_FACULTY'
    ) && isRevisionNotification;
  };

  const extractRevisionReason = (message: string) => {
    // Extract the reason/response after "requests revision" or "Response:"
    // For revision requests: "...requests revision for event "title": reason"
    // For responses: "...resubmitted it for your review. Response: text"
    // For club leader responses stored: "Club Leader Response: text" or "Name's Response: text"
    
    if (message.includes('Club Leader Response:')) {
      const match = message.match(/Club Leader Response:\s*(.+)$/);
      return match ? match[1] : message;
    }
    
    // Handle user name's response format (e.g., "John's Response:")
    if (message.includes("'s Response:")) {
      const match = message.match(/([^']+)'s Response:\s*(.+)$/);
      return match ? match[2] : message;
    }
    
    if (message.includes('Response:')) {
      const match = message.match(/Response:\s*(.+)$/);
      return match ? match[1] : message;
    }
    
    const match = message.match(/:\s*(.+)$/);
    return match ? match[1] : message;
  };
  
  const extractResponderName = (message: string) => {
    // Extract the name of the person who responded
    // Format: "Name has responded to your revision request..."
    const match = message.match(/^([^\s]+(?:\s+[^\s]+)*?)\s+has responded to your revision request/);
    return match ? match[1] : 'Submitter';
  };

  const handleRevisionResponse = async (notification: any) => {
    if (!notification || !notification.eventId) {
      Alert.alert('Error', 'Invalid notification');
      return;
    }

    // Open modal for club leader to respond
    setActionModal({ 
      isOpen: true, 
      notification, 
      type: 'respond', 
      reason: '' 
    });
  };

  const handleEventAction = async (action: 'approve' | 'reject' | 'revision' | 'respond', notification?: any) => {
    const notif = notification || actionModal.notification;
    const { reason } = actionModal;
    
    if (!notif || !notif.eventId) {
      Alert.alert('Error', 'Invalid notification');
      return;
    }
    
    // Mark notification as read immediately to hide buttons
    if (!notif.read) {
      await handleMarkAsRead(notif.id);
    }
    
    if ((action === 'reject' || action === 'revision' || action === 'respond') && !reason.trim()) {
      Alert.alert('Error', 'Please provide a reason');
      return;
    }

    try {
      const role = (currentUser?.role || '').toString().toUpperCase();
      
      // Handle responding to revision
      if (action === 'respond') {
        // Check if this notification has already been responded to by checking if it's read
        if (notif.read && !notif.message.includes('resubmitted')) {
          Alert.alert('Already Responded', 'This revision request has already been responded to.');
          setActionModal({ isOpen: false, notification: null, type: '', reason: '' });
          fetchNotifications();
          return;
        }
        
        // Dean of Faculty responding to Deanship revision uses a different endpoint
        if (role === 'DEAN_OF_FACULTY' && (notif.message.includes('Deanship') || notif.message.includes('deanship'))) {
          await api.respondToDeanshipRevision(notif.eventId, { response: reason });
        } else {
          // Club Leader or Faculty Leader responding to regular revision
          await api.respondToRevision(notif.eventId, { response: reason });
        }
        Alert.alert('Success', 'Response submitted successfully!');
      } 
      // Handle approval
      else if (action === 'approve') {
        if (role === 'FACULTY_LEADER') {
          await api.approveFacultyLeader(notif.eventId, { approved: true });
        } else if (role === 'DEAN_OF_FACULTY') {
          await api.approveDeanOfFaculty(notif.eventId, { approved: true });
        } else if (role === 'DEANSHIP_OF_STUDENT_AFFAIRS') {
          await api.approveDeanship(notif.eventId, { approved: true });
        }
        Alert.alert('Success', 'Event approved!');
      }
      // Handle revision request (send back for changes)
      else if (action === 'revision') {
        const data = { approved: false, reason: reason };
        if (role === 'FACULTY_LEADER') {
          await api.approveFacultyLeader(notif.eventId, data);
        } else if (role === 'DEAN_OF_FACULTY') {
          await api.approveDeanOfFaculty(notif.eventId, data);
        } else if (role === 'DEANSHIP_OF_STUDENT_AFFAIRS') {
          await api.approveDeanship(notif.eventId, data);
        }
        Alert.alert('Success', 'Revision requested!');
      }
      // Handle permanent rejection
      else if (action === 'reject') {
        const data = { reason };
        if (role === 'FACULTY_LEADER') {
          await api.rejectFacultyLeader(notif.eventId, data);
        } else if (role === 'DEAN_OF_FACULTY') {
          await api.rejectDeanOfFaculty(notif.eventId, data);
        } else if (role === 'DEANSHIP_OF_STUDENT_AFFAIRS') {
          await api.rejectDeanship(notif.eventId, data);
        }
        Alert.alert('Success', 'Event rejected!');
      }
      
      setActionModal({ isOpen: false, notification: null, type: '', reason: '' });
      fetchNotifications();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to process action');
    }
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0064A4" />
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          {notifications.some(n => !n.read) && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>You'll see updates here</Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.notificationCardUnread
                ]}
              >
                <TouchableOpacity
                  style={styles.notificationMain}
                  onPress={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification.id);
                    }
                    // Navigate to relevant screen if needed
                    if (notification.eventId) {
                      router.push('/admin-panel');
                    }
                  }}
                >
                  <View style={styles.notificationIcon}>
                    <Text style={styles.iconText}>
                      {getNotificationIcon(notification.type)}
                    </Text>
                  </View>
                  
                  <View style={styles.notificationContent}>
                    <Text style={[
                      styles.notificationMessage,
                      !notification.read && styles.notificationMessageUnread
                    ]}>
                      {notification.message}
                    </Text>
                    
                    {/* Show revision reason prominently for revision requests */}
                    {notification.type === 'EVENT_NEEDS_REVISION' && (
                      <View style={styles.revisionReasonBox}>
                        <Text style={styles.revisionReasonLabel}>📝 Revision Reason:</Text>
                        <Text style={styles.revisionReasonText}>
                          {extractRevisionReason(notification.message)}
                        </Text>
                      </View>
                    )}
                    
                    {/* Show both revision reason and response for resubmitted events */}
                    {notification.type === 'EVENT_PENDING_APPROVAL' && notification.message.includes('responded to your revision request') && (
                      <>
                        {/* Extract and show original revision from message */}
                        {notification.message.includes('Response:') && (
                          <View style={styles.responseBox}>
                            <Text style={styles.responseLabel}>💬 Response from {extractResponderName(notification.message)}:</Text>
                            <Text style={styles.responseText}>
                              {extractRevisionReason(notification.message)}
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                    
                    <Text style={styles.notificationTime}>
                      {formatDate(notification.createdAt)}
                    </Text>
                  </View>

                  {!notification.read && (
                    <View style={styles.unreadDot} />
                  )}
                </TouchableOpacity>

                {/* Action buttons for event approvals - only show for unread notifications */}
                {!notification.read && canApproveEvent(notification) && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => {
                        if (notification && notification.eventId) {
                          handleEventAction('approve', notification);
                        }
                      }}
                    >
                      <Text style={styles.approveBtnText}>✓ Approve</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => {
                        if (notification && notification.eventId) {
                          setActionModal({ 
                            isOpen: true, 
                            notification, 
                            type: 'reject', 
                            reason: '' 
                          });
                        }
                      }}
                    >
                      <Text style={styles.rejectBtnText}>✕ Reject</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.revisionBtn]}
                      onPress={() => {
                        if (notification && notification.eventId) {
                          setActionModal({ 
                            isOpen: true, 
                            notification, 
                            type: 'revision', 
                            reason: '' 
                          });
                        }
                      }}
                    >
                      <Text style={styles.revisionBtnText}>📝 Revision</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Button for club leaders, faculty leaders, and deans to respond to revision requests */}
                {canRespondToRevision(notification) && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.respondBtn]}
                      onPress={() => handleRevisionResponse(notification)}
                    >
                      <Text style={styles.respondBtnText}>📝 Respond to Revision</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Action Modal */}
        <Modal
          visible={actionModal.isOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setActionModal({ isOpen: false, notification: null, type: '', reason: '' })}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {actionModal.type === 'reject' ? '✕ Reject Event' : 
                 actionModal.type === 'respond' ? '📝 Respond to Revision' : 
                 '📝 Request Revision'}
              </Text>
              
              {/* Show original revision request for 'respond' type */}
              {actionModal.type === 'respond' && actionModal.notification && (
                <View style={styles.originalRequestBox}>
                  <Text style={styles.originalRequestLabel}>Original Revision Request:</Text>
                  <Text style={styles.originalRequestText}>
                    {actionModal.notification.message}
                  </Text>
                </View>
              )}
              
              <TextInput
                style={styles.modalInput}
                placeholder={
                  actionModal.type === 'reject' 
                    ? 'Provide rejection reason...' 
                    : actionModal.type === 'respond'
                    ? 'Describe what you changed or your response...'
                    : 'Describe what needs to be changed...'
                }
                value={actionModal.reason}
                onChangeText={(text) => setActionModal({ ...actionModal, reason: text })}
                multiline
                numberOfLines={4}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setActionModal({ isOpen: false, notification: null, type: '', reason: '' })}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalBtn, styles.submitBtn]}
                  onPress={() => handleEventAction(actionModal.type as any)}
                >
                  <Text style={styles.submitBtnText}>
                    {actionModal.type === 'reject' ? 'Reject' : 
                     actionModal.type === 'respond' ? 'Submit Response' : 
                     'Request Revision'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#0064A4',
  },
  markAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationCardUnread: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#0064A4',
  },
  notificationMain: {
    flexDirection: 'row',
    padding: 16,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationMessageUnread: {
    color: '#111827',
    fontWeight: '500',
  },
  revisionReasonBox: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  revisionReasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  revisionReasonText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18,
    fontWeight: '500',
  },
  responseBox: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 18,
    fontWeight: '500',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0064A4',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: '#d1fae5',
  },
  approveBtnText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectBtn: {
    backgroundColor: '#fee2e2',
  },
  rejectBtnText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  revisionBtn: {
    backgroundColor: '#ede9fe',
  },
  revisionBtnText: {
    color: '#0064A4',
    fontSize: 12,
    fontWeight: '600',
  },
  respondBtn: {
    backgroundColor: '#dbeafe',
  },
  respondBtnText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  originalRequestBox: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  originalRequestLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  originalRequestText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f3f4f6',
  },
  cancelBtnText: {
    color: '#374151',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#0064A4',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
