import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Tag, 
  Share2, 
  Bookmark,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ExternalLink,
  Mail,
  Phone,
  UserCheck,
  UserX
} from 'lucide-react';
import Loader from '../../Components/Loader/Loader';
import styles from './EventDetails.module.scss';
import api from '../../lib/api';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const user = await api.getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.getEvent(id);
        setEvent(response.event);
        
        // Check if user is registered and if event is saved
        if (currentUser) {
          try {
            const registrationCheck = await api.checkRegistration(id);
            setIsRegistered(registrationCheck.isRegistered);

            const savedCheck = await api.checkSavedEvent(id);
            setIsSaved(savedCheck.isSaved);
          } catch (error) {
            console.error('Failed to check registration/saved status:', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, currentUser]);

  // Memoize formatted dates
  const eventDates = useMemo(() => {
    if (!event) return null;
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    return {
      formattedDate: startDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      formattedTime: startDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      formattedEndTime: endDate ? endDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : null
    };
  }, [event]);


  if (loading) {
    return (
      <div className={styles.eventDetailsPage}>
        <div className={styles.container}>
          <Loader />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.eventDetailsPage}>
        <div className={styles.container}>
          <div className={styles.backButton} onClick={() => navigate('/events')}>
            <ChevronLeft size={20} />
            Back to Events
          </div>
          <div className={styles.notFound}>
            <h2>Event not found</h2>
            <p>The event you are looking for does not exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const registrationCount = event._count?.registrations || 0;
  const isEventFull = event.capacity && registrationCount >= event.capacity;
  const isEventApproved = event.status === 'APPROVED';

  const handleRegister = async () => {
    if (!currentUser) {
      alert('Please sign in to register for events');
      navigate('/signin');
      return;
    }

    // Check if user is a student
    if (currentUser.role !== 'STUDENT') {
      alert('Only students can register for events');
      return;
    }

    if (registering) return;

    // Check if event is full before attempting to register
    if (!isRegistered && event.capacity && event._count.registrations >= event.capacity) {
      alert('Sorry, this event is full');
      return;
    }

    const wasRegistered = isRegistered;
    const previousCount = event._count?.registrations || 0;

    try {
      setRegistering(true);
      
      // Optimistic update - update UI immediately
      setIsRegistered(!wasRegistered);
      setEvent(prev => ({
        ...prev,
        _count: {
          ...prev._count,
          registrations: wasRegistered ? previousCount - 1 : previousCount + 1
        }
      }));

      // Make API call in background
      if (wasRegistered) {
        await api.unregisterFromEvent(id);
      } else {
        await api.registerForEvent(id);
      }
    } catch (error) {
      // Rollback on error
      setIsRegistered(wasRegistered);
      setEvent(prev => ({
        ...prev,
        _count: {
          ...prev._count,
          registrations: previousCount
        }
      }));
      alert(error.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    const wasSaved = isSaved;

    try {
      // Optimistic update - update UI immediately
      setIsSaved(!wasSaved);

      // Make API call in background
      if (wasSaved) {
        await api.unsaveEvent(id);
      } else {
        await api.saveEvent(id);
      }
    } catch (error) {
      // Rollback on error
      setIsSaved(wasSaved);
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleShare = () => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      alert('Share functionality would open here');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'green';
      case 'PENDING_FACULTY_APPROVAL':
      case 'PENDING_DEAN_APPROVAL':
      case 'PENDING_DEANSHIP_APPROVAL':
        return 'yellow';
      case 'REJECTED': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'APPROVED': return <CheckCircle size={16} />;
      case 'PENDING_FACULTY_APPROVAL':
      case 'PENDING_DEAN_APPROVAL':
      case 'PENDING_DEANSHIP_APPROVAL':
        return <AlertCircle size={16} />;
      case 'REJECTED': return <XCircle size={16} />;
      default: return null;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'APPROVED': return 'Approved';
      case 'PENDING_FACULTY_APPROVAL': return 'Pending Faculty Approval';
      case 'PENDING_DEAN_APPROVAL': return 'Pending Dean Approval';
      case 'PENDING_DEANSHIP_APPROVAL': return 'Pending Deanship Approval';
      case 'REJECTED': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className={styles.eventDetailsPage}>
      <div className={styles.container}>
        {/* Back Button */}
        <div className={styles.backButton} onClick={() => navigate('/events')}>
          <ChevronLeft size={20} />
          Back to Events
        </div>

{/* Hero Image */}
        {event.image && (
          <img 
            src={event.image} 
            alt={event.title}
            className={styles.heroImage}
          />
        )}


        {/* Main Grid */}
        <div className={styles.mainGrid}>
          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* Event Header */}
            <div className={styles.card}>
              <div className={styles.header}>
                <h1 className={styles.title}>{event.title}</h1>
                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <Calendar size={18} />
<span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={18} />
                    <span>
                      {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {event.endDate && (
                        <> - {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                      )}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <MapPin size={18} />
                    <span>{event.location}</span>
                  </div>
                  {event.community && (
                    <div className={styles.metaItem}>
                      <span style={{ marginRight: '0.5rem' }}>{event.community.avatar}</span>
                      <span>{event.community.name}</span>
                    </div>
                  )}
                </div>

              </div>

              <div>
                <h2 className={styles.sectionTitle}>About This Event</h2>
                <p className={styles.description}>{event.description}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            {/* Action Buttons */}
            <div className={styles.card}>
              <div className={styles.actionButtons}>
                {!currentUser && isEventApproved && (
                  <button 
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => navigate('/signin')}
                  >
                    <Users size={20} />
                    Sign In to Register
                  </button>
                )}
                {currentUser && currentUser.role !== 'STUDENT' && isEventApproved && (
                  <div className={styles.notApprovedMessage}>
                    <AlertCircle size={20} />
                    <span>Only students can register for events</span>
                  </div>
                )}
                {currentUser && currentUser.role === 'STUDENT' && isEventApproved && (
                  <button 
                    className={`${styles.btn} ${styles.btnPrimary} ${isRegistered ? styles.registered : ''} ${isEventFull && !isRegistered ? styles.disabled : ''}`}
                    onClick={handleRegister}
                    disabled={registering || (isEventFull && !isRegistered) || !isEventApproved}
                  >
                    {registering ? (
                      <>
                        Loading...
                      </>
                    ) : isRegistered ? (
                      <>
                        <UserCheck size={20} />
                        Registered - Click to Cancel
                      </>
                    ) : isEventFull ? (
                      <>
                        <UserX size={20} />
                        Event is Full
                      </>
                    ) : (
                      <>
                        <Users size={20} />
                        Register Now
                      </>
                    )}
                  </button>
                )}
                {!isEventApproved && (
                  <div className={styles.notApprovedMessage}>
                    <AlertCircle size={20} />
                    <span>Registration will be available once the event is approved</span>
                  </div>
                )}
                <button 
                  className={`${styles.btn} ${styles.btnSecondary} ${isSaved ? styles.saved : ''}`}
                  onClick={handleSave}
                >
                  <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Saved' : 'Save Event'}
                </button>
                <button 
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={handleShare}
                >
                  <Share2 size={20} />
                  Share
                </button>
              </div>
            </div>

            {/* Event Info */}
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Event Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <MapPin size={20} className={styles.infoIcon} />
                  <div className={styles.infoContent}>
                    <div className={styles.infoLabel}>Venue</div>
<div className={styles.infoValue}>{event.location}</div>
                  </div>
                </div>

                {event.community && (
                  <div className={styles.infoItem}>
                    <Users size={20} className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>Organized By</div>
                      <div className={styles.infoValue}>{event.community.name}</div>
                    </div>
                  </div>
                )}

                {event.creator && (
                  <div className={styles.infoItem}>
                    <Tag size={20} className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>Created By</div>
                      <div className={styles.infoValue}>
                        {event.creator.firstName} {event.creator.lastName}

                      </div>
                    </div>
                  </div>
                )}

                {event.capacity && (
                  <div className={styles.infoItem}>
                    <Users size={20} className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>Capacity</div>
                      <div className={styles.infoValue}>
                        {registrationCount} / {event.capacity} registered
                      </div>
                      <div className={styles.capacityBar}>
                        <div 
                          className={styles.capacityFill}
                          style={{ 
                            width: `${Math.min((registrationCount / event.capacity) * 100, 100)}%`,
                            backgroundColor: registrationCount >= event.capacity ? '#ef4444' : 
                                           registrationCount >= event.capacity * 0.8 ? '#f59e0b' : '#10b981'
                          }}
                        />
                      </div>
                      {registrationCount >= event.capacity ? (
                        <div className={styles.capacityWarning} style={{ color: '#ef4444' }}>
                          Event is full
                        </div>
                      ) : registrationCount >= event.capacity * 0.8 ? (
                        <div className={styles.capacityWarning} style={{ color: '#f59e0b' }}>
                          {event.capacity - registrationCount} spots left!
                        </div>
                      ) : (
                        <div className={styles.capacityWarning} style={{ color: '#10b981' }}>
                          {event.capacity - registrationCount} spots available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;