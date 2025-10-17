import React, { useState } from 'react';
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
import events from '../../data/events';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Find event by id from shared data
  const event = events.find(e => String(e.id) === String(id));

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
        <img 
          src={event.image} 
          alt={event.title}
          className={styles.heroImage}
        />

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
                    <span>{event.date}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={18} />
                    <span>{event.time}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <MapPin size={18} />
                    <span>{event.venue}</span>
                  </div>
                  <div className={`${styles.statusBadge} ${styles[getStatusColor(event.status)]}`}>
                    {getStatusIcon(event.status)}
                    <span>{event.status}</span>
                  </div>
                </div>
                <div className={styles.tags}>
                  {event.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      <Tag size={14} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h2 className={styles.sectionTitle}>About This Event</h2>
                <p className={styles.description}>{event.description}</p>
                <p className={styles.description}>{event.fullDescription}</p>
              </div>
            </div>

            {/* Event Schedule */}
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Event Schedule</h2>
              <ul className={styles.scheduleList}>
                {event.schedule.map((item, index) => (
                  <li key={index} className={styles.scheduleItem}>
                    <span className={styles.scheduleTime}>{item.time}</span>
                    <span className={styles.scheduleActivity}>{item.activity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Requirements</h2>
              <ul className={styles.requirementsList}>
                {event.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
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
                    <div className={styles.infoValue}>{event.venue}</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Users size={20} className={styles.infoIcon} />
                  <div className={styles.infoContent}>
                    <div className={styles.infoLabel}>Attendance</div>
                    <div className={styles.infoValue}>
                      {event.registeredCount} / {event.venueCapacity} registered
                    </div>
                    <div className={styles.capacityBar}>
                      <div className={styles.capacityProgress}>
                        <div 
                          className={styles.capacityFill}
                          style={{ width: `${(event.registeredCount / event.venueCapacity) * 100}%` }}
                        ></div>
                      </div>
                      <div className={styles.capacityText}>
                        {((event.registeredCount / event.venueCapacity) * 100).toFixed(0)}% Full
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Tag size={20} className={styles.infoIcon} />
                  <div className={styles.infoContent}>
                    <div className={styles.infoLabel}>Category</div>
                    <div className={styles.infoValue}>{event.category}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Organized By</h3>
              <div className={styles.organizerCard}>
                <img 
                  src={event.organizer.logo} 
                  alt={event.organizer.name}
                  className={styles.organizerLogo}
                />
                <div className={styles.organizerInfo}>
                  <div className={styles.organizerName}>{event.organizer.name}</div>
                  <div className={styles.organizerType}>{event.organizer.type}</div>
                  <div className={styles.organizerContact}>
                    <a href={`mailto:${event.organizer.email}`}>
                      <Mail size={14} />
                      {event.organizer.email}
                    </a>
                    <a href={`tel:${event.organizer.phone}`}>
                      <Phone size={14} />
                      {event.organizer.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Events */}
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Related Events</h3>
              <ul className={styles.relatedEvents}>
                {event.relatedEvents.map((relatedEvent) => (
                  <li key={relatedEvent.id} className={styles.relatedItem}>
                    <div className={styles.relatedTitle}>
                      {relatedEvent.title}
                      <ExternalLink size={16} />
                    </div>
                    <div className={styles.relatedDate}>{relatedEvent.date}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;