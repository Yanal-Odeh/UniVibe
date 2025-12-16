import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Bookmark, CheckCircle, Search } from 'lucide-react';
import api from '../../lib/api';
import Loader from '../../Components/Loader/Loader';
import styles from './Events.module.scss';

// Memoized event card component
const EventCard = React.memo(({ event }) => {
  const eventDate = useMemo(() => new Date(event.startDate), [event.startDate]);
  const eventEndDate = useMemo(() => new Date(event.endDate || event.startDate), [event.endDate, event.startDate]);
  const formattedDate = useMemo(() => eventDate.toLocaleDateString(), [eventDate]);
  const formattedTime = useMemo(() => 
    eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
    [eventDate]
  );

  const registrationCount = event._count?.registrations || 0;
  const isEventFull = event.capacity && registrationCount >= event.capacity;
  const spotsLeft = event.capacity ? event.capacity - registrationCount : null;
  const isPastEvent = eventEndDate < new Date();

  return (
    <Link to={`/events/${event.id}`} className={`${styles.eventCard} ${isPastEvent ? styles.pastEventCard : ''}`}>
      {isPastEvent && <div className={styles.pastEventBadge}>Completed</div>}
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
        {event.capacity && !isPastEvent && (
          <div className={styles.capacityInfo}>
            <Users size={16} />
            <span className={styles.capacityText}>
              {registrationCount} / {event.capacity}
            </span>
            {isEventFull ? (
              <span className={styles.fullBadge}>Full</span>
            ) : spotsLeft <= 5 ? (
              <span className={styles.limitedBadge}>{spotsLeft} left</span>
            ) : null}
          </div>
        )}
        {event.capacity && isPastEvent && (
          <div className={styles.capacityInfo}>
            <Users size={16} />
            <span className={styles.capacityText}>
              {registrationCount} attended
            </span>
          </div>
        )}
      </div>
    </Link>
  );
});

EventCard.displayName = 'EventCard';

function Events() {
  const [allEvents, setAllEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await api.getEvents();
        const events = response.events || [];
        
        // Filter to only show approved events on the Events page
        const approvedEvents = events.filter(event => 
          event.status === 'APPROVED' || event.status === 'approved'
        );
        
        // Separate events into upcoming and past
        const now = new Date();
        const upcoming = approvedEvents.filter(event => new Date(event.endDate || event.startDate) >= now);
        const past = approvedEvents.filter(event => new Date(event.endDate || event.startDate) < now);
        
        setAllEvents(approvedEvents);
        setUpcomingEvents(upcoming);
        setPastEvents(past);

        // Fetch registered and saved events if user is logged in
        if (currentUser) {
          try {
            const registrations = await api.getMyRegistrations();
            setRegisteredEvents(registrations.map(reg => reg.event));

            const saved = await api.getMySavedEvents();
            setSavedEvents(saved.map(s => s.event));
          } catch (error) {
            console.error('Failed to fetch user events:', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentUser]);

  const displayedEvents = useMemo(() => {
    let events;
    switch (activeTab) {
      case 'upcoming':
        events = upcomingEvents;
        break;
      case 'past':
        events = pastEvents;
        break;
      case 'registered':
        events = registeredEvents;
        break;
      case 'saved':
        events = savedEvents;
        break;
      default:
        events = upcomingEvents;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return events.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.community?.name.toLowerCase().includes(query)
      );
    }

    return events;
  }, [activeTab, upcomingEvents, pastEvents, registeredEvents, savedEvents, searchQuery]);

  const eventsList = useMemo(() => 
    displayedEvents.map(event => <EventCard key={event.id} event={event} />),
    [displayedEvents]
  );

  if (loading) {
    return (
      <div className={styles.eventsPage}>
        <div className={styles.container}>
          <h1>Events</h1>
          <Loader text="Loading events..." />
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

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search events by title, location, or community..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button 
              className={styles.clearButton}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <Calendar size={18} />
            Upcoming Events
            <span className={styles.tabCount}>{upcomingEvents.length}</span>
          </button>
          
          <button 
            className={`${styles.tab} ${activeTab === 'past' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('past')}
          >
            <Calendar size={18} />
            Past Events
            <span className={styles.tabCount}>{pastEvents.length}</span>
          </button>
          
          {currentUser && (
            <>
              <button 
                className={`${styles.tab} ${activeTab === 'registered' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('registered')}
              >
                <CheckCircle size={18} />
                My Registrations
                <span className={styles.tabCount}>{registeredEvents.length}</span>
              </button>
              
              <button 
                className={`${styles.tab} ${activeTab === 'saved' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('saved')}
              >
                <Bookmark size={18} />
                Saved Events
                <span className={styles.tabCount}>{savedEvents.length}</span>
              </button>
            </>
          )}
        </div>

        {/* Events List */}
        {displayedEvents.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery ? (
              <p>No events found matching "{searchQuery}". Try a different search term.</p>
            ) : (
              <>
                {activeTab === 'upcoming' && <p>No upcoming events yet. Check back soon!</p>}
                {activeTab === 'past' && <p>No past events to show yet.</p>}
                {activeTab === 'registered' && <p>You haven't registered for any events yet. Browse events and register!</p>}
                {activeTab === 'saved' && <p>You haven't saved any events yet. Save events to keep track of them!</p>}
              </>
            )}
          </div>
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
