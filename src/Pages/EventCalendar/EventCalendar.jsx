import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Grid3x3,
  List,
  Filter,
  Search,
  MapPin,
  Clock,
  Users,
  Tag,
  X
} from 'lucide-react';
import styles from './EventCalendar.module.scss';

function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 1)); // March 2025
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch approved events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await api.getEvents();
        const eventsList = data.events || data || [];
        
        // Transform API data to match calendar format
        const transformedEvents = eventsList.map(event => ({
          id: event.id,
          title: event.title,
          date: event.startDate,
          time: new Date(event.startDate).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          venue: event.location || 'TBA',
          attendees: event.attendees || 0,
          category: event.category || 'General',
          color: getCategoryColor(event.category),
          description: event.description
        }));
        
        setEvents(transformedEvents);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Helper function to get category colors
  const getCategoryColor = (category) => {
    const colors = {
      'Technology': '#667eea',
      'Cultural': '#f093fb',
      'Educational': '#4facfe',
      'Career': '#43e97b',
      'Sports': '#fa709a',
      'General': '#ffd16a'
    };
    return colors[category] || '#667eea';
  };

  const categories = ['All', 'Technology', 'Cultural', 'Educational', 'Career', 'Sports'];

  // Navigate to the month containing the first matching event when search changes
  useEffect(() => {
    if (searchTerm.trim() !== '' && viewMode === 'calendar') {
      const matchingEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === 'All' || event.category === selectedCategory)
      ).sort((a, b) => new Date(a.date) - new Date(b.date));

      if (matchingEvents.length > 0) {
        const firstMatchDate = new Date(matchingEvents[0].date);
        setCurrentDate(new Date(firstMatchDate.getFullYear(), firstMatchDate.getMonth(), 1));
      }
    }
  }, [searchTerm, selectedCategory, viewMode]);

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDate = (day) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear() &&
             (selectedCategory === 'All' || event.category === selectedCategory) &&
             event.title.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const getFilteredEvents = () => {
    return events.filter(event => {
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={`${styles.calendarDay} ${styles.empty}`}></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isToday = day === new Date().getDate() && 
                     currentDate.getMonth() === new Date().getMonth() &&
                     currentDate.getFullYear() === new Date().getFullYear();
      
      // Check if this day has matching search results
      const hasMatchingEvent = searchTerm.trim() !== '' && dayEvents.length > 0;

      days.push(
        <div 
          key={day} 
          className={`${styles.calendarDay} ${isToday ? styles.today : ''} ${hasMatchingEvent ? styles.highlighted : ''}`}
        >
          <div className={styles.dayNumber}>{day}</div>
          <div className={styles.dayEvents}>
            {dayEvents.slice(0, 3).map(event => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className={`${styles.eventDot} ${searchTerm.trim() !== '' ? styles.matchedEvent : ''}`}
                style={{ backgroundColor: event.color }}
                title={event.title}
              >
                <span className={styles.eventDotTitle}>{event.title}</span>
              </Link>
            ))}
            {dayEvents.length > 3 && (
              <div className={styles.moreEvents}>+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.eventCalendarPage}>
      <div className={styles.calendarContainer}>
        {/* Header */}
        <div className={styles.calendarHeader}>
          <div className={styles.headerTop}>
            <h1 className={styles.pageTitle}>
              <Calendar size={32} />
              Event Calendar
            </h1>
            <div className={styles.viewToggle}>
              <button 
                className={`${styles.viewBtn} ${viewMode === 'calendar' ? styles.active : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                <Grid3x3 size={18} />
                Calendar
              </button>
              <button 
                className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
                List
              </button>
            </div>
          </div>

          <div className={styles.controlsRow}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search events..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className={`${styles.filterBtn} ${showFilters ? styles.active : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <X size={18} /> : <Filter size={18} />}
              Filters
            </button>
          </div>

          {showFilters && (
            <div className={styles.categoryFilters}>
              {categories.map(category => (
                <button
                  key={category}
                  className={`${styles.categoryChip} ${selectedCategory === category ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={styles.calendarMain}>
          {loading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <Calendar size={40} />
              </div>
              <h3>Loading events...</h3>
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <Calendar size={40} />
              </div>
              <h3>Error loading events</h3>
              <p>{error}</p>
            </div>
          ) : viewMode === 'calendar' ? (
            <>
              <div className={styles.calendarNav}>
                <h2 className={styles.monthYear}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className={styles.navButtons}>
                  <button className={styles.navBtn} onClick={previousMonth}>
                    <ChevronLeft size={20} />
                  </button>
                  <button className={styles.navBtn} onClick={nextMonth}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className={styles.calendarGrid}>
                {dayNames.map(day => (
                  <div key={day} className={styles.dayHeader}>{day}</div>
                ))}
                {renderCalendarDays()}
              </div>
            </>
          ) : (
            <div className={styles.eventsList}>
              {getFilteredEvents().length > 0 ? (
                getFilteredEvents().map(event => (
                  <Link key={event.id} to={`/events/${event.id}`} className={styles.eventCard}>
                    <div className={styles.eventDateBlock}>
                      <div className={styles.eventMonth}>
                        {monthNames[new Date(event.date).getMonth()].substring(0, 3)}
                      </div>
                      <div className={styles.eventDay}>{new Date(event.date).getDate()}</div>
                    </div>
                    <div className={styles.eventContent}>
                      <h3 className={styles.eventTitle}>{event.title}</h3>
                      <div className={styles.eventMeta}>
                        <div className={styles.eventMetaItem}>
                          <Clock size={16} />
                          {event.time}
                        </div>
                        <div className={styles.eventMetaItem}>
                          <MapPin size={16} />
                          {event.venue}
                        </div>
                        <div className={styles.eventMetaItem}>
                          <Users size={16} />
                          {event.attendees} attending
                        </div>
                      </div>
                      <span 
                        className={styles.eventCategoryBadge}
                        style={{ backgroundColor: event.color }}
                      >
                        {event.category}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <Calendar size={40} />
                  </div>
                  <h3>No events found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCalendar;