import React, { useState, useEffect } from 'react';
import styles from './MyReservations.module.scss';
import { Calendar, Clock, MapPin, X, CheckCircle, Loader } from 'lucide-react';
import api from '../../lib/api';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';

function MyReservations() {
  const { currentAdmin: user } = useAdminAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ACTIVE');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchReservations();
  }, [user, filter, navigate]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await api.getMyReservations(filter);
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    setCancellingId(reservationId);
    try {
      await api.cancelReservation(reservationId);
      // Refresh the list
      fetchReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert(error.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isPastReservation = (date) => {
    const reservationDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return reservationDate < today;
  };

  return (
    <div className={styles.myReservationsPage}>
      <div className={styles.hero}>
        <h1>My Reservations</h1>
        <p>View and manage your study space bookings</p>
      </div>

      <div className={styles.container}>
        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <button
            className={`${styles.tab} ${filter === 'ACTIVE' ? styles.active : ''}`}
            onClick={() => setFilter('ACTIVE')}
          >
            Active
          </button>
          <button
            className={`${styles.tab} ${filter === 'COMPLETED' ? styles.active : ''}`}
            onClick={() => setFilter('COMPLETED')}
          >
            Completed
          </button>
          <button
            className={`${styles.tab} ${filter === 'CANCELLED' ? styles.active : ''}`}
            onClick={() => setFilter('CANCELLED')}
          >
            Cancelled
          </button>
        </div>

        {/* Reservations List */}
        {loading ? (
          <div className={styles.loading}>
            <Loader className={styles.spinner} />
            <p>Loading reservations...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className={styles.empty}>
            <Calendar size={64} className={styles.emptyIcon} />
            <h2>No {filter.toLowerCase()} reservations</h2>
            <p>
              {filter === 'ACTIVE' 
                ? "You don't have any active reservations. Browse study spaces to make one!" 
                : `You don't have any ${filter.toLowerCase()} reservations.`}
            </p>
            {filter === 'ACTIVE' && (
              <button 
                className={styles.browseBtn}
                onClick={() => navigate('/study')}
              >
                Browse Study Spaces
              </button>
            )}
          </div>
        ) : (
          <div className={styles.reservationsList}>
            {reservations.map((reservation) => (
              <div key={reservation.id} className={styles.reservationCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.spaceInfo}>
                    <span className={styles.emoji}>{reservation.space.image}</span>
                    <div>
                      <h3>{reservation.space.name}</h3>
                      <p className={styles.location}>
                        <MapPin size={16} />
                        {reservation.space.location}
                      </p>
                    </div>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[reservation.status.toLowerCase()]}`}>
                    {reservation.status}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.details}>
                    <div className={styles.detail}>
                      <Calendar size={18} />
                      <span>{formatDate(reservation.date)}</span>
                    </div>
                  </div>

                  {reservation.status === 'ACTIVE' && !isPastReservation(reservation.date) && (
                    <button
                      className={styles.cancelBtn}
                      onClick={() => handleCancelReservation(reservation.id)}
                      disabled={cancellingId === reservation.id}
                    >
                      {cancellingId === reservation.id ? (
                        <>
                          <Loader size={16} className={styles.spinner} />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <X size={16} />
                          Cancel Reservation
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.bookedAt}>
                    Booked on {new Date(reservation.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyReservations;
