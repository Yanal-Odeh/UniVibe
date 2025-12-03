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
  Phone
} from 'lucide-react';
import styles from './EventDetails.module.scss';
import api from '../../lib/api';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
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

  if (loading) {
    return (
      <div className={styles.eventDetailsPage}>
        <div className={styles.container}>
          <p>Loading event details...</p>
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

  const handleRegister = () => {
    setIsRegistered(!isRegistered);
    // Add your registration logic here
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // Add your save logic here
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
      case 'Approved': return 'green';
      case 'Pending': return 'yellow';
      case 'Rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved': return <CheckCircle size={16} />;
      case 'Pending': return <AlertCircle size={16} />;
      case 'Rejected': return <XCircle size={16} />;
      default: return null;
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
                <button 
                  className={`${styles.btn} ${styles.btnPrimary} ${isRegistered ? styles.registered : ''}`}
                  onClick={handleRegister}
                >
                  {isRegistered ? (
                    <>
                      <CheckCircle size={20} />
                      Registered
                    </>
                  ) : (
                    <>
                      <Users size={20} />
                      Register Now
                    </>
                  )}
                </button>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;