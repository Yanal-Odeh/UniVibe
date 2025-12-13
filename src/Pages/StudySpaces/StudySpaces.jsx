import React, { useState } from 'react';
import styles from './StudySpaces.module.scss';
import { BookOpen, Users, Wifi, Coffee, Clock, MapPin, Search, Filter } from 'lucide-react';

function StudySpaces() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Spaces', icon: BookOpen },
    { id: 'quiet', name: 'Quiet Zones', icon: BookOpen },
    { id: 'collaborative', name: 'Collaborative', icon: Users },
    { id: 'cafe', name: 'Café Style', icon: Coffee },
  ];

  const studySpaces = [
    {
      id: 1,
      name: 'Main Library - Level 3',
      category: 'quiet',
      description: 'Silent study area with individual desks and excellent lighting.',
      capacity: '120 seats',
      amenities: ['Wifi', 'Power Outlets', 'Silent Zone'],
      hours: '24/7',
      location: 'Main Library, 3rd Floor',
      availability: 'Available',
      image: '📚',
      color: '#4f46e5'
    },
    {
      id: 2,
      name: 'Collaborative Learning Center',
      category: 'collaborative',
      description: 'Open space perfect for group projects and discussions.',
      capacity: '80 seats',
      amenities: ['Wifi', 'Whiteboards', 'Group Tables', 'Projectors'],
      hours: '8 AM - 10 PM',
      location: 'Student Center, 2nd Floor',
      availability: 'Available',
      image: '👥',
      color: '#10b981'
    },
    {
      id: 3,
      name: 'Science Library Reading Room',
      category: 'quiet',
      description: 'Dedicated quiet space for focused individual study.',
      capacity: '60 seats',
      amenities: ['Wifi', 'Power Outlets', 'Natural Light'],
      hours: '7 AM - Midnight',
      location: 'Science Building, 1st Floor',
      availability: 'Available',
      image: '🔬',
      color: '#3b82f6'
    },
    {
      id: 4,
      name: 'Campus Café Study Area',
      category: 'cafe',
      description: 'Casual study space with coffee and light background music.',
      capacity: '40 seats',
      amenities: ['Wifi', 'Coffee', 'Snacks', 'Comfortable Seating'],
      hours: '7 AM - 8 PM',
      location: 'Student Union Building',
      availability: 'Busy',
      image: '☕',
      color: '#f59e0b'
    },
    {
      id: 5,
      name: 'Engineering Study Pods',
      category: 'collaborative',
      description: 'Private study rooms for small groups with tech equipment.',
      capacity: '6-8 per pod',
      amenities: ['Wifi', 'Smart TV', 'Whiteboards', 'Bookable'],
      hours: '8 AM - 10 PM',
      location: 'Engineering Building, Ground Floor',
      availability: 'Available',
      image: '🔧',
      color: '#8b5cf6'
    },
    {
      id: 6,
      name: 'Garden Study Terrace',
      category: 'quiet',
      description: 'Outdoor study space with natural ambiance and fresh air.',
      capacity: '30 seats',
      amenities: ['Wifi', 'Shade', 'Natural Setting'],
      hours: '8 AM - 6 PM',
      location: 'Behind Main Library',
      availability: 'Available',
      image: '🌿',
      color: '#059669'
    },
    {
      id: 7,
      name: 'Digital Learning Lab',
      category: 'collaborative',
      description: 'Tech-enabled space with computers and multimedia resources.',
      capacity: '50 seats',
      amenities: ['Wifi', 'Computers', 'Printers', 'Scanners'],
      hours: '8 AM - 9 PM',
      location: 'Library, Basement',
      availability: 'Available',
      image: '💻',
      color: '#6366f1'
    },
    {
      id: 8,
      name: 'Cozy Corner Lounge',
      category: 'cafe',
      description: 'Comfortable seating area for relaxed studying and reading.',
      capacity: '25 seats',
      amenities: ['Wifi', 'Soft Seating', 'Coffee Table', 'Warm Lighting'],
      hours: '9 AM - 9 PM',
      location: 'Arts Building, 2nd Floor',
      availability: 'Available',
      image: '🛋️',
      color: '#ec4899'
    }
  ];

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
                  <span className={`${styles.availabilityBadge} ${space.availability === 'Available' ? styles.available : styles.busy}`}>
                    {space.availability}
                  </span>
                </div>
                <div className={styles.spaceBody}>
                  <h3 className={styles.spaceName}>{space.name}</h3>
                  <p className={styles.spaceDescription}>{space.description}</p>
                  
                  <div className={styles.spaceDetails}>
                    <div className={styles.detailItem}>
                      <Users className={styles.detailIcon} />
                      <span>{space.capacity}</span>
                    </div>
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
    </div>
  );
}

export default StudySpaces;
