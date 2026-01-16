import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  X 
} from 'lucide-react';
import api from '../../lib/api';
import styles from './TaskManager.module.scss';

function TaskManager({ eventId, currentUser, event }) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedToId: '',
  });

  // Check if current user is the club leader of this event's community
  const isClubLeader = event?.community?.clubLeaderId === currentUser?.id;

  useEffect(() => {
    if (isClubLeader) {
      fetchTasks();
      fetchMembers();
    }
  }, [eventId, isClubLeader]);

  const fetchTasks = async () => {
    try {
      const tasks = await api.getEventTasks(eventId);
      setTasks(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const members = await api.getCommunityMembers(eventId);
      setMembers(members);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.assignedToId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingTask) {
        const updatedTask = await api.updateTask(editingTask.id, formData);
        setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
      } else {
        const newTask = await api.createTask(eventId, formData);
        setTasks([newTask, ...tasks]);
      }
      
      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', assignedToId: '' });
    } catch (error) {
      console.error('Error saving task:', error);
      alert(error.message || 'Failed to save task');
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
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

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      assignedToId: task.assignedToId,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', assignedToId: '' });
    setShowModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className={styles.statusIconCompleted} size={16} />;
      case 'IN_PROGRESS':
        return <PlayCircle className={styles.statusIconInProgress} size={16} />;
      case 'PENDING':
      default:
        return <Clock className={styles.statusIconPending} size={16} />;
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

  if (!isClubLeader) {
    return null;
  }

  if (loading) {
    return <div className={styles.loading}>Loading tasks...</div>;
  }

  return (
    <div className={styles.taskManager}>
      <div className={styles.header}>
        <h2 className={styles.title}>Task Management</h2>
        <button 
          className={styles.addButton}
          onClick={openCreateModal}
        >
          <Plus size={20} />
          Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tasks assigned yet. Create tasks to organize your event!</p>
        </div>
      ) : (
        <div className={styles.taskList}>
          {tasks.map(task => (
            <div key={task.id} className={styles.taskCard}>
              <div className={styles.taskHeader}>
                <div className={styles.taskInfo}>
                  <h3 className={styles.taskTitle}>{task.title}</h3>
                  {task.description && (
                    <p className={styles.taskDescription}>{task.description}</p>
                  )}
                </div>
                <div className={styles.taskActions}>
                  <button 
                    className={styles.iconButton}
                    onClick={() => openEditModal(task)}
                    title="Edit task"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className={styles.iconButton}
                    onClick={() => handleDelete(task.id)}
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.taskFooter}>
                <div className={styles.assignee}>
                  <span className={styles.label}>Assigned to:</span>
                  <span className={styles.value}>
                    {task.assignedTo.firstName} {task.assignedTo.lastName}
                  </span>
                </div>
                
                <div className={styles.statusSelector}>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`${styles.statusDropdown} ${styles[`status${task.status}`]}`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  {getStatusIcon(task.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Task Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Set up registration booth"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any additional details or instructions..."
                  rows={4}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="assignedToId">Assign to *</label>
                <select
                  id="assignedToId"
                  value={formData.assignedToId}
                  onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  required
                >
                  <option value="">Select a member...</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskManager;
