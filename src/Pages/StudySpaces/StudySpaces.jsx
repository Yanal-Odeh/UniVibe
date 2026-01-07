import React, { useState, useEffect } from 'react';
import styles from './StudySpaces.module.scss';
import { BookOpen, Users, Wifi, Coffee, Clock, MapPin, Search, X, Calendar, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

function StudySpaces() {
  const { currentAdmin: user } = useAdminAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [studySpaces, setStudySpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userReservations, setUserReservations] = useState([]);
  
  // Reservation modal state
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reservationMessage, setReservationMessage] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-CA'));

  const categories = [
    { id: 'all', name: 'All Spaces', icon: BookOpen },
    { id: 'quiet', name: 'Quiet Zones', icon: BookOpen },
    { id: 'collaborative', name: 'Collaborative', icon: Users },
    { id: 'cafe', name: 'Café Style', icon: Coffee },
  ];

  // Check for date change every minute
  useEffect(() => {
    const checkDateChange = setInterval(() => {
      const newDate = new Date().toLocaleDateString('en-CA');
      if (newDate !== currentDate) {
        console.log('Date changed from', currentDate, 'to', newDate, '- refreshing data');
        setCurrentDate(newDate);
        fetchStudySpaces();
        if (user) {
          fetchUserReservations();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkDateChange);
  }, [currentDate, user]);

  useEffect(() => {
    fetchStudySpaces();
    if (user) {
      fetchUserReservations();
    }
  }, [user]);

  const fetchStudySpaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllStudySpaces();
      setStudySpaces(data);
    } catch (err) {
      console.error('Error fetching study spaces:', err);
      setError('Failed to load study spaces. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReservations = async () => {
    try {
      const data = await api.getMyReservations('ACTIVE');
      console.log('User reservations fetched:', data);
      setUserReservations(data);
    } catch (err) {
      console.error('Error fetching user reservations:', err);
    }
  };

  const hasUserReserved = (spaceId) => {
    if (!userReservations || userReservations.length === 0) return false;
    
    // Get today's date in YYYY-MM-DD format (local timezone)
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
    
    console.log('Checking for space:', spaceId, 'Today:', todayStr);
    console.log('Current reservations:', userReservations);
    
    const isReserved = userReservations.some(res => {
      // Convert reservation date to YYYY-MM-DD format
      const resDate = new Date(res.date);
      const resDateStr = resDate.toLocaleDateString('en-CA');
      
      const spaceMatches = res.spaceId === spaceId;
      const dateMatches = resDateStr === todayStr;
      const statusMatches = res.status === 'ACTIVE';
      
      console.log('===== COMPARISON DETAILS =====');
      console.log('Looking for spaceId:', spaceId);
      console.log('Reservation spaceId:', res.spaceId);
      console.log('Space matches?', spaceMatches);
      console.log('---');
      console.log('Today:', todayStr);
      console.log('Reservation date:', resDateStr);
      console.log('Date matches?', dateMatches);
      console.log('---');
      console.log('Reservation status:', res.status);
      console.log('Status is ACTIVE?', statusMatches);
      console.log('---');
      console.log('FINAL MATCH?', spaceMatches && dateMatches && statusMatches);
      console.log('==============================');
      
      return spaceMatches && dateMatches && statusMatches;
    });
    
    console.log('Is reserved result:', isReserved);
    return isReserved;
  };

  const openReservationModal = (space) => {
    if (!user) {
      alert('Please sign in to reserve a study space');
      return;
    }
    
    // Check if user already reserved this space
    if (hasUserReserved(space.id)) {
      setReservationMessage({ type: 'error', text: 'You already have a reservation for this space on this date' });
      return;
    }
    
    setSelectedSpace(space);
    setShowReservationModal(true);
    setReservationMessage(null);
  };

  const closeReservationModal = () => {
    setShowReservationModal(false);
    setSelectedSpace(null);
    setReservationMessage(null);
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    
    if (!selectedSpace) {
      setReservationMessage({ type: 'error', text: 'Please select a space' });
      return;
    }

    setReserving(true);
    setReservationMessage(null);

    try {
      // Use today's date
      const today = new Date().toISOString().split('T')[0];
      
      const response = await api.createReservation(
        selectedSpace.id,
        today
      );
      
      setReservationMessage({ 
        type: 'success', 
        text: `Successfully reserved ${selectedSpace.name} for today! Check your notifications.` 
      });
      
      // Force immediate state update and refetch to ensure UI updates
      await Promise.all([
        fetchStudySpaces(),
        fetchUserReservations()
      ]);
      
      setTimeout(() => {
        closeReservationModal();
      }, 2000);
      
    } catch (err) {
      console.error('Reservation error:', err);
      setReservationMessage({ 
        type: 'error', 
        text: err.message || 'Failed to create reservation. Please try again.' 
      });
    } finally {
      setReserving(false);
    }
  };

  const filteredSpaces = studySpaces.filter(space => {
    const matchesCategory = selectedCategory === 'all' || space.category === selectedCategory;
    const matchesSearch = space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          space.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const features = [
    {
      icon: Wifi,
      title: 'High-Speed WiFi',
      description: 'Free, secure internet access in all study areas'
    },
    {
      icon: Clock,
      title: 'Flexible Hours',
      description: 'Many spaces open 24/7 during exam periods'
    },
    {
      icon: Users,
      title: 'Various Environments',
      description: 'Quiet zones to collaborative spaces'
    },
    {
      icon: Coffee,
      title: 'Nearby Amenities',
      description: 'Access to cafés and refreshment areas'
    }
  ];

  if (loading) {
    return (
      <div className={styles.studySpacesPage}>
        <div className={styles.loading}>Loading study spaces...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.studySpacesPage}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.studySpacesPage}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Find Your Perfect <span className={styles.highlight}>Study Space</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Discover quiet zones, collaborative areas, and comfortable spots across campus
          </p>
        </div>
      </div>

      <div className={styles.container}>
        {/* Search and Filter Section */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search study spaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.categories}>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  className={`${styles.categoryBtn} ${selectedCategory === category.id ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className={styles.categoryIcon} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Why Study On Campus?</h2>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <Icon className={styles.icon} />
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Study Spaces Grid */}
        <div className={styles.spacesSection}>
          <h2 className={styles.sectionTitle}>
            Available Study Spaces
            <span className={styles.resultCount}>({filteredSpaces.length} spaces)</span>
          </h2>
          <div className={styles.spacesGrid}>
            {filteredSpaces.map((space) => (
              <div key={space.id} className={styles.spaceCard}>
                <div className={styles.spaceHeader} style={{ background: `linear-gradient(135deg, ${space.color}dd, ${space.color})` }}>
                  <div className={styles.spaceEmoji}>{space.image}</div>
                  <span className={`${styles.availabilityBadge} ${
                    space.availability === 'Full' ? styles.full : 
                    space.availability === 'Busy' ? styles.busy : 
                    styles.available
                  }`}>
                    {space.availability}
                  </span>
                </div>
                <div className={styles.spaceBody}>
                  <h3 className={styles.spaceName}>{space.name}</h3>
                  <p className={styles.spaceDescription}>{space.description}</p>
                  
                  <div className={styles.spaceDetails}>
                    <div className={styles.detailItem}>
                      <Users className={styles.detailIcon} />
                      <span>{space.capacity} total</span>
                    </div>
                    {space.availableSeats !== undefined && (
                      <div className={styles.detailItem}>
                        <CheckCircle className={styles.detailIcon} />
                        <span className={styles.availableSeats}>
                          {space.availableSeats} available
                        </span>
                      </div>
                    )}
                    <div className={styles.detailItem}>
                      <Clock className={styles.detailIcon} />
                      <span>{space.hours}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <MapPin className={styles.detailIcon} />
                      <span>{space.location}</span>
                    </div>
                  </div>

                  <div className={styles.amenities}>
                    {space.amenities.map((amenity, idx) => (
                      <span key={idx} className={styles.amenityTag}>{amenity}</span>
                    ))}
                  </div>

                  <button 
                    className={`${styles.reserveBtn} ${
                      space.availability === 'Full' || (user && hasUserReserved(space.id)) ? styles.disabled : ''
                    } ${
                      user && hasUserReserved(space.id) ? styles.alreadyReserved : ''
                    }`}
                    onClick={() => openReservationModal(space)}
                    disabled={space.availability === 'Full' || (user && hasUserReserved(space.id))}
                  >
                    {space.availability === 'Full' 
                      ? 'Space Full' 
                      : user && hasUserReserved(space.id) 
                      ? '✓ Already Reserved' 
                      : 'Reserve Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className={styles.tipsSection}>
          <h2 className={styles.sectionTitle}>Study Tips</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipNumber}>1</div>
              <h3 className={styles.tipTitle}>Arrive Early</h3>
              <p className={styles.tipText}>Popular spaces fill up quickly, especially during exams.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipNumber}>2</div>
              <h3 className={styles.tipTitle}>Book Ahead</h3>
              <p className={styles.tipText}>Reserve study pods and rooms in advance when possible.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipNumber}>3</div>
              <h3 className={styles.tipTitle}>Respect Others</h3>
              <p className={styles.tipText}>Keep noise levels appropriate for the space type.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipNumber}>4</div>
              <h3 className={styles.tipTitle}>Stay Hydrated</h3>
              <p className={styles.tipText}>Bring water and take regular breaks for better focus.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {showReservationModal && selectedSpace && (
        <div className={styles.modalOverlay} onClick={closeReservationModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeReservationModal}>
              <X />
            </button>
            
            <h2 className={styles.modalTitle}>Reserve Study Space</h2>
            <div className={styles.spaceInfo}>
              <span className={styles.spaceEmoji}>{selectedSpace.image}</span>
              <div>
                <h3>{selectedSpace.name}</h3>
                <p>{selectedSpace.location}</p>
                {selectedSpace.availableSeats !== undefined && (
                  <p className={styles.availabilityInfo}>
                    {selectedSpace.availableSeats} seats available today
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleReservation} className={styles.reservationForm}>
              <div className={styles.dateInfo}>
                <Calendar size={20} />
                <div>
                  <strong>Reservation Date:</strong> Today ({new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })})
                </div>
              </div>

              <p className={styles.infoText}>
                This reservation is valid for the entire day and will automatically reset tomorrow.
              </p>

              {reservationMessage && (
                <div className={`${styles.message} ${styles[reservationMessage.type]}`}>
                  {reservationMessage.text}
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeReservationModal}
                  disabled={reserving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.confirmBtn}
                  disabled={reserving}
                >
                  {reserving ? 'Reserving...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudySpaces;
