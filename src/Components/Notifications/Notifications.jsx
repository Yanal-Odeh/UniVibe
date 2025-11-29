import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, XCircle } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import api from '../../lib/api';
import styles from './Notifications.module.scss';

function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [denyReason, setDenyReason] = useState({});
  const [showReasonInput, setShowReasonInput] = useState({});
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const { currentAdmin } = useAdminAuth();

  const toggle = () => setOpen(o => !o);

  // Fetch notifications
  useEffect(() => {
    if (currentAdmin) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentAdmin]);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // close when clicking outside
  useEffect(() => {
    function onDoc(e) {
      if (!open) return;
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [open]);

  const handleApprove = async (notification) => {
    if (!notification.eventId) return;
    
    setProcessingId(notification.id);
    try {
      // Determine which approval endpoint to use based on notification type
      if (notification.type === 'EVENT_PENDING_APPROVAL') {
        await api.approveFacultyEvent(notification.eventId, true);
      }
      
      // Mark notification as read
      await api.markNotificationAsRead(notification.id);
      
      // Refresh notifications
      await fetchNotifications();
      
      alert('Event approved successfully!');
    } catch (error) {
      console.error('Error approving event:', error);
      alert(error.message || 'Failed to approve event');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (notification) => {
    if (!notification.eventId) return;
    
    const reason = denyReason[notification.id];
    if (!reason || reason.trim() === '') {
      alert('Please provide a reason for denial');
      return;
    }
    
    setProcessingId(notification.id);
    try {
      // Determine which approval endpoint to use based on notification type
      if (notification.type === 'EVENT_PENDING_APPROVAL') {
        await api.approveFacultyEvent(notification.eventId, false, reason);
      }
      
      // Mark notification as read
      await api.markNotificationAsRead(notification.id);
      
      // Refresh notifications
      await fetchNotifications();
      
      // Clear reason input
      setDenyReason(prev => ({ ...prev, [notification.id]: '' }));
      setShowReasonInput(prev => ({ ...prev, [notification.id]: false }));
      
      alert('Event denied successfully');
    } catch (error) {
      console.error('Error denying event:', error);
      alert(error.message || 'Failed to deny event');
    } finally {
      setProcessingId(null);
    }
  };

  const toggleReasonInput = (notificationId) => {
    setShowReasonInput(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={styles.container}>
      <button
        ref={btnRef}
        className={styles.bellButton}
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <div ref={panelRef} className={styles.panel} role="dialog" aria-label="Notifications panel">
          <div className={styles.panelHeader}>
            <strong>Notifications</strong>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
              <X size={14} />
            </button>
          </div>

          <div className={styles.panelBody}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No notifications</div>
            ) : (
              <ul className={styles.list}>
                {notifications.map((n) => (
                  <li key={n.id} className={`${styles.item} ${!n.read ? styles.unread : ''}`}>
                    <div className={styles.message}>
                      {n.message || 'Notification'}
                      {n.event && (
                        <div className={styles.eventDetails}>
                          <strong>{n.event.title}</strong>
                          {n.event.community && <span> - {n.event.community.name}</span>}
                        </div>
                      )}
                    </div>
                    <div className={styles.time}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                    
                    {n.type === 'EVENT_PENDING_APPROVAL' && !n.read && n.eventId && (
                      <div className={styles.actions}>
                        <button
                          onClick={() => handleApprove(n)}
                          disabled={processingId === n.id}
                          className={styles.approveBtn}
                          title="Approve event"
                        >
                          <Check size={16} />
                          Approve
                        </button>
                        
                        <button
                          onClick={() => toggleReasonInput(n.id)}
                          disabled={processingId === n.id}
                          className={styles.denyBtn}
                          title="Deny event"
                        >
                          <XCircle size={16} />
                          Deny
                        </button>
                        
                        {showReasonInput[n.id] && (
                          <div className={styles.reasonInput}>
                            <textarea
                              value={denyReason[n.id] || ''}
                              onChange={(e) => setDenyReason(prev => ({
                                ...prev,
                                [n.id]: e.target.value
                              }))}
                              placeholder="Reason for denial..."
                              rows={3}
                            />
                            <button
                              onClick={() => handleDeny(n)}
                              disabled={processingId === n.id}
                              className={styles.submitDenyBtn}
                            >
                              Submit Denial
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
