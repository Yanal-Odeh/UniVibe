import React, { useState } from 'react';
import PanoramaViewer from '../../Components/PanoramaViewer/PanoramaViewer';
import styles from './VirtualTour.module.scss';

function VirtualTour() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showPanorama, setShowPanorama] = useState(false);

  const locations = [
    {
      id: 1,
      name: 'Main Campus',
      category: 'Campus',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=2000&q=80',
      description: 'Explore our historic main campus with beautiful architecture and green spaces.',
      features: ['Library', 'Student Center', 'Administrative Offices'],
      color: '#667eea'
    },
    {
      id: 2,
      name: 'Science Building',
      category: 'Academic',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=2000&q=80',
      description: 'State-of-the-art laboratories and research facilities for STEM students.',
      features: ['Research Labs', 'Computer Labs', 'Study Areas'],
      color: '#4facfe'
    },
    {
      id: 3,
      name: 'Library',
      category: 'Academic',
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=2000&q=80',
      description: 'Modern library with extensive collections and quiet study spaces.',
      features: ['Reading Rooms', 'Digital Resources', 'Group Study Rooms'],
      color: '#f093fb'
    },
    {
      id: 4,
      name: 'Lecture Hall',
      category: 'Academic',
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=2000&q=80',
      description: 'Modern lecture halls equipped with state-of-the-art audio-visual technology.',
      features: ['Tiered Seating', 'Smart Boards', 'Recording Capabilities'],
      color: '#fa709a'
    },
    {
      id: 5,
      name: 'Sports Complex',
      category: 'Recreation',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=2000&q=80',
      description: 'Full-service athletic facilities including gym, pool, and sports fields.',
      features: ['Fitness Center', 'Swimming Pool', 'Basketball Courts'],
      color: '#fee140'
    },
    {
      id: 6,
      name: 'Dining Hall',
      category: 'Dining',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=2000&q=80',
      description: 'Multiple dining options with diverse menu selections for all dietary needs.',
      features: ['Buffet Style', 'Grab & Go', 'Vegetarian Options'],
      color: '#30cfd0'
    },
    {
      id: 8,
      name: 'Student Union',
      category: 'Campus',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
      panorama: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=2000&q=80',
      description: 'Hub for student activities, clubs, and social gatherings.',
      features: ['Meeting Rooms', 'Lounge Areas', 'Cafe'],
      color: '#764ba2'
    }
  ];

  const categories = ['All', 'Campus', 'Academic', 'Recreation', 'Dining'];
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
            <h2>Welcome to Our Campus!</h2>
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
            >
              <div 
                className={styles.locationImage}
                style={{ backgroundImage: `url(${location.image})` }}
              >
                <div className={styles.imageOverlay}>
                </div>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLocation(location);
                  }}
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

      {selectedLocation && !showPanorama && (
        <div className={styles.modal} onClick={() => setSelectedLocation(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedLocation(null)}>×</button>
            <div 
              className={styles.modalHeader} 
              style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${selectedLocation.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
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
              <button 
                className={styles.tourBtn} 
                style={{ background: selectedLocation.color }}
                onClick={() => setShowPanorama(true)}
              >
                Launch 360° Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {showPanorama && selectedLocation && (
        <PanoramaViewer 
          imageUrl={selectedLocation.panorama}
          onClose={() => {
            setShowPanorama(false);
            setSelectedLocation(null);
          }}
        />
      )}
    </div>
  );
}

export default VirtualTour;