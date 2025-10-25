import React from 'react';
import styles from './InformationCenter.module.scss';
import { Link } from 'react-router-dom';

function InformationCenter() {
  const infoCards = [
    {
      icon: '📚',
      title: 'Academic Resources',
      description: 'Access course materials, study guides, and academic calendars.',
      link: '#'
    },
    {
      icon: '🎓',
      title: 'Student Services',
      description: 'Find information about counseling, health services, and support.',
      link: '#'
    },
    {
      icon: '💼',
      title: 'Career Center',
      description: 'Explore internship opportunities and career guidance.',
      link: '#'
    },
    {
      icon: '🏫',
      title: 'Campus Life',
      description: 'Learn about clubs, events, and student organizations.',
      link: '#'
    },
    {
      icon: '📅',
      title: 'Important Dates',
      description: 'View academic calendar, registration deadlines, and events.',
      link: '#'
    },
    {
      icon: '📞',
      title: 'Contact Directory',
      description: 'Find contact information for departments and faculty.',
      link: '#'
    }
  ];

  const announcements = [
    {
      date: 'March 15, 2024',
      title: 'Spring Registration Opens',
      badge: 'Important'
    },
    {
      date: 'March 20, 2024',
      title: 'Campus Career Fair',
      badge: 'Event'
    },
    {
      date: 'March 25, 2024',
      title: 'New Library Hours',
      badge: 'Update'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Information Center</h1>
        <p>Your central hub for all university information and resources</p>
      </div>

      <div className={styles.content}>
        <div className={styles.mainContent}>
          <section className={styles.cardsSection}>
            <h2>Quick Access</h2>
            <div className={styles.cardsGrid}>
              {infoCards.map((card, index) => (
                <div key={index} className={styles.card}>
                  <div className={styles.cardIcon}>{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <a href={card.link} className={styles.cardLink}>
                    Learn More →
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.helpSection}>
            <div className={styles.helpCard}>
              <h3>Need Help?</h3>
              <p>Our support team is here to assist you with any questions.</p>
              <button className={styles.helpButton}>Contact Support</button>
            </div>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.announcementsCard}>
            <h3>Recent Announcements</h3>
            <div className={styles.announcementsList}>
              {announcements.map((announcement, index) => (
                <div key={index} className={styles.announcement}>
                  <span className={styles.announcementBadge}>{announcement.badge}</span>
                  <h4>{announcement.title}</h4>
                  <p className={styles.announcementDate}>{announcement.date}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.quickLinks}>
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/forms">Forms & Applications</Link></li>
              <li><Link to="/policies">Policies & Guidelines</Link></li>
              <li><Link to="/virtual-tour">Virtual Tour</Link></li>
              <li><a href="#">Student Portal</a></li>
              <li><a href="#">Library</a></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default InformationCenter;