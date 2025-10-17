import React from 'react';
import { Link } from 'react-router-dom';
import events from '../../data/events';
import styles from './Events.module.scss';

function Events() {
  return (
    <div className={styles.eventsPage}>
      <div className={styles.container}>
        <h1>Events</h1>
        <div className={styles.eventsList}>
          {events.map(event => (
            <Link key={event.id} to={`/events/${event.id}`} className={styles.eventCard}>
              <div className={styles.eventInfo}>
                <h3>{event.title}</h3>
                <p>{new Date(event.date).toLocaleDateString()} — {event.time}</p>
                <p>{event.venue}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Events;
