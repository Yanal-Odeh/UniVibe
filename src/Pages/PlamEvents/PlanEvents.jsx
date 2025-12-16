// src/Pages/PlanEvents/PlanEvents.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, Clock } from 'lucide-react';
import styles from './PlanEvents.module.scss';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import api from '../../lib/api';

const PlanEvents = () => {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  
  const [colleges, setColleges] = useState([]);
  const [locations, setLocations] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    collegeId: '',
    locationId: '',
    startDate: '',
    endDate: '',
    communityId: '',
    capacity: '',
    status: 'pending_faculty_approval' // Start with pending approval
  });
  
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Get real user from auth context
  const { currentAdmin, isLoading } = useAdminAuth();

  // Check if user has permission to plan events (ONLY CLUB_LEADER)
  const userRole = currentAdmin?.role || 'STUDENT';
  const canPlanEvents = userRole === 'CLUB_LEADER';

  // Fetch events on component mount
  const fetchEvents = async () => {
    try {
      // Clear API cache before fetching to ensure fresh data
      api.clearCache();
      
      // Force fresh data by skipping cache and deduplication
      const response = await api.getEvents({}, true);
      const eventsData = response.events || [];
      
      // Filter to only show events created by the current user
      const myEvents = eventsData.filter(event => {
        return event.createdBy === currentAdmin?.id;
      });
      
      // Map events to include approval status
      const mappedEvents = myEvents.map(event => {
        const approvalStatus = {
          facultyLeader: event.facultyLeaderApproval?.toLowerCase() || 'pending',
          deanOfFaculty: event.deanOfFacultyApproval?.toLowerCase() || 'pending',
          deanshipOfStudentAffairs: event.deanshipApproval?.toLowerCase() || 'pending'
        };
        
        return {
          ...event,
          approvalStatus,
          communityName: event.community?.name || 'Unknown Community'
        };
      });
      
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('Failed to load events', 'error');
    }
  };

  useEffect(() => {
    if (!isLoading && currentAdmin) {
      fetchEvents();
    }
    
    // Set up interval to refresh events every 1 second for instant real-time updates
    const interval = setInterval(() => {
      if (!isLoading && currentAdmin) {
        fetchEvents();
      }
    }, 1000); // Refresh every 1 second for instant updates
    
    // Listen for approval events from other components
    const handleApprovalChange = () => {
      console.log('Approval change detected, refreshing events immediately...');
      fetchEvents();
    };
    
    window.addEventListener('eventApprovalChanged', handleApprovalChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('eventApprovalChanged', handleApprovalChange);
    };
  }, [isLoading, currentAdmin]);

  // Fetch communities from database
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await api.getCommunities();
        const communitiesData = response.communities || response || [];
        setCommunities(Array.isArray(communitiesData) ? communitiesData : []);
      } catch (error) {
        console.error('Error fetching communities:', error);
        showToast('Failed to load communities', 'error');
        setCommunities([]);
      }
    };
    fetchCommunities();
  }, []);

  // Fetch colleges on component mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/colleges');
        if (!response.ok) throw new Error('Failed to fetch colleges');
        const data = await response.json();
        setColleges(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching colleges:', error);
        showToast('Failed to load colleges', 'error');
        setColleges([]);
      }
    };
    fetchColleges();
  }, []);

  // Fetch locations when college is selected
  useEffect(() => {
    if (formData.collegeId) {
      const fetchLocations = async () => {
        setLoadingLocations(true);
        try {
          const response = await fetch(`http://localhost:5000/api/colleges/${formData.collegeId}/locations`);
          if (!response.ok) throw new Error('Failed to fetch locations');
          const data = await response.json();
          setLocations(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error fetching locations:', error);
          showToast('Failed to load locations', 'error');
          setLocations([]);
        } finally {
          setLoadingLocations(false);
        }
      };
      fetchLocations();
    } else {
      setLocations([]);
    }
  }, [formData.collegeId]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // When community is selected, auto-assign its college
      if (name === 'communityId') {
        const selectedCommunity = communities.find(c => c.id === value);
        if (selectedCommunity?.collegeId) {
          return {
            ...prev,
            communityId: value,
            collegeId: selectedCommunity.collegeId,
            locationId: '' // Reset location when college changes
          };
        }
        return { ...prev, communityId: value };
      }
      
      // Reset locationId and communityId when collegeId changes
      if (name === 'collegeId') {
        return { ...prev, [name]: value, locationId: '', communityId: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleCreateEvent = async () => {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.collegeId || 
        !formData.locationId || !formData.startDate || !formData.communityId) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      // Create event via API
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

      const newEvent = response.event;
      
      // Map the event to include approval status
      const mappedEvent = {
        ...newEvent,
        approvalStatus: {
          facultyLeader: newEvent.facultyLeaderApproval?.toLowerCase() || 'pending',
          deanOfFaculty: newEvent.deanOfFacultyApproval?.toLowerCase() || 'pending',
          deanshipOfStudentAffairs: newEvent.deanshipApproval?.toLowerCase() || 'pending'
        },
        communityName: newEvent.community?.name || mockCommunities.find(c => c.id === formData.communityId)?.name
      };
      
      setEvents(prev => [mappedEvent, ...prev]);
      showToast('Event submitted for approval!', 'success');
      setShowModal(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        collegeId: '',
        locationId: '',
        startDate: '',
        endDate: '',
        communityId: '',
        capacity: '',
        status: 'pending_faculty_approval'
      });
    } catch (error) {
      console.error('Error creating event:', error);
      showToast(error.message || 'Failed to create event', 'error');
    }
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

  const getStatusLabel = (status) => {
    const statusLabels = {
      'PENDING_FACULTY_APPROVAL': 'Pending Faculty Leader',
      'PENDING_DEAN_APPROVAL': 'Pending Dean of Faculty',
      'PENDING_DEANSHIP_APPROVAL': 'Pending Deanship',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'pending_faculty_approval': 'Pending Faculty Leader',
      'pending_dean_approval': 'Pending Dean of Faculty',
      'pending_deanship_approval': 'Pending Deanship',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'draft': 'Draft'
    };
    return statusLabels[status] || status;
  };

  const getStatusClass = (status) => {
    const normalizedStatus = status?.toLowerCase() || '';
    if (normalizedStatus === 'approved') return 'approved';
    if (normalizedStatus === 'rejected') return 'rejected';
    if (normalizedStatus.includes('pending')) return 'pending';
    return 'draft';
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      console.log('Deleting event:', eventId);
      await api.deleteEvent(eventId);
      
      // Clear API cache to ensure fresh data on next fetch
      api.clearCache();
      
      // Refetch events from server to ensure we have the latest data
      await fetchEvents();
      
      showToast('Event deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast(error.message || 'Failed to delete event', 'error');
    }
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
                You don't have permission to plan events. Only Club Leaders can create and submit events for approval.
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
                      <span className={`${styles.statusBadge} ${styles[getStatusClass(event.status)]}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </div>
                    
                    <p className={styles.eventDescription}>{event.description}</p>
                    
                    {/* Approval Progress - Show for all events except rejected */}
                    {event.status?.toUpperCase() !== 'REJECTED' && event.approvalStatus && (
                      <div className={styles.approvalProgress}>
                        <h4 className={styles.approvalTitle}>Approval Progress:</h4>
                        <div className={styles.approvalSteps}>
                          <div className={`${styles.approvalStep} ${event.approvalStatus.facultyLeader === 'approved' ? styles.approved : event.approvalStatus.facultyLeader === 'rejected' ? styles.rejected : styles.pending}`}>
                            <span className={styles.stepNumber}>1</span>
                            <span className={styles.stepLabel}>Faculty Leader</span>
                          </div>
                          <div className={styles.approvalArrow}>→</div>
                          <div className={`${styles.approvalStep} ${event.approvalStatus.deanOfFaculty === 'approved' ? styles.approved : event.approvalStatus.deanOfFaculty === 'rejected' ? styles.rejected : styles.pending}`}>
                            <span className={styles.stepNumber}>2</span>
                            <span className={styles.stepLabel}>Dean of Faculty</span>
                          </div>
                          <div className={styles.approvalArrow}>→</div>
                          <div className={`${styles.approvalStep} ${event.approvalStatus.deanshipOfStudentAffairs === 'approved' ? styles.approved : event.approvalStatus.deanshipOfStudentAffairs === 'rejected' ? styles.rejected : styles.pending}`}>
                            <span className={styles.stepNumber}>3</span>
                            <span className={styles.stepLabel}>Deanship of Student Affairs</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
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
                        onClick={() => handleDeleteEvent(event.id)}
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

              {/* College Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  College <span className={styles.required}>*</span>
                </label>
                <select
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">Select a college</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
                </select>
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
                  disabled={!formData.collegeId}
                >
                  <option value="">
                    {!formData.collegeId ? 'Select a college first' : 'Select a community'}
                  </option>
                  {communities
                    .filter(community => community.collegeId === formData.collegeId)
                    .map(community => (
                      <option key={community.id} value={community.id}>
                        {community.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Location Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Location <span className={styles.required}>*</span>
                </label>
                <select
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleInputChange}
                  className={styles.select}
                  disabled={!formData.collegeId || loadingLocations}
                >
                  <option value="">
                    {!formData.collegeId 
                      ? 'Select a college first' 
                      : loadingLocations 
                        ? 'Loading locations...' 
                        : 'Select a location'}
                  </option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} {location.capacity ? `(Capacity: ${location.capacity})` : ''}
                    </option>
                  ))}
                </select>
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

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Maximum Capacity <span className={styles.optional}>(Optional - Leave empty for unlimited)</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    min="1"
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.modalActions}>
                <button onClick={() => setShowModal(false)} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={handleCreateEvent} className={styles.submitButton}>
                  Submit for Approval
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