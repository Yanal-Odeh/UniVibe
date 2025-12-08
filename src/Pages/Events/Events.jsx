import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import api from '../../lib/api';
import Loader from '../../Components/Loader/Loader';
import styles from './Events.module.scss';

// Memoized event card component
const EventCard = React.memo(({ event }) => {
  const eventDate = useMemo(() => new Date(event.startDate), [event.startDate]);
  const formattedDate = useMemo(() => eventDate.toLocaleDateString(), [eventDate]);
  const formattedTime = useMemo(() => 
    eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
    [eventDate]
  );

  return (
    <Link to={`/events/${event.id}`} className={styles.eventCard}>
      <div className={styles.eventInfo}>
        <h3>{event.title}</h3>
        <p>{formattedDate} at {formattedTime}</p>
        <p>{event.location}</p>
        {event.community && (
          <p className={styles.community}>
            <span style={{ marginRight: '0.5rem' }}>{event.community.avatar}</span>
            {event.community.name}
          </p>
        )}
      </div>
    </Link>
  );
});

EventCard.displayName = 'EventCard';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.getEvents();
        setEvents(response.events || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const eventsList = useMemo(() => 
    events.map(event => <EventCard key={event.id} event={event} />),
    [events]
  );

  if (loading) {
    return (
      <div className={styles.eventsPage}>
        <div className={styles.container}>
          <h1>Events</h1>
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.eventsPage}>
        <div className={styles.container}>
          <h1>Events</h1>
          <p style={{ color: 'red' }}>Error loading events: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.eventsPage}>
      <div className={styles.container}>
        <h1>Events</h1>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          Found {events.length} approved event(s)
        </p>
        {events.length === 0 ? (
          <p>No approved events yet. Check back soon!</p>
        ) : (
          <div className={styles.eventsList}>
            {eventsList}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(Events);
