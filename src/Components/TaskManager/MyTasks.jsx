import React, { useState, useEffect } from 'react';
import { Clock, PlayCircle, CheckCircle, Upload, File, Image, Video, Trash2, FileText } from 'lucide-react';
import api from '../../lib/api';
import Loader from '../Loader/Loader';
import styles from './MyTasks.module.scss';

function MyTasks({ eventId, currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState({});
  const [uploadingTaskId, setUploadingTaskId] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  useEffect(() => {
    fetchMyTasks();
  }, [eventId]);

  const fetchMyTasks = async () => {
    try {
      const myTasks = await api.getMyTasks(eventId);
      setTasks(myTasks);
      
      // Fetch submissions for each task
      const submissionsMap = {};
      await Promise.all(
        myTasks.map(async (task) => {
          try {
            const taskSubmissions = await api.getTaskSubmissions(task.id);
            submissionsMap[task.id] = taskSubmissions;
          } catch (error) {
            console.error(`Error fetching submissions for task ${task.id}:`, error);
            submissionsMap[task.id] = [];
          }
        })
      );
      setSubmissions(submissionsMap);
    } catch (error) {
      console.error('Error fetching my tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const originalTasks = [...tasks];
    
    // Optimistic update - update UI immediately
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      await api.updateTaskStatus(taskId, newStatus);
    } catch (error) {
      // Rollback on error
      setTasks(originalTasks);
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className={styles.statusIconCompleted} size={18} />;
      case 'IN_PROGRESS':
        return <PlayCircle className={styles.statusIconInProgress} size={18} />;
      case 'PENDING':
      default:
        return <Clock className={styles.statusIconPending} size={18} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Completed';
      case 'IN_PROGRESS': return 'In Progress';
      case 'PENDING': return 'Pending';
      default: return status;
    }
  };

  const handleFileUpload = async (taskId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('File size must be less than 50MB');
      return;
    }

    setUploadingTaskId(taskId);
    try {
      const newSubmission = await api.uploadTaskSubmission(taskId, file);
      
      // Update submissions state
      setSubmissions(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), newSubmission]
      }));

      // Clear file input
      event.target.value = '';
      
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error.message || 'Failed to upload file');
    } finally {
      setUploadingTaskId(null);
    }
  };

  const handleDeleteSubmission = async (taskId, submissionId) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      await api.deleteTaskSubmission(submissionId);
      
      // Update submissions state
      setSubmissions(prev => ({
        ...prev,
        [taskId]: prev[taskId].filter(s => s.id !== submissionId)
      }));
      
      alert('Submission deleted successfully');
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image size={16} className={styles.fileIcon} />;
    } else if (fileType.startsWith('video/')) {
      return <Video size={16} className={styles.fileIcon} />;
    } else if (fileType === 'application/pdf') {
      return <FileText size={16} className={styles.fileIcon} />;
    } else {
      return <File size={16} className={styles.fileIcon} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const toggleTaskExpand = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader text="Loading your tasks..." />
      </div>
    );
  }

  if (tasks.length === 0) {
    return null; // Don't show anything if no tasks assigned
  }

  return (
    <div className={styles.myTasks}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Tasks</h2>
        <span className={styles.badge}>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
      </div>

      <div className={styles.taskList}>
        {tasks.map(task => {
          const taskSubmissions = submissions[task.id] || [];
          const isExpanded = expandedTaskId === task.id;
          
          return (
            <div key={task.id} className={styles.taskCard}>
              <div className={styles.taskContent}>
                <div className={styles.taskHeader}>
                  <h3 className={styles.taskTitle}>{task.title}</h3>
                  {getStatusIcon(task.status)}
                </div>
                
                {task.description && (
                  <p className={styles.taskDescription}>{task.description}</p>
                )}

                <div className={styles.taskFooter}>
                  <div className={styles.assignedBy}>
                    <span className={styles.label}>Assigned by:</span>
                    <span className={styles.value}>
                      {task.assignedBy.firstName} {task.assignedBy.lastName}
                    </span>
                  </div>

                  <div className={styles.statusControl}>
                    <label htmlFor={`status-${task.id}`}>Status:</label>
                    <select
                      id={`status-${task.id}`}
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`${styles.statusDropdown} ${styles[`status${task.status}`]}`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className={styles.submissionSection}>
                  <div className={styles.submissionHeader}>
                    <h4 className={styles.submissionTitle}>
                      Submissions ({taskSubmissions.length})
                    </h4>
                    <button
                      className={styles.expandButton}
                      onClick={() => toggleTaskExpand(task.id)}
                    >
                      {isExpanded ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {isExpanded && (
                    <>
                      {/* Upload Button */}
                      <div className={styles.uploadArea}>
                        <input
                          type="file"
                          id={`file-upload-${task.id}`}
                          className={styles.fileInput}
                          onChange={(e) => handleFileUpload(task.id, e)}
                          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                          disabled={uploadingTaskId === task.id}
                        />
                        <label 
                          htmlFor={`file-upload-${task.id}`} 
                          className={styles.uploadButton}
                        >
                          <Upload size={18} />
                          {uploadingTaskId === task.id ? 'Uploading...' : 'Upload File'}
                        </label>
                        <span className={styles.uploadHint}>
                          Images, videos, documents (Max 50MB)
                        </span>
                      </div>

                      {/* Submissions List */}
                      {taskSubmissions.length > 0 && (
                        <div className={styles.submissionsList}>
                          {taskSubmissions.map(submission => (
                            <div key={submission.id} className={styles.submissionItem}>
                              <div className={styles.submissionInfo}>
                                {getFileIcon(submission.fileType)}
                                <div className={styles.fileDetails}>
                                  <a
                                    href={api.getFileUrl(submission.fileUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.fileName}
                                  >
                                    {submission.fileName}
                                  </a>
                                  <span className={styles.fileSize}>
                                    {formatFileSize(submission.fileSize)} • {new Date(submission.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <button
                                className={styles.deleteButton}
                                onClick={() => handleDeleteSubmission(task.id, submission.id)}
                                title="Delete submission"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyTasks;
