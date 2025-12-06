import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Bookmark, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import Loader from '../../Components/Loader/Loader';
import styles from './SavedEvents.module.scss';

function SavedEvents() {
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedEvents();
  }, []);

  const fetchSavedEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getMySavedEvents();
      setSavedEvents(data);
    } catch (error) {
      console.error('Error fetching saved events:', error);
      if (error.message.includes('Authentication required')) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (eventId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Remove this event from saved?')) return;

    try {
      await api.unsaveEvent(eventId);
      setSavedEvents(prev => prev.filter(saved => saved.eventId !== eventId));
    } catch (error) {
      console.error('Error removing saved event:', error);
      alert('Failed to remove event');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className={styles.savedEventsPage}>
        <div className={styles.container}>
          <Loader text="Loading saved events..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.savedEventsPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Bookmark size={32} />
            <h1>My Saved Events</h1>
          </div>
          <p className={styles.subtitle}>Events you've bookmarked for later</p>
        </div>

        {savedEvents.length === 0 ? (
          <div className={styles.noEvents}>
            <Bookmark size={48} />
            <p>No saved events yet</p>
            <Link to="/events" className={styles.browseLink}>
              Browse Events
            </Link>
          </div>
        ) : (
          <div className={styles.eventsList}>
            {savedEvents.map(({ event, savedAt }) => (
              <Link key={event.id} to={`/events/${event.id}`} className={styles.eventCard}>
                <div className={styles.eventHeader}>
                  <h3>{event.title}</h3>
                  <button
                    className={styles.unsaveBtn}
                    onClick={(e) => handleUnsave(event.id, e)}
                    title="Remove from saved"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <p className={styles.description}>{event.description}</p>

                <div className={styles.eventMeta}>
                  <div className={styles.metaItem}>
                    <Calendar size={16} />
                    <span>{formatDate(event.startDate)} at {formatTime(event.startDate)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <MapPin size={16} />
                    <span>{event.eventLocation?.name || event.location}</span>
                  </div>
                  {event.capacity && (
                    <div className={styles.metaItem}>
                      <Users size={16} />
                      <span>{event._count?.registrations || 0} / {event.capacity} registered</span>
                    </div>
                  )}
                </div>

                {event.community && (
                  <div className={styles.communityBadge}>
                    <span>{event.community.avatar}</span>
                    <span>{event.community.name}</span>
                  </div>
                )}

                <div className={styles.savedDate}>
                  Saved on {formatDate(savedAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedEvents;
