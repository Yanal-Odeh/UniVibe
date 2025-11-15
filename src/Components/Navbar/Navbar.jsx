// src/Components/Navbar/Navbar.jsx
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.scss';
import Notifications from '../Notifications/Notifications';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { User } from 'lucide-react';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentAdmin, isAuthenticated, logout } = useAdminAuth();
  const navigate = useNavigate();

  // Edit these menu items as needed
  const menuItems = [
    {
      title: 'INFORMATION',
      path: '/information',
      dropdown: [
        { name: 'Information Center', path: '/information-center' },
        { name: 'Forms and Applications', path: '/forms' },
        { name: 'Policies and Guidelines', path: '/policies' },
        { name: 'Virtual Tour', path: '/tour' }
      ]
    },
    {
      title: 'EVENTS',
      path: '/events',
      dropdown: [
        { name: 'Plan Events', path: '/plan-events' },
        { name: 'Event Calendar', path: '/calendar' },
        { name: 'Virtual Events', path: '/virtual-events' }
      ]
    },
    {
      title: 'LEARN & ENJOY',
      path: '/learn',
      dropdown: [
        { name: 'Study Spaces', path: '/study' },
        { name: 'Dine, Play, Shop', path: '/dine' },
        { name: 'Services', path: '/services' }
      ]
    },
    {
      title: 'COMMUNITIES',
      path: '/communities'
    },
    {
      title: 'ABOUT',
      path: '/about'
    },
    {
      title: 'MENU',
      path: '#',
      isMenu: true // Special flag for hamburger menu
    }
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoBox}>
            <span className={styles.logoText}>UniVibe</span>
          </div>
          <div className={styles.logoSubtext}>
            <span>Student Center</span>
            <span>& Event Services</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className={styles.navMenu}>
          {menuItems.map((item, index) => (
            <div key={index} className={styles.navItem}>
              {item.isMenu ? (
                <button 
                  className={styles.menuButton}
                  onClick={toggleMobileMenu}
                  aria-label="Toggle menu"
                >
                  <span>{item.title}</span>
                  <div className={styles.hamburger}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </button>
              ) : (
                <>
                  <NavLink 
                    to={item.path} 
                    className={({ isActive }) => 
                      isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                    }
                  >
                    {item.title}
                  </NavLink>
                  
                  {/* Dropdown Menu */}
                  {item.dropdown && (
                    <div className={styles.dropdown}>
                      {item.dropdown.map((subItem, subIndex) => (
                        <NavLink 
                          key={subIndex} 
                          to={subItem.path}
                          className={({ isActive }) => 
                            isActive ? `${styles.dropdownItem} ${styles.active}` : styles.dropdownItem
                          }
                        >
                          {subItem.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenuOverlay}>
            <div className={styles.mobileMenuContent}>
              <button 
                className={styles.closeButton}
                onClick={toggleMobileMenu}
              >
                ✕
              </button>
              
              {menuItems.map((item, index) => (
                !item.isMenu && (
                  <div key={index} className={styles.mobileMenuItem}>
                    <NavLink 
                      to={item.path}
                      className={({ isActive }) => 
                        isActive ? `${styles.mobileMenuLink} ${styles.active}` : styles.mobileMenuLink
                      }
                      onClick={toggleMobileMenu}
                    >
                      {item.title}
                    </NavLink>
                    
                    {item.dropdown && (
                      <div className={styles.mobileDropdown}>
                        {item.dropdown.map((subItem, subIndex) => (
                          <NavLink 
                            key={subIndex}
                            to={subItem.path}
                            className={({ isActive }) => 
                              isActive ? `${styles.mobileDropdownItem} ${styles.active}` : styles.mobileDropdownItem
                            }
                            onClick={toggleMobileMenu}
                          >
                            {subItem.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        )}
        {/* Auth area (notifications + login icon or signed-in name) */}
        <div className={styles.authArea}>
          {/* Notifications bell */}
          <Notifications />
          {!isAuthenticated ? (
            <button
              className={styles.authButton}
              onClick={() => navigate('/signin')}
              aria-label="Sign in"
              title="Sign in"
            >
              <User size={18} />
            </button>
          ) : (
            <div className={styles.signedIn}>
              <button
                className={styles.authButton}
                onClick={() => navigate('/admin-panel')}
                title={`Signed in as ${currentAdmin?.name}`}
              >
                <User size={14} />
                {currentAdmin?.name || 'Admin'}
              </button>
              <button
                className={styles.logoutButton}
                onClick={() => { logout(); navigate('/'); }}
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;