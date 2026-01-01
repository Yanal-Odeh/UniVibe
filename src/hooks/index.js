import { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * Custom hook for managing events with real-time updates
 */
export const useEvents = (filters = {}, userId = null) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      api.clearCache();
      const response = await api.getEvents(filters, true);
      let eventsData = response.events || [];
      
      // Filter by user if provided
      if (userId) {
        eventsData = eventsData.filter(event => event.createdBy === userId);
      }
      
      setEvents(eventsData);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    // Poll for updates every second
    const interval = setInterval(fetchEvents, 1000);
    
    // Listen for approval changes
    const handleApprovalChange = () => {
      fetchEvents();
    };
    
    window.addEventListener('eventApprovalChanged', handleApprovalChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('eventApprovalChanged', handleApprovalChange);
    };
  }, [refetchTrigger, userId, JSON.stringify(filters)]);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  return { events, loading, error, refetch };
};

/**
 * Custom hook for managing notifications
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      await fetchUnreadCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  return { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    markAsRead,
    refetch: fetchNotifications 
  };
};

/**
 * Custom hook for toast notifications
 */
export const useToast = () => {
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  return { toast, showToast, hideToast };
};

/**
 * Custom hook for event approval workflow
 */
export const useEventApproval = () => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const approve = async (eventId, userRole, callback) => {
    setProcessing(true);
    setError(null);
    
    try {
      const role = userRole?.toUpperCase();
      
      if (role === 'FACULTY_LEADER') {
        await api.approveFacultyEvent(eventId, true);
      } else if (role === 'DEAN_OF_FACULTY') {
        await api.approveDeanEvent(eventId, true);
      } else if (role === 'DEANSHIP_OF_STUDENT_AFFAIRS') {
        await api.approveDeanshipEvent(eventId, true);
      }
      
      api.clearCache();
      window.dispatchEvent(new CustomEvent('eventApprovalChanged'));
      
      if (callback) callback();
      return true;
    } catch (err) {
      console.error('Error approving event:', err);
      setError(err.message || 'Failed to approve event');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const requestRevision = async (eventId, userRole, reason, callback) => {
    setProcessing(true);
    setError(null);
    
    try {
      const role = userRole?.toUpperCase();
      
      if (role === 'FACULTY_LEADER') {
        await api.approveFacultyEvent(eventId, false, reason);
      } else if (role === 'DEAN_OF_FACULTY') {
        await api.approveDeanEvent(eventId, false, reason);
      } else if (role === 'DEANSHIP_OF_STUDENT_AFFAIRS') {
        await api.approveDeanshipEvent(eventId, false, reason);
      }
      
      api.clearCache();
      window.dispatchEvent(new CustomEvent('eventApprovalChanged'));
      
      if (callback) callback();
      return true;
    } catch (err) {
      console.error('Error requesting revision:', err);
      setError(err.message || 'Failed to request revision');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const reject = async (eventId, userRole, reason, callback) => {
    setProcessing(true);
    setError(null);
    
    try {
      const role = userRole?.toUpperCase();
      
      if (role === 'DEAN_OF_FACULTY') {
        await api.rejectDeanEvent(eventId, reason);
      } else if (role === 'DEANSHIP_OF_STUDENT_AFFAIRS') {
        await api.rejectDeanshipEvent(eventId, reason);
      }
      
      api.clearCache();
      window.dispatchEvent(new CustomEvent('eventApprovalChanged'));
      
      if (callback) callback();
      return true;
    } catch (err) {
      console.error('Error rejecting event:', err);
      setError(err.message || 'Failed to reject event');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  return { approve, requestRevision, reject, processing, error };
};

/**
 * Custom hook for form validation
 */
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (fieldName, value) => {
    if (!validationRules[fieldName]) return '';
    
    const rules = validationRules[fieldName];
    
    if (rules.required && (!value || value.trim() === '')) {
      return rules.required;
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} characters required`;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} characters allowed`;
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.patternMessage || 'Invalid format';
    }
    
    if (rules.custom) {
      return rules.custom(value, values);
    }
    
    return '';
  };

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validate(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validate(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));
    
    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues
  };
};
