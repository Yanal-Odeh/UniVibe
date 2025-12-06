import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import api from '../../lib/api';
import Loader from '../../Components/Loader/Loader';
import styles from './Events.module.scss';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.getEvents();
      console.log('API Response:', response);
      const eventsData = response.events || [];
      console.log('All events:', eventsData);
      // Only show approved events
      const approvedEvents = eventsData.filter(event => event.status === 'APPROVED');
      console.log('Approved events:', approvedEvents);
      setEvents(approvedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
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
      <div className={styles.eventsPage}>
        <div className={styles.container}>
          <Loader text="Loading events..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.eventsPage}>
      <div className={styles.container}>
        <h1>Upcoming Events</h1>
        {events.length === 0 ? (
          <div className={styles.noEvents}>
            <p>No upcoming events at the moment.</p>
          </div>
        ) : (
          <div className={styles.eventsList}>
            {events.map(event => (
              <Link key={event.id} to={`/events/${event.id}`} className={styles.eventCard}>
                <div className={styles.eventInfo}>
                  <h3>{event.title}</h3>
                  <div className={styles.eventMeta}>
                    <div className={styles.metaItem}>
                      <Calendar size={16} />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <MapPin size={16} />
                      <span>{event.eventLocation?.name || event.location}</span>
                    </div>
                    {event.capacity && (
                      <div className={styles.metaItem}>
                        <Users size={16} />
                        <span>{event._count?.registrations || 0} / {event.capacity}</span>
                      </div>
                    )}
                  </div>
                  {event.community && (
                    <div className={styles.communityBadge}>
                      <span>{event.community.avatar}</span>
                      <span>{event.community.name}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;
