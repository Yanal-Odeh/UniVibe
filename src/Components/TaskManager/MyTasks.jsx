import React, { useState, useEffect } from 'react';
import { Clock, PlayCircle, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import styles from './MyTasks.module.scss';

function MyTasks({ eventId, currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTasks();
  }, [eventId]);

  const fetchMyTasks = async () => {
    try {
      const myTasks = await api.getMyTasks(eventId);
      setTasks(myTasks);
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

  if (loading) {
    return <div className={styles.loading}>Loading your tasks...</div>;
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
        {tasks.map(task => (
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyTasks;
