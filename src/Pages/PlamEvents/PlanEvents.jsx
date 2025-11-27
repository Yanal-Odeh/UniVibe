// src/Pages/PlanEvents/PlanEvents.jsx
import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Clock } from 'lucide-react';
import styles from './PlanEvents.module.scss';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

// Mock communities - in real app, fetch from API
const mockCommunities = [
  { id: '1', name: 'Computer Science Club' },
  { id: '2', name: 'Drama Society' },
  { id: '3', name: 'Basketball Team' }
];

const PlanEvents = () => {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Coding Workshop',
      description: 'Learn React and modern web development',
      location: 'Lab 204',
      startDate: '2024-12-20T10:00',
      endDate: '2024-12-20T12:00',
      communityId: '1',
      communityName: 'Computer Science Club',
      status: 'published'
    }
  ]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    communityId: '',
    status: 'draft'
  });
  
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Get real user from auth context
  const { currentAdmin, isLoading } = useAdminAuth();

  // Check if user has permission to plan events
  const userRole = currentAdmin?.role || 'STUDENT';
  const canPlanEvents = userRole === 'CLUB_LEADER' || userRole === 'ADMIN';

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = () => {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.location || 
        !formData.startDate || !formData.communityId) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // In real app, make API call:
    // fetch('/api/events', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify(formData)
    // })
    
    // Mock creating event
    const newEvent = {
      id: Date.now().toString(),
      ...formData,
      communityName: mockCommunities.find(c => c.id === formData.communityId)?.name
    };
    
    setEvents(prev => [...prev, newEvent]);
    showToast('Event created successfully!', 'success');
    setShowModal(false);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      communityId: '',
      status: 'draft'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.planEventsPage}>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Plan Events</h1>
            <p className={styles.subtitle}>Manage and schedule events for your communities</p>
            <p className={styles.roleInfo}>
              Current Role: <span className={styles.roleBadge}>{isLoading ? 'Loading...' : (currentAdmin?.role || 'Guest')}</span>
            </p>
          </div>
          
          {/* Plan Event Button - Only visible to CLUB_LEADER or ADMIN */}
          {canPlanEvents && (
            <button onClick={() => setShowModal(true)} className={styles.planButton}>
              <Calendar size={20} />
              Plan Event
            </button>
          )}
        </div>

        {/* Permission Message for Regular Users */}
        {!canPlanEvents && (
          <div className={styles.permissionAlert}>
            <div className={styles.alertContent}>
              <h3 className={styles.alertTitle}>Access Restricted</h3>
              <p className={styles.alertText}>
                You don't have permission to plan events. Only Club Leaders and Admins can create and manage events.
              </p>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className={styles.eventsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Upcoming Events</h2>
          </div>
          
          <div className={styles.eventsList}>
            {events.length === 0 ? (
              <div className={styles.emptyState}>
                <Calendar className={styles.emptyIcon} size={48} />
                <p className={styles.emptyText}>No events planned yet</p>
                {canPlanEvents && (
                  <p className={styles.emptySubtext}>Click "Plan Event" to create your first event!</p>
                )}
              </div>
            ) : (
              events.map(event => (
                <div key={event.id} className={styles.eventItem}>
                  <div className={styles.eventContent}>
                    <div className={styles.eventHeader}>
                      <h3 className={styles.eventTitle}>{event.title}</h3>
                      <span className={`${styles.statusBadge} ${styles[event.status]}`}>
                        {event.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className={styles.eventDescription}>{event.description}</p>
                    
                    <div className={styles.eventMeta}>
                      <div className={styles.metaItem}>
                        <Users size={16} />
                        <span>{event.communityName}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {canPlanEvents && (
                    <div className={styles.eventActions}>
                      <button 
                        onClick={() => showToast('Edit functionality coming soon!', 'success')}
                        className={styles.editButton}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => showToast('Delete functionality coming soon!', 'success')}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create New Event</h2>
              <button onClick={() => setShowModal(false)} className={styles.closeButton}>
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              {/* Title */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Event Title <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="e.g., Coding Workshop"
                />
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Description <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className={styles.textarea}
                  placeholder="Describe your event in detail..."
                />
              </div>

              {/* Community Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Community <span className={styles.required}>*</span>
                </label>
                <select
                  name="communityId"
                  value={formData.communityId}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">Select a community</option>
                  {mockCommunities.map(community => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Location <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="e.g., Lab 204, Main Hall, Online"
                />
              </div>

              {/* Date & Time */}
              <div className={styles.dateGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Start Date & Time <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    End Date & Time <span className={styles.optional}>(Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Status */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Publish Status</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={handleInputChange}
                      className={styles.radio}
                    />
                    <span>Save as Draft</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={handleInputChange}
                      className={styles.radio}
                    />
                    <span>Publish Immediately</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.modalActions}>
                <button onClick={() => setShowModal(false)} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={handleCreateEvent} className={styles.submitButton}>
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanEvents;