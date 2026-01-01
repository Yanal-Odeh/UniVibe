import { UserRole } from '../types/event.types';

/**
 * Check if user has permission to plan events
 */
export const canPlanEvents = (userRole) => {
  return userRole === UserRole.CLUB_LEADER;
};

/**
 * Check if user can approve at faculty level
 */
export const canApproveFaculty = (userRole) => {
  return userRole === UserRole.FACULTY_LEADER;
};

/**
 * Check if user can approve at dean level
 */
export const canApproveDean = (userRole) => {
  return userRole === UserRole.DEAN_OF_FACULTY;
};

/**
 * Check if user can approve at deanship level
 */
export const canApproveDeanship = (userRole) => {
  return userRole === UserRole.DEANSHIP_OF_STUDENT_AFFAIRS;
};

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [UserRole.STUDENT]: 'Student',
    [UserRole.CLUB_LEADER]: 'Club Leader',
    [UserRole.FACULTY_LEADER]: 'Faculty Leader',
    [UserRole.DEAN_OF_FACULTY]: 'Dean of Faculty',
    [UserRole.DEANSHIP_OF_STUDENT_AFFAIRS]: 'Deanship of Student Affairs',
    [UserRole.ADMIN]: 'Administrator'
  };
  return roleNames[role] || role;
};
