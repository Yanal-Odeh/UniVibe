import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, XCircle, MessageSquare } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import api from '../../lib/api';
import styles from './Notifications.module.scss';
import { 
  approveEventByRole, 
  requestRevisionByRole, 
  rejectEventByRole,
  canRejectPermanently,
  cleanupNotificationState
} from '../../utils';
import { UserRole } from '../../types';

function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [processingId, setProcessingId] = useState(null);
  const [processedIds, setProcessedIds] = useState(new Set());
  const [denyReason, setDenyReason] = useState({});
  const [showReasonInput, setShowReasonInput] = useState({});
  const [rejectReason, setRejectReason] = useState({});
  const [showRejectInput, setShowRejectInput] = useState({});
  const [revisionResponse, setRevisionResponse] = useState({});
  const [showRevisionInput, setShowRevisionInput] = useState({});
  const [deanshipRevisionResponse, setDeanshipRevisionResponse] = useState({});
  const [showDeanshipRevisionInput, setShowDeanshipRevisionInput] = useState({});
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const { currentAdmin } = useAdminAuth();

  const toggle = async () => {
    const newOpenState = !open;
    setOpen(newOpenState);
    
    // Don't auto-mark as read when opening - let users take action first
    // Notifications will be marked as read after approval/denial or manual dismissal
  };

  // Fetch notifications and unread count
  useEffect(() => {
    if (currentAdmin) {
      fetchNotifications();
      fetchUnreadCount();
      // Poll for new notifications every 5 seconds for faster updates
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 5000);
      return () => clearInterval(interval);
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
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

  const fetchUnreadCount = async () => {
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
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
    setProcessedIds(prev => new Set(prev).add(notification.id));
    
    try {
      await approveEventByRole(notification.eventId, currentAdmin?.role);
      
      await cleanupNotificationState(notification.id, {
        setNotifications,
        setProcessingId,
        setProcessedIds
      });
      
      await fetchUnreadCount();
      alert('Event approved successfully!');
    } catch (error) {
      console.error('Error approving event:', error);
      alert(error.message || 'Failed to approve event');
      setProcessedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      // Update unread count
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleReject = async (notification) => {
    if (!notification.eventId) return;
    
    const reason = rejectReason[notification.id];
    if (!reason || reason.trim() === '') {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setProcessingId(notification.id);
    setProcessedIds(prev => new Set(prev).add(notification.id));
    
    try {
      await rejectEventByRole(notification.eventId, currentAdmin?.role, reason);
      
      await cleanupNotificationState(notification.id, {
        setNotifications,
        setProcessingId,
        setProcessedIds
      });
      
      await fetchUnreadCount();
      
      setRejectReason(prev => ({ ...prev, [notification.id]: '' }));
      setShowRejectInput(prev => ({ ...prev, [notification.id]: false }));
      
      alert('Event permanently rejected');
    } catch (error) {
      console.error('Error rejecting event:', error);
      alert(error.message || 'Failed to reject event');
      setProcessedIds(prev => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (notification) => {
    if (!notification.eventId) return;
    
    const reason = denyReason[notification.id];
    if (!reason || reason.trim() === '') {
      alert('Please provide a reason for requesting revision');
      return;
    }
    
    setProcessingId(notification.id);
    setProcessedIds(prev => new Set(prev).add(notification.id));
    
    try {
      await requestRevisionByRole(notification.eventId, currentAdmin?.role, reason);
      
      await cleanupNotificationState(notification.id, {
        setNotifications,
        setProcessingId,
        setProcessedIds
      });
      
      await fetchUnreadCount();
      
      setDenyReason(prev => ({ ...prev, [notification.id]: '' }));
      setShowReasonInput(prev => ({ ...prev, [notification.id]: false }));
      
      alert('Event denied successfully');
    } catch (error) {
      console.error('Error denying event:', error);
      alert(error.message || 'Failed to deny event');
      setProcessedIds(prev => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevisionResponse = async (notification) => {
    if (!notification.eventId) return;
    
    const response = revisionResponse[notification.id];
    if (!response || response.trim() === '') {
      alert('Please provide a response to the dean');
      return;
    }
    
    setProcessingId(notification.id);
    setProcessedIds(prev => new Set(prev).add(notification.id));
    
    try {
      await api.respondToRevision(notification.eventId, response);
      
      await cleanupNotificationState(notification.id, {
        setNotifications,
        setProcessingId,
        setProcessedIds
      });
      
      await fetchUnreadCount();
      
      setRevisionResponse(prev => ({ ...prev, [notification.id]: '' }));
      setShowRevisionInput(prev => ({ ...prev, [notification.id]: false }));
      
      alert('Response sent and event resubmitted to Dean successfully');
    } catch (error) {
      console.error('Error responding to revision:', error);
      alert(error.message || 'Failed to respond to revision request');
      setProcessedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeanshipRevisionResponse = async (notification) => {
    if (!notification.eventId) return;
    
    const response = deanshipRevisionResponse[notification.id];
    if (!response || response.trim() === '') {
      alert('Please provide a response to the deanship');
      return;
    }
    
    setProcessingId(notification.id);
    setProcessedIds(prev => new Set(prev).add(notification.id));
    
    try {
      await api.respondToDeanshipRevision(notification.eventId, response);
      
      await cleanupNotificationState(notification.id, {
        setNotifications,
        setProcessingId,
        setProcessedIds
      });
      
      await fetchUnreadCount();
      
      setDeanshipRevisionResponse(prev => ({ ...prev, [notification.id]: '' }));
      setShowDeanshipRevisionInput(prev => ({ ...prev, [notification.id]: false }));
      
      alert('Response sent and event resubmitted to Deanship successfully');
    } catch (error) {
      console.error('Error responding to deanship revision:', error);
      alert(error.message || 'Failed to respond to deanship revision request');
      setProcessedIds(prev => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
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
                    <div className={styles.notificationHeader}>
                      <div className={styles.message}>
                        {n.message || 'Notification'}
                        {n.event && (
                          <div className={styles.eventDetails}>
                            <strong>{n.event.title}</strong>
                            {n.event.community && <span> - {n.event.community.name}</span>}
                            {n.event.deanOfFacultyRevisionMessage && (
                              <div className={styles.revisionContext}>
                                <div className={styles.originalRequest}>
                                  <strong>Your Original Request:</strong>
                                  <p>{n.event.deanOfFacultyRevisionMessage}</p>
                                </div>
                                {n.event.facultyLeaderRevisionResponse && (
                                  <div className={styles.facultyResponse}>
                                    <strong>Faculty Leader's Response:</strong>
                                    <p>{n.event.facultyLeaderRevisionResponse}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {n.event.deanshipRevisionMessage && (
                              <div className={styles.revisionContext}>
                                <div className={styles.originalRequest}>
                                  <strong>Deanship's Original Request:</strong>
                                  <p>{n.event.deanshipRevisionMessage}</p>
                                </div>
                                {n.event.deanOfFacultyRevisionResponse && (
                                  <div className={styles.facultyResponse}>
                                    <strong>Dean's Response:</strong>
                                    <p>{n.event.deanOfFacultyRevisionResponse}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => handleDismiss(n.id)}
                          className={styles.dismissBtn}
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <div className={styles.time}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                    
                    {n.type === 'EVENT_PENDING_APPROVAL' && n.eventId && !processedIds.has(n.id) && (
                      <div className={styles.actions}>
                        {processingId !== n.id ? (
                          <>
                            <button
                              onClick={() => handleApprove(n)}
                              disabled={processingId === n.id}
                              className={styles.approveBtn}
                              title="Approve event"
                            >
                              <Check size={16} />
                              Approve
                            </button>
                            
                            {(canRejectPermanently(currentAdmin?.role)) && (
                              <>
                                <button
                                  onClick={() => toggleReasonInput(n.id)}
                                  disabled={processingId === n.id}
                                  className={styles.revisionBtn}
                                  title="Request revision"
                                >
                                  <MessageSquare size={16} />
                                  Request Revision
                                </button>
                                
                                <button
                                  onClick={() => setShowRejectInput(prev => ({
                                    ...prev,
                                    [n.id]: !prev[n.id]
                                  }))}
                                  disabled={processingId === n.id}
                                  className={styles.rejectBtn}
                                  title="Permanently reject event"
                                >
                                  <XCircle size={16} />
                                  Reject Event
                                </button>
                              </>
                            )}
                            
                            {currentAdmin?.role?.toUpperCase() === UserRole.FACULTY_LEADER && (
                              <button
                                onClick={() => toggleReasonInput(n.id)}
                                disabled={processingId === n.id}
                                className={styles.denyBtn}
                                title="Deny event"
                              >
                                <XCircle size={16} />
                                Deny
                              </button>
                            )}
                          </>
                        ) : (
                          <div className={styles.processing}>Processing...</div>
                        )}
                        
                        {showReasonInput[n.id] && (
                          <div className={styles.reasonInput}>
                            <textarea
                              value={denyReason[n.id] || ''}
                              onChange={(e) => setDenyReason(prev => ({
                                ...prev,
                                [n.id]: e.target.value
                              }))}
                              placeholder={(canRejectPermanently(currentAdmin?.role)) ? "Reason for requesting revision..." : "Reason for denial..."}
                              rows={3}
                            />
                            <button
                              onClick={() => handleDeny(n)}
                              disabled={processingId === n.id}
                              className={styles.submitDenyBtn}
                            >
                              {(canRejectPermanently(currentAdmin?.role)) ? 'Request Revision' : 'Submit Denial'}
                            </button>
                          </div>
                        )}
                        
                        {showRejectInput[n.id] && (
                          <div className={styles.reasonInput}>
                            <textarea
                              value={rejectReason[n.id] || ''}
                              onChange={(e) => setRejectReason(prev => ({
                                ...prev,
                                [n.id]: e.target.value
                              }))}
                              placeholder="Reason for permanent rejection..."
                              rows={3}
                            />
                            <button
                              onClick={() => handleReject(n)}
                              disabled={processingId === n.id}
                              className={styles.submitRejectBtn}
                            >
                              Permanently Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {n.type === 'EVENT_NEEDS_REVISION' && n.eventId && !processedIds.has(n.id) && (
                      <div className={styles.actions}>
                        {processingId !== n.id ? (
                          <>
                            <button
                              onClick={() => setShowRevisionInput(prev => ({
                                ...prev,
                                [n.id]: !prev[n.id]
                              }))}
                              disabled={processingId === n.id}
                              className={styles.revisionBtn}
                              title="Respond to revision request"
                            >
                              <MessageSquare size={16} />
                              Respond & Resubmit
                            </button>
                          </>
                        ) : (
                          <div className={styles.processing}>Processing...</div>
                        )}
                        
                        {showRevisionInput[n.id] && (
                          <div className={styles.reasonInput}>
                            <textarea
                              value={revisionResponse[n.id] || ''}
                              onChange={(e) => setRevisionResponse(prev => ({
                                ...prev,
                                [n.id]: e.target.value
                              }))}
                              placeholder="Your response to the dean's request..."
                              rows={3}
                            />
                            <button
                              onClick={() => handleRevisionResponse(n)}
                              disabled={processingId === n.id}
                              className={styles.submitDenyBtn}
                            >
                              Submit & Resubmit to Dean
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {n.type === 'EVENT_NEEDS_REVISION' && n.event?.status === 'NEEDS_REVISION_DEANSHIP' && n.eventId && !processedIds.has(n.id) && currentAdmin?.role?.toUpperCase() === UserRole.DEAN_OF_FACULTY && (
                      <div className={styles.actions}>
                        {processingId !== n.id ? (
                          <>
                            <button
                              onClick={() => setShowDeanshipRevisionInput(prev => ({
                                ...prev,
                                [n.id]: !prev[n.id]
                              }))}
                              disabled={processingId === n.id}
                              className={styles.revisionBtn}
                              title="Respond to deanship revision request"
                            >
                              <MessageSquare size={16} />
                              Respond & Resubmit to Deanship
                            </button>
                          </>
                        ) : (
                          <div className={styles.processing}>Processing...</div>
                        )}
                        
                        {showDeanshipRevisionInput[n.id] && (
                          <div className={styles.reasonInput}>
                            <textarea
                              value={deanshipRevisionResponse[n.id] || ''}
                              onChange={(e) => setDeanshipRevisionResponse(prev => ({
                                ...prev,
                                [n.id]: e.target.value
                              }))}
                              placeholder="Your response to the deanship's request..."
                              rows={3}
                            />
                            <button
                              onClick={() => handleDeanshipRevisionResponse(n)}
                              disabled={processingId === n.id}
                              className={styles.submitDenyBtn}
                            >
                              Submit & Resubmit to Deanship
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
