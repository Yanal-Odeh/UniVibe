import React, { useState } from 'react';
import styles from './VirtualTour.module.scss';

function VirtualTour() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const locations = [
    {
      id: 1,
      name: 'Main Campus',
      category: 'Campus',
      image: '🏛️',
      description: 'Explore our historic main campus with beautiful architecture and green spaces.',
      features: ['Library', 'Student Center', 'Administrative Offices'],
      color: '#667eea'
    },
    {
      id: 2,
      name: 'Science Building',
      category: 'Academic',
      image: '🔬',
      description: 'State-of-the-art laboratories and research facilities for STEM students.',
      features: ['Research Labs', 'Computer Labs', 'Study Areas'],
      color: '#4facfe'
    },
    {
      id: 3,
      name: 'Library',
      category: 'Academic',
      image: '📚',
      description: 'Modern library with extensive collections and quiet study spaces.',
      features: ['Reading Rooms', 'Digital Resources', 'Group Study Rooms'],
      color: '#f093fb'
    },
    {
      id: 4,
      name: 'Student Housing',
      category: 'Residential',
      image: '🏠',
      description: 'Comfortable dormitories with modern amenities and community spaces.',
      features: ['Single & Double Rooms', 'Common Areas', 'Laundry Facilities'],
      color: '#fa709a'
    },
    {
      id: 5,
      name: 'Sports Complex',
      category: 'Recreation',
      image: '🏋️',
      description: 'Full-service athletic facilities including gym, pool, and sports fields.',
      features: ['Fitness Center', 'Swimming Pool', 'Basketball Courts'],
      color: '#fee140'
    },
    {
      id: 6,
      name: 'Dining Hall',
      category: 'Dining',
      image: '🍽️',
      description: 'Multiple dining options with diverse menu selections for all dietary needs.',
      features: ['Buffet Style', 'Grab & Go', 'Vegetarian Options'],
      color: '#30cfd0'
    },
    {
      id: 7,
      name: 'Arts Center',
      category: 'Academic',
      image: '🎭',
      description: 'Creative spaces for performing and visual arts with galleries and theaters.',
      features: ['Theater', 'Art Studios', 'Music Rooms'],
      color: '#a8edea'
    },
    {
      id: 8,
      name: 'Student Union',
      category: 'Campus',
      image: '🎪',
      description: 'Hub for student activities, clubs, and social gatherings.',
      features: ['Meeting Rooms', 'Lounge Areas', 'Cafe'],
      color: '#764ba2'
    }
  ];

  const categories = ['All', 'Campus', 'Academic', 'Residential', 'Recreation', 'Dining'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredLocations = activeCategory === 'All' 
    ? locations 
    : locations.filter(loc => loc.category === activeCategory);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Virtual Campus Tour</h1>
        <p>Explore our beautiful campus from anywhere in the world</p>
      </div>

      <div className={styles.content}>
        <div className={styles.introSection}>
          <div className={styles.introCard}>
            <h2>Welcome to Our Campus! 👋</h2>
            <p>
              Take a virtual journey through our campus and discover world-class facilities, 
              vibrant student life, and beautiful spaces designed for learning and growth. 
              Click on any location to learn more about what makes our campus special.
            </p>
          </div>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.categories}>
            {categories.map(category => (
              <button
                key={category}
                className={`${styles.categoryBtn} ${activeCategory === category ? styles.active : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.locationsGrid}>
          {filteredLocations.map(location => (
            <div
              key={location.id}
              className={styles.locationCard}
              style={{ borderColor: location.color }}
              onClick={() => setSelectedLocation(location)}
            >
              <div className={styles.locationImage} style={{ background: `linear-gradient(135deg, ${location.color}22, ${location.color}44)` }}>
                <span className={styles.emoji}>{location.image}</span>
              </div>
              <div className={styles.locationContent}>
                <span className={styles.category} style={{ background: location.color }}>
                  {location.category}
                </span>
                <h3>{location.name}</h3>
                <p>{location.description}</p>
                <div className={styles.features}>
                  {location.features.map((feature, index) => (
                    <span key={index} className={styles.feature}>
                      {feature}
                    </span>
                  ))}
                </div>
                <button 
                  className={styles.viewBtn}
                  style={{ background: location.color }}
                >
                  Start Virtual Tour →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.callToAction}>
          <div className={styles.ctaCard}>
            <h2>Want to Visit in Person?</h2>
            <p>Schedule a campus visit and experience our community firsthand. Our admissions team would love to show you around!</p>
            <div className={styles.ctaButtons}>
              <button className={styles.primaryBtn}>Schedule a Visit</button>
              <button className={styles.secondaryBtn}>Contact Admissions</button>
            </div>
          </div>
        </div>
      </div>

      {selectedLocation && (
        <div className={styles.modal} onClick={() => setSelectedLocation(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedLocation(null)}>×</button>
            <div className={styles.modalHeader} style={{ background: selectedLocation.color }}>
              <span className={styles.modalEmoji}>{selectedLocation.image}</span>
              <h2>{selectedLocation.name}</h2>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalDescription}>{selectedLocation.description}</p>
              <h3>Key Features:</h3>
              <ul className={styles.featuresList}>
                {selectedLocation.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <button className={styles.tourBtn} style={{ background: selectedLocation.color }}>
                Launch 360° Tour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VirtualTour;