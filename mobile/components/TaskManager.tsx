import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface TaskManagerProps {
  eventId: string;
  isClubLeader: boolean;
  currentUserId: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedTo: {
    id: number;
    firstName: string;
    lastName: string;
  };
  _count: {
    submissions: number;
  };
}

export default function TaskManager({ eventId, isClubLeader, currentUserId }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedToId: '',
  });

  useEffect(() => {
    console.log('=== TaskManager mounted ===');
    console.log('Event ID:', eventId);
    console.log('Is Club Leader:', isClubLeader);
    console.log('Current User ID:', currentUserId);
    fetchTasks();
    if (isClubLeader) {
      fetchMembers();
    }
  }, [eventId]);

  useEffect(() => {
    console.log('=== formData changed ===');
    console.log('formData:', formData);
  }, [formData]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      // Club leaders see all event tasks, members see only their assigned tasks
      const endpoint = isClubLeader 
        ? `${API_BASE_URL}/api/tasks/events/${eventId}/tasks`
        : `${API_BASE_URL}/api/tasks/events/${eventId}/my-tasks`;
      
      console.log('=== Fetching Tasks ===');
      console.log('Endpoint:', endpoint);
      console.log('Is club leader:', isClubLeader);
      console.log('Event ID:', eventId);
      console.log('Current User ID:', currentUserId);
      
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Tasks response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Tasks fetch failed:', response.status, errorText);
        setTasks([]);
        return;
      }
      
      const data = await response.json();
      console.log('Raw tasks data:', JSON.stringify(data, null, 2));
      
      // API returns array directly, not wrapped in object
      const tasksList = Array.isArray(data) ? data : (data.tasks || []);
      console.log('Processed tasks count:', tasksList.length);
      console.log('Tasks list:', tasksList);
      setTasks(tasksList);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tasks/events/${eventId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Members response status:', response.status);
      
      if (!response.ok) {
        console.error('Members fetch failed:', response.status);
        setMembers([]);
        return;
      }
      
      const data = await response.json();
      console.log('Members data received:', data);
      
      // API returns array directly, not wrapped in object
      const membersList = Array.isArray(data) ? data : (data.members || []);
      console.log('Members count:', membersList.length);
      setMembers(membersList);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    }
  };

  const handleCreateTask = async () => {
    console.log('=== handleCreateTask called ===');
    console.log('Form Data before validation:', formData);
    console.log('assignedToId value:', formData.assignedToId);
    console.log('assignedToId type:', typeof formData.assignedToId);
    
    if (!formData.title || !formData.description || !formData.assignedToId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      
      console.log('=== Creating Task ===');
      console.log('Event ID:', eventId);
      console.log('Form Data:', formData);
      console.log('Assigned To ID:', formData.assignedToId);
      console.log('Assigned To ID type:', typeof formData.assignedToId);
      
      const requestBody = {
        title: formData.title,
        description: formData.description,
        assignedToId: formData.assignedToId, // Send as string (CUID)
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/api/tasks/events/${eventId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Task creation response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Task creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create task');
      }

      const result = await response.json();
      console.log('Task created successfully:', result);

      Alert.alert('Success', 'Task created successfully!');
      setShowAddModal(false);
      setFormData({ title: '', description: '', assignedToId: '' });
      
      // Refresh tasks list
      console.log('Refreshing tasks list...');
      await fetchTasks();
    } catch (error: any) {
      console.error('Task creation error:', error);
      Alert.alert('Error', error.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await fetch(`${API_BASE_URL}/api/tasks/tasks/${taskId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchTasks();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/tasks/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const fetchSubmissions = async (taskId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tasks/tasks/${taskId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleShowSubmissions = async (task: Task) => {
    setSelectedTask(task);
    await fetchSubmissions(task.id);
    setShowSubmissionsModal(true);
  };

  const handleUploadSubmission = async (taskId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'video/*', 'application/pdf'],
        multiple: false,
      });

      if (result.type === 'success') {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', {
          uri: result.uri,
          name: result.name,
          type: result.mimeType || 'application/octet-stream',
        } as any);

        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/tasks/tasks/${taskId}/submissions`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        Alert.alert('Success', 'File uploaded successfully!');
        fetchTasks();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'in_progress':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Task Management</Text>
        {isClubLeader && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addButtonText}>+ Add Task</Text>
          </TouchableOpacity>
        )}
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No tasks yet</Text>
          {isClubLeader && <Text style={styles.emptyHint}>Create tasks to assign to members</Text>}
        </View>
      ) : (
        <ScrollView>
          {tasks.map((task) => {
            const isAssignedToMe = task.assignedTo.id === currentUserId;
            return (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {isClubLeader && (
                    <View style={styles.taskActions}>
                      <TouchableOpacity onPress={() => handleDeleteTask(task.id)}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <Text style={styles.taskDescription}>{task.description}</Text>

                <Text style={styles.assignedTo}>
                  Assigned to: {task.assignedTo.firstName} {task.assignedTo.lastName}
                </Text>

                <View style={styles.taskFooter}>
                  <TouchableOpacity
                    style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}
                    onPress={() => {
                      // Only assigned member can change status
                      if (isAssignedToMe) {
                        Alert.alert('Update Status', 'Choose new status:', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Pending', onPress: () => handleUpdateStatus(task.id, 'PENDING') },
                          { text: 'In Progress', onPress: () => handleUpdateStatus(task.id, 'IN_PROGRESS') },
                          { text: 'Completed', onPress: () => handleUpdateStatus(task.id, 'COMPLETED') },
                        ]);
                      }
                    }}
                    disabled={!isAssignedToMe}
                  >
                    <Text style={styles.statusText}>{task.status.replace('_', ' ')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleShowSubmissions(task)}>
                    <Text style={styles.submissionsText}>
                      Student Submissions ({task._count?.submissions || 0})
                    </Text>
                  </TouchableOpacity>
                </View>

                {isAssignedToMe && (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => handleUploadSubmission(task.id)}
                    disabled={uploading}
                  >
                    <Text style={styles.uploadButtonText}>
                      {uploading ? 'Uploading...' : '📤 Upload Submission'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Add Task Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>

            <TextInput
              style={styles.input}
              placeholder="Task Title *"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description *"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Assign to:</Text>
            {members.length === 0 ? (
              <Text style={styles.noMembersText}>Loading members...</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersList}>
                {members.map((member) => {
                  console.log('Rendering member:', member.id, member.firstName, member.lastName);
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberChip,
                        formData.assignedToId === member.id.toString() && styles.memberChipSelected,
                      ]}
                      onPress={() => {
                        console.log('Member selected:', member.id, member.firstName);
                        console.log('Setting assignedToId to:', member.id.toString());
                        setFormData(prev => {
                          const newData = { ...prev, assignedToId: member.id.toString() };
                          console.log('New formData after member selection:', newData);
                          return newData;
                        });
                      }}
                    >
                      <Text style={styles.memberName}>
                        {member.firstName} {member.lastName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleCreateTask}>
                <Text style={styles.submitButtonText}>Create Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Submissions Modal */}
      <Modal visible={showSubmissionsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Submissions for "{selectedTask?.title}"
            </Text>

            {submissions.length === 0 ? (
              <Text style={styles.emptyText}>No submissions yet</Text>
            ) : (
              <ScrollView>
                {submissions.map((submission) => (
                  <View key={submission.id} style={styles.submissionCard}>
                    <Text style={styles.submissionFileName}>{submission.fileName}</Text>
                    <Text style={styles.submissionSize}>
                      {(submission.fileSize / 1024 / 1024).toFixed(2)} MB
                    </Text>
                    <Text style={styles.submissionDate}>
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSubmissionsModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#0064A4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 14,
    color: '#6b7280',
  },
  taskCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  assignedTo: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  submissionsText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  noMembersText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  membersList: {
    marginBottom: 16,
    maxHeight: 50,
  },
  memberChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  memberChipSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  memberName: {
    fontSize: 14,
    color: '#374151',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0064A4',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  submissionCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  submissionFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  submissionSize: {
    fontSize: 12,
    color: '#6b7280',
  },
  submissionDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  closeButton: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
});
