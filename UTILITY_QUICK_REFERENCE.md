# Utility Functions Quick Reference

## Import Patterns

### Event Utilities
```javascript
import { 
  getStatusLabel,      // Get human-readable status text
  getStatusClass,      // Get CSS class for status
  formatEventDate,     // Format date for display
  mapEventWithApprovalStatus, // Map event with approval data
  getStatusColor,      // Get color for status
  needsRevision,       // Check if needs revision
  isPending            // Check if pending approval
} from '../../utils';
```

### Notification Utilities
```javascript
import {
  approveEventByRole,        // Approve based on role
  requestRevisionByRole,     // Request revision based on role
  rejectEventByRole,         // Reject permanently based on role
  canRejectPermanently,      // Check rejection permission
  canRequestRevision,        // Check revision permission
  cleanupNotificationState   // Cleanup after action
} from '../../utils';
```

### Role Utilities
```javascript
import {
  canPlanEvents,       // Check if can plan events
  canApproveFaculty,   // Check faculty approval permission
  canApproveDean,      // Check dean approval permission
  canApproveDeanship,  // Check deanship approval permission
  getRoleDisplayName   // Get friendly role name
} from '../../utils';
```

### Toast Utilities
```javascript
import { createToast, ToastType } from '../../utils';

// In component
const [toast, setToast] = useState({ show: false, message: '', type: '' });
const showToast = createToast(setToast);

// Usage
showToast('Success!', ToastType.SUCCESS);
showToast('Error!', ToastType.ERROR);
```

### Type Constants
```javascript
import { 
  EventStatus,         // Event status constants
  ApprovalStatus,      // Approval status constants
  UserRole,            // User role constants
  NotificationType     // Notification type constants
} from '../../types';

// Usage
if (status === EventStatus.APPROVED) { ... }
if (role === UserRole.DEAN_OF_FACULTY) { ... }
```

### Common Components
```javascript
import { 
  StatusBadge,      // Status display badge
  RevisionSection,  // Revision form section
  ActionButtons     // Approval action buttons
} from '../../Components/common';
```

## Common Usage Examples

### Event Status Display
```javascript
// Old way
<span className={`${styles.status} ${styles[getStatusClass(event.status)]}`}>
  {getStatusLabel(event.status)}
</span>

// New way
<StatusBadge status={event.status} />
```

### Role-Based Approval
```javascript
// Old way
const userRole = currentAdmin?.role?.toUpperCase();
if (userRole === 'FACULTY_LEADER') {
  await api.approveFacultyEvent(eventId, true);
} else if (userRole === 'DEAN_OF_FACULTY') {
  await api.approveDeanEvent(eventId, true);
} else if (userRole === 'DEANSHIP_OF_STUDENT_AFFAIRS') {
  await api.approveDeanshipEvent(eventId, true);
}

// New way
await approveEventByRole(eventId, currentAdmin?.role);
```

### Revision Request Form
```javascript
// Old way - 40+ lines of JSX

// New way
<RevisionSection
  revisionMessage={event.deanOfFacultyRevisionMessage}
  responseValue={revisionResponse[event.id] || ''}
  onResponseChange={(e) => setRevisionResponse(prev => ({
    ...prev,
    [event.id]: e.target.value
  }))}
  onSubmit={() => handleRespondToRevision(event.id)}
  isSubmitting={submitting === event.id}
/>
```

### Permission Checks
```javascript
// Old way
const canPlanEvents = userRole === 'CLUB_LEADER';

// New way
import { canPlanEvents } from '../../utils';
const hasPermission = canPlanEvents(userRole);
```

### Event Mapping
```javascript
// Old way
const mappedEvent = {
  ...event,
  approvalStatus: {
    facultyLeader: event.facultyLeaderApproval?.toLowerCase() || 'pending',
    deanOfFaculty: event.deanOfFacultyApproval?.toLowerCase() || 'pending',
    deanshipOfStudentAffairs: event.deanshipApproval?.toLowerCase() || 'pending'
  },
  communityName: event.community?.name || 'Unknown Community'
};

// New way
const mappedEvent = mapEventWithApprovalStatus(event);
```

### Cleanup After Action
```javascript
// Old way
await api.markNotificationAsRead(notificationId);
setNotifications(prev => prev.filter(n => n.id !== notificationId));
setProcessingId(null);
setProcessedIds(prev => { ... });
api.clearCache();
window.dispatchEvent(new CustomEvent('eventApprovalChanged'));

// New way
await cleanupNotificationState(notificationId, {
  setNotifications,
  setProcessingId,
  setProcessedIds
});
```

### Action Buttons with Permissions
```javascript
// Old way - 30+ lines of conditional buttons

// New way
<ActionButtons
  onApprove={() => handleApprove(notification)}
  onDeny={() => handleDeny(notification)}
  onReject={() => handleReject(notification)}
  isProcessing={processingId === notification.id}
  showReject={canRejectPermanently(currentAdmin?.role)}
/>
```

## API Reference

### Event Helpers

#### getStatusLabel(status: string): string
Returns human-readable status label.
```javascript
getStatusLabel('PENDING_FACULTY_APPROVAL') 
// → "Pending Faculty Leader"
```

#### getStatusClass(status: string): string
Returns CSS class name for styling.
```javascript
getStatusClass('APPROVED') 
// → "approved"
```

#### formatEventDate(dateString: string): string
Formats date for display.
```javascript
formatEventDate('2024-01-15T10:00:00Z') 
// → "Jan 15, 2024, 10:00 AM"
```

#### needsRevision(status: string): boolean
Checks if event needs revision.
```javascript
needsRevision('NEEDS_REVISION_DEAN') 
// → true
```

### Notification Helpers

#### approveEventByRole(eventId: string, userRole: string): Promise<void>
Approves event based on user role.
```javascript
await approveEventByRole('event-123', 'DEAN_OF_FACULTY');
```

#### requestRevisionByRole(eventId: string, userRole: string, reason: string): Promise<void>
Requests revision based on user role.
```javascript
await requestRevisionByRole('event-123', 'DEAN_OF_FACULTY', 'Please add more details');
```

#### rejectEventByRole(eventId: string, userRole: string, reason: string): Promise<void>
Permanently rejects event based on user role.
```javascript
await rejectEventByRole('event-123', 'DEAN_OF_FACULTY', 'Does not meet requirements');
```

#### canRejectPermanently(userRole: string): boolean
Checks if user can permanently reject events.
```javascript
canRejectPermanently('DEAN_OF_FACULTY') 
// → true
```

### Role Helpers

#### canPlanEvents(userRole: string): boolean
Checks if user can plan events.
```javascript
canPlanEvents('CLUB_LEADER') 
// → true
```

#### getRoleDisplayName(role: string): string
Gets user-friendly role name.
```javascript
getRoleDisplayName('DEAN_OF_FACULTY') 
// → "Dean of Faculty"
```

### Toast Helpers

#### createToast(setToast: Function): Function
Creates a toast notification function with auto-dismiss.
```javascript
const showToast = createToast(setToast);
showToast('Success!', 'success');
showToast('Error occurred', 'error');
```

## Component Props Reference

### StatusBadge
```typescript
{
  status: string,        // Event status
  className?: string     // Additional CSS class
}
```

### RevisionSection
```typescript
{
  revisionMessage: string,
  previousResponse?: string,
  responseValue: string,
  onResponseChange: (e: Event) => void,
  onSubmit: () => void,
  isSubmitting: boolean,
  placeholder?: string,
  submitButtonText?: string,
  title?: string
}
```

### ActionButtons
```typescript
{
  onApprove: () => void,
  onDeny: () => void,
  onReject?: () => void,
  isProcessing: boolean,
  showReject?: boolean,
  approveText?: string,
  denyText?: string,
  rejectText?: string
}
```

## Type Constants Reference

### EventStatus
```javascript
EventStatus.PENDING_FACULTY_APPROVAL
EventStatus.PENDING_DEAN_APPROVAL
EventStatus.NEEDS_REVISION_DEAN
EventStatus.PENDING_DEANSHIP_APPROVAL
EventStatus.NEEDS_REVISION_DEANSHIP
EventStatus.APPROVED
EventStatus.REJECTED
```

### UserRole
```javascript
UserRole.STUDENT
UserRole.CLUB_LEADER
UserRole.FACULTY_LEADER
UserRole.DEAN_OF_FACULTY
UserRole.DEANSHIP_OF_STUDENT_AFFAIRS
UserRole.ADMIN
```

### NotificationType
```javascript
NotificationType.EVENT_PENDING_APPROVAL
NotificationType.EVENT_APPROVED
NotificationType.EVENT_REJECTED
NotificationType.EVENT_NEEDS_REVISION
NotificationType.EVENT_REMINDER_1_DAY
NotificationType.EVENT_REMINDER_1_HOUR
NotificationType.APPLICATION_APPROVED
NotificationType.APPLICATION_REJECTED
```
