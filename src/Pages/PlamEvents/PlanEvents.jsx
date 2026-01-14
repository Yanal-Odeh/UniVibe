// src/Pages/PlanEvents/PlanEvents.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, Clock, MessageSquare } from 'lucide-react';
import styles from './PlanEvents.module.scss';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import api from '../../lib/api';
import { 
  getStatusLabel, 
  getStatusClass, 
  formatEventDate,
  mapEventWithApprovalStatus
} from '../../utils/eventHelpers';
import { canPlanEvents as checkCanPlanEvents } from '../../utils/roleHelpers';
import { createToast } from '../../utils/toastHelpers';
import { StatusBadge, RevisionSection } from '../../Components/common';

const PlanEvents = () => {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [revisionResponse, setRevisionResponse] = useState({});
  const [submittingRevision, setSubmittingRevision] = useState(null);
  const [deanshipRevisionResponse, setDeanshipRevisionResponse] = useState({});
  const [submittingDeanshipRevision, setSubmittingDeanshipRevision] = useState(null);
  
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
  const showToast = createToast(setToast);

  // Get real user from auth context
  const { currentAdmin, isLoading } = useAdminAuth();

  // Check if user has permission to plan events (ONLY CLUB_LEADER)
  const userRole = currentAdmin?.role || 'STUDENT';
  const canPlanEvents = checkCanPlanEvents(userRole);

  // Performance: Track fetch metrics
  const fetchMetrics = React.useRef({ count: 0, startTime: Date.now() });
  const isFetchingRef = React.useRef(false);

  // Fetch events - OPTIMIZED: No aggressive cache clearing
  const fetchEvents = async (forceRefresh = false) => {
    // Guard against duplicate requests
    if (isFetchingRef.current) {
      console.log('[Performance] Fetch already in progress, skipping');
      return;
    }

    isFetchingRef.current = true;
    const fetchStart = performance.now();
    fetchMetrics.current.count++;

    try {
      // Only clear cache when explicitly needed (after mutations)
      // Don't clear cache on routine polling
      if (forceRefresh) {
        api.clearCache();
      }
      
      // Use normal caching - respect Cache-Control headers
      // Only force fresh on explicit refresh
      const response = await api.getEvents({}, forceRefresh);
      const eventsData = response.events || [];
      
      // Filter to only show events created by the current user
      const myEvents = eventsData.filter(event => {
        return event.createdBy === currentAdmin?.id;
      });
      
      // Map events to include approval status
      const mappedEvents = myEvents.map(mapEventWithApprovalStatus);
      
      setEvents(mappedEvents);

      // Performance logging
      const duration = (performance.now() - fetchStart).toFixed(1);
      const elapsed = (Date.now() - fetchMetrics.current.startTime) / 60000;
      const rpm = (fetchMetrics.current.count / Math.max(elapsed, 0.1)).toFixed(1);
      console.log(`[Performance] Fetch #${fetchMetrics.current.count}: ${duration}ms | ${rpm} req/min | Cache: ${forceRefresh ? 'BYPASS' : 'USE'}`);
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('Failed to load events', 'error');
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isLoading && currentAdmin) {
      // Initial fetch with force to get fresh data
      fetchEvents(true);
    }
    
    // OPTIMIZED: Poll every 30 seconds instead of 1 second
    // This reduces requests by 97% while still feeling responsive
    const interval = setInterval(() => {
      if (!isLoading && currentAdmin) {
        // Use cache on routine polls - respect server Cache-Control headers
        fetchEvents(false);
      }
    }, 30000); // 30 seconds - balances freshness with performance
    
    // Listen for approval events from other components
    // This provides instant updates after user actions
    const handleApprovalChange = () => {
      console.log('[Performance] Approval event detected - refreshing immediately');
      fetchEvents(true);
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
        const data = await api.getColleges();
        setColleges(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching colleges:', error);
        showToast('Failed to load colleges', 'error');
        setColleges([]);
      }
    };
    fetchColleges();
  }, []);

  // Fetch locations for club leaders automatically, or when college is selected for other roles
  useEffect(() => {
    const fetchLocationsForUser = async () => {
      setLoadingLocations(true);
      try {
        // For club leaders, use their college's locations automatically
        if (userRole === 'CLUB_LEADER') {
          console.log('📍 Fetching locations for club leader...');
          const data = await api.getMyCollegeLocations();
          console.log('📍 Club leader locations fetched:', data);
          setLocations(Array.isArray(data.locations) ? data.locations : []);
          
          // Also log the community and college info
          if (data.collegeName && data.communityName) {
            console.log(`✅ Club: ${data.communityName}, Faculty: ${data.collegeName}, Locations: ${data.locations?.length || 0}`);
          }
        } 
        // For other roles, fetch based on selected college
        else if (formData.collegeId) {
          console.log('📍 Fetching locations for college:', formData.collegeId);
          const data = await api.getCollegeLocations(formData.collegeId);
          console.log('📍 Locations fetched:', data.length, 'locations');
          setLocations(Array.isArray(data) ? data : []);
        } else {
          console.log('📍 No college selected, clearing locations');
          setLocations([]);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        showToast(error.message || 'Failed to load locations', 'error');
        setLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    };

    // Fetch locations when modal opens for club leaders, or when college changes for others
    if (showModal) {
      fetchLocationsForUser();
    }
  }, [formData.collegeId, showModal, userRole]);

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
    // Validate required fields - communityId not required for club leaders
    const requiredFields = ['title', 'description', 'locationId', 'startDate'];
    
    // For non-club leaders, communityId is still required
    if (userRole !== 'CLUB_LEADER') {
      requiredFields.push('communityId');
    }
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      // Prepare event data - for club leaders, communityId will be auto-assigned by backend
      const eventData = {
        title: formData.title,
        description: formData.description,
        locationId: formData.locationId,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      // Only include communityId if user is not a club leader
      if (userRole !== 'CLUB_LEADER') {
        eventData.communityId = formData.communityId;
        eventData.collegeId = formData.collegeId;
      }

      // Create event via API
      const response = await api.createEvent(eventData);

      const newEvent = response.event;
      
      // Optimistic UI: Map the event and add it immediately to state
      const mappedEvent = mapEventWithApprovalStatus(newEvent);
      setEvents(prev => [mappedEvent, ...prev]);
      
      // Clear cache so next poll gets fresh data
      api.clearCache();
      
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

  const formatDate = formatEventDate;

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      console.log('Deleting event:', eventId);
      await api.deleteEvent(eventId);
      
      // Optimistic UI: Remove from state immediately
      setEvents(prev => prev.filter(e => e.id !== eventId));
      
      // Clear cache so next poll gets fresh data
      api.clearCache();
      
      showToast('Event deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast(error.message || 'Failed to delete event', 'error');
    }
  };

  const handleRespondToRevision = async (eventId) => {
    const response = revisionResponse[eventId];
    if (!response || response.trim() === '') {
      showToast('Please provide a response to the dean', 'error');
      return;
    }

    setSubmittingRevision(eventId);
    try {
      await api.respondToRevision(eventId, response);
      
      // Clear API cache and refetch
      api.clearCache();
      await fetchEvents();
      
      // Clear the response field
      setRevisionResponse(prev => ({ ...prev, [eventId]: '' }));
      
      showToast('Response sent and event resubmitted to Dean successfully', 'success');
    } catch (error) {
      console.error('Error responding to revision:', error);
      showToast(error.message || 'Failed to respond to revision request', 'error');
    } finally {
      setSubmittingRevision(null);
    }
  };

  const handleRespondToDeanshipRevision = async (eventId) => {
    const response = deanshipRevisionResponse[eventId];
    if (!response || response.trim() === '') {
      showToast('Please provide a response to the deanship', 'error');
      return;
    }

    setSubmittingDeanshipRevision(eventId);
    try {
      await api.respondToDeanshipRevision(eventId, response);
      
      // Clear API cache and refetch
      api.clearCache();
      await fetchEvents();
      
      // Clear the response field
      setDeanshipRevisionResponse(prev => ({ ...prev, [eventId]: '' }));
      
      showToast('Response sent and event resubmitted to Deanship successfully', 'success');
    } catch (error) {
      console.error('Error responding to deanship revision:', error);
      showToast(error.message || 'Failed to respond to deanship revision request', 'error');
    } finally {
      setSubmittingDeanshipRevision(null);
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
                    
                    {/* Revision Request Section */}
                    {event.status === 'NEEDS_REVISION_DEAN' && event.deanOfFacultyRevisionMessage && (
                      <div className={styles.revisionSection}>
                        <div className={styles.revisionHeader}>
                          <MessageSquare size={18} />
                          <h4>Dean's Revision Request</h4>
                        </div>
                        <div className={styles.revisionMessage}>
                          {event.deanOfFacultyRevisionMessage}
                        </div>
                        {event.facultyLeaderRevisionResponse && (
                          <div className={styles.previousResponse}>
                            <strong>Your Previous Response:</strong>
                            <p>{event.facultyLeaderRevisionResponse}</p>
                          </div>
                        )}
                        <div className={styles.revisionResponseForm}>
                          <textarea
                            value={revisionResponse[event.id] || ''}
                            onChange={(e) => setRevisionResponse(prev => ({
                              ...prev,
                              [event.id]: e.target.value
                            }))}
                            placeholder="Write your response to address the dean's concerns..."
                            rows={4}
                            className={styles.revisionTextarea}
                          />
                          <button
                            onClick={() => handleRespondToRevision(event.id)}
                            disabled={submittingRevision === event.id}
                            className={styles.submitRevisionBtn}
                          >
                            {submittingRevision === event.id ? 'Submitting...' : 'Submit Response & Resubmit to Dean'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Deanship Revision Request Section */}
                    {event.status === 'NEEDS_REVISION_DEANSHIP' && event.deanshipRevisionMessage && (
                      <div className={styles.revisionSection}>
                        <div className={styles.revisionHeader}>
                          <MessageSquare size={18} />
                          <h4>Deanship's Revision Request</h4>
                        </div>
                        <div className={styles.revisionMessage}>
                          {event.deanshipRevisionMessage}
                        </div>
                        {event.deanOfFacultyRevisionResponse && (
                          <div className={styles.previousResponse}>
                            <strong>Your Previous Response:</strong>
                            <p>{event.deanOfFacultyRevisionResponse}</p>
                          </div>
                        )}
                        <div className={styles.revisionResponseForm}>
                          <textarea
                            value={deanshipRevisionResponse[event.id] || ''}
                            onChange={(e) => setDeanshipRevisionResponse(prev => ({
                              ...prev,
                              [event.id]: e.target.value
                            }))}
                            placeholder="Write your response to address the deanship's concerns..."
                            rows={4}
                            className={styles.revisionTextarea}
                          />
                          <button
                            onClick={() => handleRespondToDeanshipRevision(event.id)}
                            disabled={submittingDeanshipRevision === event.id}
                            className={styles.submitRevisionBtn}
                          >
                            {submittingDeanshipRevision === event.id ? 'Submitting...' : 'Submit Response & Resubmit to Deanship'}
                          </button>
                        </div>
                      </div>
                    )}
                    
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

              {/* College Selection - Only show for non-club leaders */}
              {userRole !== 'CLUB_LEADER' && (
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
              )}

              {/* Community Selection - Only show for non-club leaders */}
              {userRole !== 'CLUB_LEADER' && (
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
              )}

              {/* Club Leader Info Message */}
              {userRole === 'CLUB_LEADER' && (
                <div className={styles.infoMessage}>
                  <p>ℹ️ Events will be automatically assigned to your club and college</p>
                </div>
              )}

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
                  disabled={loadingLocations}
                >
                  <option value="">
                    {loadingLocations 
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