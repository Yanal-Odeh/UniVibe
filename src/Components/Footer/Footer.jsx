// src/Components/Footer/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Contact Section */}
        <div className={styles.footerColumn}>
          <h3 className={styles.footerHeading}>Contact</h3>
          <div className={styles.footerSubheading}>UniVibe Student Hub</div>
          <div className={styles.contactInfo}>
            <p>Student Center Building</p>
            <p>University Campus, 12345</p>
            <p>📞 (555) 123-4567</p>
            <p>✉️ contact@univibe.edu</p>
          </div>
          <button className={styles.staffDirectoryBtn}>Staff Directory</button>
          
          <div className={styles.socialIcons}>
            <a href="#" aria-label="Facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Information Section */}
        <div className={styles.footerColumn}>
          <h3 className={styles.footerHeading}>Information</h3>
          <ul className={styles.footerLinks}>
            <li><Link to="/information-center">Information Center</Link></li>
            <li><Link to="/forms">Forms and Applications</Link></li>
            <li><Link to="/policies">Policies and Guidelines</Link></li>
            <li><Link to="/tour">Virtual Tour</Link></li>
          </ul>

          <h3 className={styles.footerHeading}>Events</h3>
          <ul className={styles.footerLinks}>
            <li><Link to="/events">Plan In-Person Events</Link></li>
            <li><Link to="/virtual-events">Virtual Meetings and Events</Link></li>
            <li><Link to="/calendar">Event Calendar</Link></li>
          </ul>
        </div>

        {/* Learn & Enjoy Section */}
        <div className={styles.footerColumn}>
          <h3 className={styles.footerHeading}>Learn & Enjoy</h3>
          <ul className={styles.footerLinks}>
            <li><Link to="/study">Study</Link></li>
            <li><Link to="/dine-play-shop">Dine, Play, Shop</Link></li>
            <li><Link to="/services">Services</Link></li>
          </ul>

          <h3 className={styles.footerHeading}>Get Involved</h3>
          <ul className={styles.footerLinks}>
            <li><Link to="/employment">Student Employment Opportunities</Link></li>
            <li><Link to="/board">Student Center Board of Advisors</Link></li>
          </ul>

          <h3 className={styles.footerHeading}>Wellness Resources</h3>
          <ul className={styles.footerLinks}>
            <li><Link to="/meditation">Meditation Space</Link></li>
          </ul>
        </div>

        {/* About Section */}
        <div className={styles.footerColumn}>
          <h3 className={styles.footerHeading}>About</h3>
          <ul className={styles.footerLinks}>
            <li><Link to="/organization">Our Organization</Link></li>
            <li><Link to="/staff">Staff Directory</Link></li>
            <li><Link to="/sustainability">Sustainability</Link></li>
            <li><Link to="/board-advisors">Student Center Board of Advisors</Link></li>
            <li><Link to="/developers">Student Center IT Developers</Link></li>
            <li><Link to="/submit">Submit Work Order</Link></li>
          </ul>

          <h3 className={styles.footerHeading}>Student Center Blog</h3>
          <ul className={styles.footerLinks}>
            <li><Link to="/blog">Read Our Blog</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className={styles.footerBottom}>
        <div className={styles.footerBottomContent}>
          <div className={styles.footerLinksHorizontal}>
            <Link to="/privacy">Privacy Policy & Terms of Use</Link>
            <span className={styles.separator}>·</span>
            <Link to="/support">Web Support</Link>
            <span className={styles.separator}>·</span>
            <Link to="/">UniVibe Homepage</Link>
          </div>
          <div className={styles.footerMeta}>
            <p>Page last modified {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className={styles.footerCopyright}>
        <div className={styles.copyrightContent}>
          <div className={styles.copyrightText}>
            <p>Produced by the UniVibe Student Center, a division of Student Affairs.</p>
            <p>© {new Date().getFullYear()} University</p>
          </div>
          <div className={styles.universityLogo}>
            <div className={styles.logoPlaceholder}>
              <h4>Student Affairs</h4>
              <p>studentaffairs@univibe.edu</p>
              <p>Campus Building</p>
              <p>University, State 12345-6789</p>
              <p>(555) 824-4804</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;