import React from 'react';
import styles from './Home.module.scss';

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

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <h1 className={styles.heroTitle}>
          INTERACT. LEARN. ENJOY.
        </h1>
      </div>

      {/* Cards Section */}
      <div className={styles.cardsSection}>
        <div className={styles.cardsGrid}>
          {cards.map((card, index) => (
            <div key={index} className={styles.card}>
              {/* Icon and Title */}
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>{card.icon}</div>
                <h2 className={styles.cardTitle}>{card.title}</h2>
              </div>

              {/* Content */}
              <div className={styles.cardContent}>
                {card.subtitle && (
                  <p className={styles.cardSubtitle}>{card.subtitle}</p>
                )}
                {card.info && (
                  <p className={styles.cardInfo}>{card.info}</p>
                )}
                {card.note && (
                  <p className={styles.cardNote}>{card.note}</p>
                )}
              </div>

              {/* Buttons */}
              <div className={styles.cardButtons}>
                {card.buttons.map((button, btnIndex) => (
                  <button
                    key={btnIndex}
                    className={button.primary ? styles.btnPrimary : styles.btnSecondary}
                  >
                    {button.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;