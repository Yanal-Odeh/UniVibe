import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './EventSlider.module.scss';
import apiClient from '../../lib/api';

const EventSlider = () => {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || events.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === events.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, events.length, currentIndex]);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await apiClient.getEvents({ upcoming: 'true' });
      const eventsData = response.events || response || [];
      
      if (!Array.isArray(eventsData)) {
        setEvents([]);
        return;
      }
      
      const approvedUpcoming = eventsData.filter(event => {
        const isApproved = event.status === 'APPROVED';
        const isUpcoming = new Date(event.startDate) > new Date();
        return isApproved && isUpcoming;
      });

      setEvents(approvedUpcoming.slice(0, 5));
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setIsAutoPlaying(false); // Pause auto-play when user manually navigates
    setCurrentIndex((prevIndex) => 
      prevIndex === events.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setIsAutoPlaying(false); // Pause auto-play when user manually navigates
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? events.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false); // Pause auto-play when user manually navigates
    setCurrentIndex(index);
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
      <div className={styles.sliderContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading upcoming events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.errorState}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.emptyState}>
          <Calendar size={48} />
          <h3>No Upcoming Events</h3>
          <p>Check back soon for exciting campus events!</p>
        </div>
      </div>
    );
  }

  const currentEvent = events[currentIndex];

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderContent}>
        <div className={styles.sliderHeader}>
          <h2>Upcoming Events</h2>
          <p>Discover exciting events happening on campus</p>
        </div>

        <div className={styles.sliderWrapper}>
          {events.length > 1 && (
            <button 
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={prevSlide}
              aria-label="Previous event"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div className={styles.slider} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {events.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.cardContent}>
                  <div className={styles.contentSection}>
                    <div>
                      <h3 className={styles.eventTitle}>{event.title}</h3>
                      
                      <p className={styles.eventDescription}>
                        {event.description?.length > 200 
                          ? `${event.description.substring(0, 200)}...` 
                          : event.description}
                      </p>

                      <div className={styles.eventDetails}>
                        <div className={styles.detailItem}>
                          <Calendar size={18} />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        
                        <div className={styles.detailItem}>
                          <Clock size={18} />
                          <span>{formatTime(event.startDate)}</span>
                        </div>
                        
                        {event.location && (
                          <div className={styles.detailItem}>
                            <MapPin size={18} />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link 
                      to={`/events/${event.id}`} 
                      className={styles.viewButton}
                    >
                      View Details
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {events.length > 1 && (
            <button 
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={nextSlide}
              aria-label="Next event"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {events.length > 1 && (
          <div className={styles.dots}>
            {events.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSlider;
