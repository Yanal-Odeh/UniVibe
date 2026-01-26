import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, BookOpen, Coffee, Music, Camera, Sparkles, ArrowRight } from 'lucide-react';
import styles from './Home.module.scss';
import EventSlider from '../../Components/EventSlider/EventSlider';

// Memoized components for better performance
const StatCard = React.memo(({ stat }) => (
  <div className={styles.statCard}>
    <h3 className={styles.statNumber}>{stat.number}</h3>
    <p className={styles.statLabel}>{stat.label}</p>
  </div>
));

StatCard.displayName = 'StatCard';

const FeatureCard = React.memo(({ feature }) => (
  <Link 
    to={feature.link} 
    className={styles.featureCard}
    style={{'--card-gradient': feature.color, color: feature.color}}
  >
    <div className={styles.featureIcon} style={{background: feature.color}}>
      {feature.icon}
    </div>
    <h3 className={styles.featureTitle}>{feature.title}</h3>
    <p className={styles.featureDescription}>{feature.description}</p>
    <span className={styles.featureLink}>
      Learn More <ArrowRight size={16} />
    </span>
  </Link>
));

FeatureCard.displayName = 'FeatureCard';

const InfoCard = React.memo(({ card }) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <div className={styles.cardIcon}>{card.icon}</div>
      <h2 className={styles.cardTitle}>{card.title}</h2>
    </div>
    <div className={styles.cardContent}>
      {card.subtitle && <p className={styles.cardSubtitle}>{card.subtitle}</p>}
      {card.info && <p className={styles.cardInfo}>{card.info}</p>}
      {card.note && <p className={styles.cardNote}>{card.note}</p>}
    </div>
    <div className={styles.cardButtons}>
      {card.buttons.map((button, btnIndex) => (
        button.text === 'Event Calendar' ? (
          <Link
            key={btnIndex}
            to="/calendar"
            className={button.primary ? styles.btnPrimary : styles.btnSecondary}
          >
            {button.text}
          </Link>
        ) : (
          <button
            key={btnIndex}
            className={button.primary ? styles.btnPrimary : styles.btnSecondary}
          >
            {button.text}
          </button>
        )
      ))}
    </div>
  </div>
));

InfoCard.displayName = 'InfoCard';

const Home = () => {
  const cards = [
    {
      icon: '🕐',
      title: 'Hours',
      subtitle: 'Building',
      info: '7:00 a.m. - midnight\nMonday - Sunday',
      note: 'Closed seasonally | Weekends',
      buttons: [
        { text: 'Shop, Play, Sleep', primary: true },
        { text: 'Services', primary: false }
      ]
    },
    {
      icon: '📅',
      title: 'Events',
      subtitle: 'Social, educational and cultural',
      buttons: [
        { text: 'Plan an Event', primary: true },
        { text: 'Event Calendar', primary: false }
      ]
    },
    {
      icon: '📚',
      title: 'Study',
      subtitle: 'The Student Center provides quiet places for students to do work, on-call, and also offers rooms available for group work.',
      buttons: [
        { text: 'Book a Study Room', primary: true },
        { text: 'Study Spaces', primary: false }
      ]
    },
    {
      icon: '📍',
      title: 'Directions',
      subtitle: 'Find your way to the Student Center and elsewhere on campus',
      buttons: [
        { text: 'Information Center', primary: true },
        { text: 'Parking', primary: false }
      ]
    },
    {
      icon: '💼',
      title: 'Employment',
      subtitle: 'Do you want to be part of our team? Find out about openings at the Student Center.',
      buttons: [
        { text: 'Student Employment Opportunities', primary: true }
      ]
    },
    {
      icon: '📋',
      title: 'Work Orders',
      subtitle: 'Departments can use this form to request a special or repair of repair in the Student Center.',
      buttons: [
        { text: 'Work Order Request Form', primary: true }
      ]
    }
  ];

  const features = [
    {
      icon: <Users size={40} />,
      title: "Join Communities",
      description: "Connect with like-minded students and join vibrant communities",
      link: "/communities",
      color: "#0064A4"
    },
    {
      icon: <Calendar size={40} />,
      title: "Upcoming Events",
      description: "Discover and participate in exciting campus events",
      link: "/events",
      color: "#4facfe"
    },
    {
      icon: <BookOpen size={40} />,
      title: "Study Spaces",
      description: "Find the perfect spot to study and collaborate",
      link: "/study",
      color: "#43e97b"
    },
    {
      icon: <Coffee size={40} />,
      title: "Dine & Relax",
      description: "Explore dining options and relaxation areas",
      link: "/dine",
      color: "#fa709a"
    }
  ];

  const stats = [
    { number: "6+", label: "Active Communities" },
    { number: "50+", label: "Events Monthly" },
    { number: "1000+", label: "Active Students" },
    { number: "24/7", label: "Access Available" }
  ];

  // Memoize computed lists
  const statsList = useMemo(() => 
    stats.map((stat, index) => <StatCard key={index} stat={stat} />),
    []
  );

  const featuresList = useMemo(() => 
    features.map((feature, index) => <FeatureCard key={index} feature={feature} />),
    []
  );

  const cardsList = useMemo(() => 
    cards.map((card, index) => <InfoCard key={index} card={card} />),
    []
  );

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            INTERACT. LEARN. ENJOY.
          </h1>
          <p className={styles.heroSubtitle}>
            Your hub for campus life, events, and community connections
          </p>
          <div className={styles.heroButtons}>
            <Link to="/events" className={styles.heroBtnPrimary}>
              Explore Events
              <ArrowRight size={20} />
            </Link>
            <Link to="/communities" className={styles.heroBtnSecondary}>
              Join Communities
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statsContainer}>
          {statsList}
        </div>
      </div>

      {/* Event Slider Section */}
      <div className={styles.eventSliderSection}>
        <EventSlider />
      </div>

      {/* Features Section */}
      <div className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <Sparkles className={styles.sectionIcon} />
          <h2>What We Offer</h2>
          <p>Everything you need for an amazing campus experience</p>
        </div>
        <div className={styles.featuresGrid}>
          {featuresList}
        </div>
      </div>

      {/* Cards Section */}
      <div className={styles.cardsSection}>
        <div className={styles.cardsGrid}>
          {cardsList}
        </div>
      </div>

      {/* Community Spotlight */}
      <div className={styles.communitySection}>
        <div className={styles.communityContent}>
          <div className={styles.communityText}>
            <h2 className={styles.communityTitle}>Join Our Vibrant Communities</h2>
            <p className={styles.communityDescription}>
              Connect with students who share your interests. From tech enthusiasts to artists, 
              athletes to musicians, there's a community for everyone at UniVibe.
            </p>
            <div className={styles.communityFeatures}>
              <div className={styles.communityFeature}>
                <Music className={styles.communityFeatureIcon} />
                <span>Music & Arts</span>
              </div>
              <div className={styles.communityFeature}>
                <Users className={styles.communityFeatureIcon} />
                <span>Sports & Fitness</span>
              </div>
              <div className={styles.communityFeature}>
                <Camera className={styles.communityFeatureIcon} />
                <span>Photography</span>
              </div>
            </div>
            <Link to="/communities" className={styles.communityButton}>
              Explore All Communities
              <ArrowRight size={20} />
            </Link>
          </div>
          <div className={styles.communityVisual}>
            <div className={styles.communityCard}>🖥️<span>Computer Science</span></div>
            <div className={styles.communityCard}>🎨<span>Art & Design</span></div>
            <div className={styles.communityCard}>📚<span>Book Club</span></div>
            <div className={styles.communityCard}>⚽<span>Sports</span></div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
          <p className={styles.ctaDescription}>
            Join thousands of students who are already part of the UniVibe community
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/signin" className={styles.ctaBtnPrimary}>
              Sign In
            </Link>
            <Link to="/about" className={styles.ctaBtnSecondary}>
              Learn More About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Home);
