import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunities } from '../../contexts/CommunitiesContext';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import api from '../../lib/api';
import Loader from '../../Components/Loader/Loader';
import styles from './FormsApplications.module.scss';

function FormsApplications() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    studentNumber: '',
    age: '',
    major: '',
    phoneNumber: '',
    city: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [successMessage, setSuccessMessage] = useState('');
  
  const { communities, refreshCommunities } = useCommunities();
  const { currentAdmin, isAuthenticated } = useAdminAuth();

  useEffect(() => {
    refreshCommunities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e, communityId) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'Please sign in to join a community' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Submit application
      await api.createApplication({
        communityId,
        name: formData.name,
        studentNumber: formData.studentNumber,
        age: formData.age,
        major: formData.major,
        phoneNumber: formData.phoneNumber,
        city: formData.city
      });

      // Close modal and show success message
      setFormData({
        name: '',
        studentNumber: '',
        age: '',
        major: '',
        phoneNumber: '',
        city: ''
      });
      setSelectedCommunity(null);
      setMessage({ type: '', text: '' });
      
      // Show success message that persists outside modal
      setSuccessMessage('Application submitted successfully! Waiting for admin approval.');
      setTimeout(() => setSuccessMessage(''), 5000); // Hide after 5 seconds
      
      // Refresh communities to update member count
      refreshCommunities();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to submit application. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const openForm = (community) => {
    // Check if user is signed in
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    setSelectedCommunity(community);
    setMessage({ type: '', text: '' });
    // Pre-fill name if user is logged in
    if (currentAdmin) {
      setFormData(prev => ({
        ...prev,
        name: currentAdmin.name || ''
      }));
    }
  };

  const closeForm = () => {
    setSelectedCommunity(null);
    setFormData({
      name: '',
      studentNumber: '',
      age: '',
      major: '',
      phoneNumber: '',
      city: ''
    });
    setMessage({ type: '', text: '' });
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Join a Community</h1>
        <p>Apply to join any of our vibrant student communities</p>
      </div>

      {successMessage && (
        <div className={styles.successAlert}>
          <span className={styles.successIcon}>✓</span>
          {successMessage}
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>
        </div>

        <div className={styles.communitiesGrid}>
          {filteredCommunities.map(community => (
            <div key={community.id} className={styles.communityCard}>
              <div 
                className={styles.communityIcon}
                style={{ backgroundColor: community.color }}
              >
                {community.avatar}
              </div>
              <div className={styles.communityContent}>
                <h3>{community.name}</h3>
                <p>{community.description}</p>
                <div className={styles.communityMeta}>
                  <span className={styles.members}>
                    👥 {community.members?.length || 0} members
                  </span>
                </div>
              </div>
              <div className={styles.communityActions}>
                <button 
                  className={styles.joinBtn}
                  onClick={() => openForm(community)}
                >
                  Join Community
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCommunities.length === 0 && (
          <div className={styles.emptyState}>
            <p>No communities found matching your search.</p>
          </div>
        )}
      </div>

      {/* Join Form Modal */}
      {selectedCommunity && (
        <div className={styles.modalOverlay} onClick={closeForm}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeForm}>
              ✕
            </button>
            
            <div 
              className={styles.modalHeader}
              style={{ background: `linear-gradient(135deg, ${selectedCommunity.color} 0%, ${selectedCommunity.color}dd 100%)` }}
            >
              <div className={styles.modalIcon}>{selectedCommunity.avatar}</div>
              <h2>Join {selectedCommunity.name}</h2>
              <p>Fill out the form below to apply</p>
            </div>

            <div className={styles.modalBody}>
              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={(e) => handleSubmit(e, selectedCommunity.id)}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Student Number *</label>
                    <input
                      type="text"
                      name="studentNumber"
                      value={formData.studentNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your student number"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Enter your age"
                      min="16"
                      max="100"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Major *</label>
                    <input
                      type="text"
                      name="major"
                      value={formData.major}
                      onChange={handleInputChange}
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    className={styles.cancelBtn}
                    onClick={closeForm}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={submitting}
                  >
                    {submitting ? <Loader size="small" /> : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormsApplications;