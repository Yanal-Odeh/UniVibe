import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import { Calendar, MapPin, Users } from 'lucide-react';
import api from '../../lib/api';
import Loader from '../../Components/Loader/Loader';
=======
import api from '../../lib/api';
>>>>>>> 4dbad2147b9b08f834f954b4483a02f9e581383c
import styles from './Events.module.scss';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD

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

=======
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log('Fetching events from API...');
        const response = await api.getEvents();
        console.log('API response:', response);
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

>>>>>>> 4dbad2147b9b08f834f954b4483a02f9e581383c
  if (loading) {
    return (
      <div className={styles.eventsPage}>
        <div className={styles.container}>
<<<<<<< HEAD
          <Loader text="Loading events..." />
=======
          <h1>Events</h1>
          <p>Loading events...</p>
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
>>>>>>> 4dbad2147b9b08f834f954b4483a02f9e581383c
        </div>
      </div>
    );
  }

  return (
    <div className={styles.eventsPage}>
      <div className={styles.container}>
<<<<<<< HEAD
        <h1>Upcoming Events</h1>
        {events.length === 0 ? (
          <div className={styles.noEvents}>
            <p>No upcoming events at the moment.</p>
          </div>
=======
        <h1>Events</h1>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          Found {events.length} approved event(s)
        </p>
        {events.length === 0 ? (
          <p>No approved events yet. Check back soon!</p>
>>>>>>> 4dbad2147b9b08f834f954b4483a02f9e581383c
        ) : (
          <div className={styles.eventsList}>
            {events.map(event => (
              <Link key={event.id} to={`/events/${event.id}`} className={styles.eventCard}>
                <div className={styles.eventInfo}>
                  <h3>{event.title}</h3>
<<<<<<< HEAD
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
=======
                  <p>{new Date(event.startDate).toLocaleDateString()} at {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p>{event.location}</p>
                  {event.community && (
                    <p className={styles.community}>
                      <span style={{ marginRight: '0.5rem' }}>{event.community.avatar}</span>
                      {event.community.name}
                    </p>
>>>>>>> 4dbad2147b9b08f834f954b4483a02f9e581383c
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
