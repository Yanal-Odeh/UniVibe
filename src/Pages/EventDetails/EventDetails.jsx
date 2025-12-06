import React, { useState, useEffect } from 'react';
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
<<<<<<< HEAD
=======
  const [loading, setLoading] = useState(true);
>>>>>>> 4dbad2147b9b08f834f954b4483a02f9e581383c
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
<<<<<<< HEAD
    fetchEventDetails();
    fetchCurrentUser();
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const { event: eventData } = await api.getEvent(id);
      setEvent(eventData);

      // Check if user is registered
      const { isRegistered: registered } = await api.checkRegistration(id);
      setIsRegistered(registered);

      // Check if event is saved
      try {
        const { isSaved: saved } = await api.checkSavedEvent(id);
        setIsSaved(saved);
      } catch (error) {
        // User might not be logged in
        setIsSaved(false);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };
=======
    const fetchEvent = async () => {
      try {
        console.log('Fetching event with ID:', id);
        const response = await api.getEvent(id);
        console.log('Event response:', response);
        setEvent(response.event);
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);
>>>>>>> 4dbad2147b9b08f834f954b4483a02f9e581383c

  if (loading) {
    return (
      <div className={styles.eventDetailsPage}>
        <div className={styles.container}>
<<<<<<< HEAD
          <Loader text="Loading event details..." />
=======
          <p>Loading event details...</p>
>>>>>>> 4dbad2147b9b08f834f954b4483a02f9e581383c
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

    try {
      setRegistering(true);
      if (isRegistered) {
        await api.unregisterFromEvent(id);
        setIsRegistered(false);
        // Update count locally without refreshing
        setEvent(prev => ({
          ...prev,
          _count: {
            ...prev._count,
            registrations: (prev._count?.registrations || 1) - 1
          }
        }));
      } else {
        // Check if event is full
        if (event.capacity && event._count.registrations >= event.capacity) {
          alert('Sorry, this event is full');
          return;
        }
        await api.registerForEvent(id);
        setIsRegistered(true);
        // Update count locally without refreshing
        setEvent(prev => ({
          ...prev,
          _count: {
            ...prev._count,
            registrations: (prev._count?.registrations || 0) + 1
          }
        }));
      }
    } catch (error) {
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

    try {
      if (isSaved) {
        await api.unsaveEvent(id);
        setIsSaved(false);
      } else {
        await api.saveEvent(id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving event:', error);
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

<<<<<<< HEAD
=======
        {/* Hero Image */}
        {event.image && (
          <img 
            src={event.image} 
            alt={event.title}
            className={styles.heroImage}
          />
        )}

>>>>>>> 4dbad2147b9b08f834f954b4483a02f9e581383c
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
<<<<<<< HEAD
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={18} />
                    <span>{formatTime(event.startDate)}{event.endDate && ` - ${formatTime(event.endDate)}`}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <MapPin size={18} />
                    <span>{event.eventLocation?.name || event.location}</span>
                  </div>
                  <div className={`${styles.statusBadge} ${styles[getStatusColor(event.status)]}`}>
                    {getStatusIcon(event.status)}
                    <span>{getStatusLabel(event.status)}</span>
                  </div>
                </div>
                {event.community && (
                  <div className={styles.communityBadge}>
                    <span className={styles.communityAvatar}>{event.community.avatar}</span>
                    <span>{event.community.name}</span>
                  </div>
                )}
=======
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={18} />
                    <span>{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
>>>>>>> 4dbad2147b9b08f834f954b4483a02f9e581383c
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
<<<<<<< HEAD
                    <div className={styles.infoValue}>{event.eventLocation?.name || event.location}</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Users size={20} className={styles.infoIcon} />
                  <div className={styles.infoContent}>
                    <div className={styles.infoLabel}>Attendance</div>
                    <div className={styles.infoValue}>
                      {registrationCount} / {event.capacity ?? 'Unlimited'} registered
                    </div>
                    {event.capacity && (
                      <div className={styles.capacityBar}>
                        <div className={styles.capacityProgress}>
                          <div 
                            className={styles.capacityFill}
                            style={{ width: `${(registrationCount / event.capacity) * 100}%` }}
                          ></div>
                        </div>
                        <div className={styles.capacityText}>
                          {((registrationCount / event.capacity) * 100).toFixed(0)}% Full
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {event.community && (
                  <div className={styles.infoItem}>
                    <Users size={20} className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>Organized By</div>
                      <div className={styles.infoValue}>
                        <span style={{ marginRight: '0.5rem' }}>{event.community.avatar}</span>
                        {event.community.name}
=======
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
>>>>>>> 4dbad2147b9b08f834f954b4483a02f9e581383c
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
<<<<<<< HEAD

            {event.creator && (
              <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Event Creator</h3>
                <div className={styles.creatorInfo}>
                  <div className={styles.creatorName}>
                    {event.creator.firstName} {event.creator.lastName}
                  </div>
                  <div className={styles.creatorEmail}>
                    <Mail size={14} />
                    {event.creator.email}
                  </div>
                </div>
              </div>
            )}
=======
>>>>>>> 4dbad2147b9b08f834f954b4483a02f9e581383c
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;