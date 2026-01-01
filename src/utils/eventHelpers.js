import { EventStatus } from '../types/event.types';

/**
 * Get human-readable status label
 */
export const getStatusLabel = (status) => {
  const statusLabels = {
    [EventStatus.PENDING_FACULTY_APPROVAL]: 'Pending Faculty Leader',
    [EventStatus.PENDING_DEAN_APPROVAL]: 'Pending Dean of Faculty',
    [EventStatus.NEEDS_REVISION_DEAN]: 'Needs Revision - Dean Request',
    [EventStatus.PENDING_DEANSHIP_APPROVAL]: 'Pending Deanship',
    [EventStatus.NEEDS_REVISION_DEANSHIP]: 'Needs Revision - Deanship Request',
    [EventStatus.APPROVED]: 'Approved',
    [EventStatus.REJECTED]: 'Rejected',
    // Lowercase versions for backward compatibility
    'pending_faculty_approval': 'Pending Faculty Leader',
    'pending_dean_approval': 'Pending Dean of Faculty',
    'needs_revision_dean': 'Needs Revision - Dean Request',
    'pending_deanship_approval': 'Pending Deanship',
    'needs_revision_deanship': 'Needs Revision - Deanship Request',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'draft': 'Draft'
  };
  return statusLabels[status] || status;
};

/**
 * Get status class name for styling
 */
export const getStatusClass = (status) => {
  const normalizedStatus = status?.toLowerCase() || '';
  if (normalizedStatus === 'approved') return 'approved';
  if (normalizedStatus === 'rejected') return 'rejected';
  if (normalizedStatus.includes('revision')) return 'revision';
  if (normalizedStatus.includes('pending')) return 'pending';
  return 'draft';
};

/**
 * Format date for display
 */
export const formatEventDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Map event to include approval status
 */
export const mapEventWithApprovalStatus = (event) => {
  const approvalStatus = {
    facultyLeader: event.facultyLeaderApproval?.toLowerCase() || 'pending',
    deanOfFaculty: event.deanOfFacultyApproval?.toLowerCase() || 'pending',
    deanshipOfStudentAffairs: event.deanshipApproval?.toLowerCase() || 'pending'
  };
  
  return {
    ...event,
    approvalStatus,
    communityName: event.community?.name || 'Unknown Community'
  };
};

/**
 * Get status color for badges
 */
export const getStatusColor = (status) => {
  switch(status?.toUpperCase()) {
    case EventStatus.APPROVED: 
      return 'green';
    case EventStatus.PENDING_FACULTY_APPROVAL:
    case EventStatus.PENDING_DEAN_APPROVAL:
    case EventStatus.PENDING_DEANSHIP_APPROVAL:
      return 'yellow';
    case EventStatus.NEEDS_REVISION_DEAN:
    case EventStatus.NEEDS_REVISION_DEANSHIP:
      return 'orange';
    case EventStatus.REJECTED: 
      return 'red';
    default: 
      return 'gray';
  }
};

/**
 * Check if event needs revision
 */
export const needsRevision = (status) => {
  return status === EventStatus.NEEDS_REVISION_DEAN || 
         status === EventStatus.NEEDS_REVISION_DEANSHIP;
};

/**
 * Check if event is pending approval
 */
export const isPending = (status) => {
  return status === EventStatus.PENDING_FACULTY_APPROVAL ||
         status === EventStatus.PENDING_DEAN_APPROVAL ||
         status === EventStatus.PENDING_DEANSHIP_APPROVAL;
};
