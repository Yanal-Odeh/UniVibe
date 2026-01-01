import api from '../lib/api';
import { UserRole, NotificationType } from '../types/event.types';

/**
 * Approve event based on user role
 */
export const approveEventByRole = async (eventId, userRole) => {
  const role = userRole?.toUpperCase();
  
  if (role === UserRole.FACULTY_LEADER) {
    return await api.approveFacultyEvent(eventId, true);
  } else if (role === UserRole.DEAN_OF_FACULTY) {
    return await api.approveDeanEvent(eventId, true);
  } else if (role === UserRole.DEANSHIP_OF_STUDENT_AFFAIRS) {
    return await api.approveDeanshipEvent(eventId, true);
  }
  
  throw new Error('Invalid role for event approval');
};

/**
 * Request revision based on user role
 */
export const requestRevisionByRole = async (eventId, userRole, reason) => {
  const role = userRole?.toUpperCase();
  
  if (role === UserRole.FACULTY_LEADER) {
    return await api.approveFacultyEvent(eventId, false, reason);
  } else if (role === UserRole.DEAN_OF_FACULTY) {
    return await api.approveDeanEvent(eventId, false, reason);
  } else if (role === UserRole.DEANSHIP_OF_STUDENT_AFFAIRS) {
    return await api.approveDeanshipEvent(eventId, false, reason);
  }
  
  throw new Error('Invalid role for revision request');
};

/**
 * Reject event permanently based on user role
 */
export const rejectEventByRole = async (eventId, userRole, reason) => {
  const role = userRole?.toUpperCase();
  
  if (role === UserRole.DEAN_OF_FACULTY) {
    return await api.rejectDeanEvent(eventId, reason);
  } else if (role === UserRole.DEANSHIP_OF_STUDENT_AFFAIRS) {
    return await api.rejectDeanshipEvent(eventId, reason);
  }
  
  throw new Error('Invalid role for event rejection');
};

/**
 * Check if user can reject events permanently
 */
export const canRejectPermanently = (userRole) => {
  const role = userRole?.toUpperCase();
  return role === UserRole.DEAN_OF_FACULTY || 
         role === UserRole.DEANSHIP_OF_STUDENT_AFFAIRS;
};

/**
 * Check if user can request revisions
 */
export const canRequestRevision = (userRole) => {
  const role = userRole?.toUpperCase();
  return role === UserRole.DEAN_OF_FACULTY || 
         role === UserRole.DEANSHIP_OF_STUDENT_AFFAIRS;
};

/**
 * Handle notification actions cleanup
 */
export const cleanupNotificationState = async (notificationId, setters) => {
  const { 
    setNotifications, 
    setProcessingId,
    setProcessedIds,
    clearInputs 
  } = setters;
  
  // Mark as read
  await api.markNotificationAsRead(notificationId);
  
  // Remove from state
  setNotifications(prev => prev.filter(n => n.id !== notificationId));
  
  // Clear processing state
  setProcessingId(null);
  
  // Clear input fields
  if (clearInputs) {
    clearInputs(notificationId);
  }
  
  // Clear cache and trigger refresh
  api.clearCache();
  window.dispatchEvent(new CustomEvent('eventApprovalChanged'));
};
