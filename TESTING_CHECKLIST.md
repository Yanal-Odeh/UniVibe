# Testing Checklist - UniVibe Refactoring

## Pre-Testing Setup

### ✅ Environment Setup
- [ ] Node.js and npm installed
- [ ] PostgreSQL database running
- [ ] Environment variables configured (.env)
- [ ] Dependencies installed (`npm install`)
- [ ] Backend server ready
- [ ] Frontend dev server ready

### ✅ Start Servers
```bash
# Terminal 1 - Backend
cd c:\Users\youni\Desktop\apps\UniVibe
npm run server

# Terminal 2 - Frontend  
cd c:\Users\youni\Desktop\apps\UniVibe
npm run dev
```

---

## 1. Build & Compilation Tests

### ✅ Build Tests
- [ ] **Frontend builds without errors**
  ```bash
  npm run build
  ```
  - Expected: No TypeScript/ESLint errors
  - Expected: Build completes successfully

- [ ] **No import errors**
  - Check browser console for:
    - ❌ "Cannot find module"
    - ❌ "Unexpected token"
    - ❌ "Module not found"

- [ ] **All utilities export correctly**
  - Test import in browser console:
    ```javascript
    import { getStatusLabel } from './src/utils';
    console.log(getStatusLabel('APPROVED'));
    // Should output: "Approved"
    ```

---

## 2. Visual Regression Tests

### ✅ Status Badge Component
Navigate to: Plan Events page

- [ ] **Status badges display correctly**
  - [ ] Pending status: Gray border, gray text
  - [ ] Revision status: Orange border, orange text
  - [ ] Approved status: Green border, green text
  - [ ] Rejected status: Red border, red text

- [ ] **Status labels are readable**
  - [ ] "Pending Faculty Leader"
  - [ ] "Pending Dean of Faculty"
  - [ ] "Needs Revision - Dean Request"
  - [ ] "Approved"
  - [ ] "Rejected"

- [ ] **Responsive design works**
  - [ ] Desktop view (1920x1080)
  - [ ] Tablet view (768x1024)
  - [ ] Mobile view (375x667)

### ✅ Revision Section Component
Navigate to: Plan Events → Event with revision status

- [ ] **Revision section displays**
  - [ ] Header with icon visible
  - [ ] Revision message shown in white box
  - [ ] Previous response shown (if exists)
  - [ ] Textarea for new response
  - [ ] Submit button styled correctly

- [ ] **Styling matches design**
  - [ ] Orange theme (#f59e0b)
  - [ ] Proper spacing and padding
  - [ ] Rounded corners
  - [ ] Hover effects work

### ✅ Action Buttons Component
Navigate to: Notifications panel

- [ ] **Buttons display correctly**
  - [ ] Approve button: Green with check icon
  - [ ] Request Revision button: Orange with message icon
  - [ ] Reject button: Red with X icon

- [ ] **Role-based visibility**
  - [ ] Faculty Leader: Approve, Deny (no Reject)
  - [ ] Dean: Approve, Request Revision, Reject Event
  - [ ] Deanship: Approve, Request Revision, Reject Event

- [ ] **Hover effects work**
  - [ ] Buttons lift on hover
  - [ ] Shadow appears
  - [ ] Color darkens

---

## 3. Functional Tests - Club Leader

### ✅ Create Event
1. [ ] Login as Club Leader
2. [ ] Click "Plan Event" button
3. [ ] Fill in form:
   - [ ] Title: "Test Event"
   - [ ] Description: "Testing refactored code"
   - [ ] Select community
   - [ ] Select college (auto-assigned from community)
   - [ ] Select location
   - [ ] Set start date
   - [ ] Set capacity
4. [ ] Submit form
5. [ ] **Verify:**
   - [ ] Toast notification: "Event submitted for approval!"
   - [ ] Event appears in list
   - [ ] Status shows "Pending Faculty Leader"
   - [ ] Status badge is gray

### ✅ View Event Status
1. [ ] Find created event in list
2. [ ] **Verify status badge:**
   - [ ] Color matches status
   - [ ] Text is readable
   - [ ] Badge is centered

---

## 4. Functional Tests - Faculty Leader

### ✅ Approve Event
1. [ ] Login as Faculty Leader
2. [ ] Open Notifications panel (bell icon)
3. [ ] Find pending event notification
4. [ ] **Verify notification display:**
   - [ ] Event title shown
   - [ ] Community name shown
   - [ ] Approve button visible
   - [ ] Deny button visible (no Reject button)
5. [ ] Click "Approve"
6. [ ] **Verify:**
   - [ ] Toast: "Event approved successfully!"
   - [ ] Notification removed from list
   - [ ] Unread count decreases
   - [ ] Event status updates to "Pending Dean of Faculty"

### ✅ Deny Event (Request Revision)
1. [ ] Login as Faculty Leader
2. [ ] Find another pending event
3. [ ] Click "Deny" button
4. [ ] **Verify:**
   - [ ] Textarea appears
   - [ ] Placeholder text shown
5. [ ] Enter reason: "Please add more details"
6. [ ] Click "Submit Denial"
7. [ ] **Verify:**
   - [ ] Toast: "Event denied successfully"
   - [ ] Notification removed
   - [ ] Event status: "Needs Revision - Dean Request"

---

## 5. Functional Tests - Club Leader (Revision Response)

### ✅ Respond to Revision
1. [ ] Login as Club Leader
2. [ ] Navigate to Plan Events
3. [ ] Find event with "Needs Revision - Dean Request"
4. [ ] **Verify revision section:**
   - [ ] Orange background
   - [ ] Dean's message displayed
   - [ ] Textarea for response
   - [ ] Submit button
5. [ ] Enter response: "Details added as requested"
6. [ ] Click "Submit Response"
7. [ ] **Verify:**
   - [ ] Toast: "Response sent and event resubmitted to Dean successfully"
   - [ ] Revision section disappears
   - [ ] Status updates to "Pending Faculty Leader"

---

## 6. Functional Tests - Dean of Faculty

### ✅ Approve Event
1. [ ] Login as Dean of Faculty
2. [ ] Open Notifications
3. [ ] Find event pending approval
4. [ ] **Verify three buttons visible:**
   - [ ] Approve Event (green)
   - [ ] Request Revision (orange)
   - [ ] Reject Event (red)
5. [ ] Click "Approve Event"
6. [ ] **Verify:**
   - [ ] Toast: "Event approved successfully!"
   - [ ] Notification removed
   - [ ] Event status: "Pending Deanship"

### ✅ Request Revision
1. [ ] Login as Dean of Faculty
2. [ ] Find pending event
3. [ ] Click "Request Revision"
4. [ ] Enter reason: "Budget information needed"
5. [ ] Submit
6. [ ] **Verify:**
   - [ ] Event status: "Needs Revision - Dean Request"
   - [ ] Club leader receives notification

### ✅ Permanent Rejection
1. [ ] Login as Dean of Faculty
2. [ ] Find pending event
3. [ ] Click "Reject Event" (red button)
4. [ ] **Verify:**
   - [ ] Textarea appears
   - [ ] Placeholder: "Reason for permanent rejection..."
5. [ ] Enter reason: "Does not meet university policies"
6. [ ] Click "Permanently Reject"
7. [ ] **Verify:**
   - [ ] Toast: "Event permanently rejected"
   - [ ] Event status: "REJECTED"
   - [ ] Status badge is red
   - [ ] No more approval actions available

---

## 7. Functional Tests - Deanship

### ✅ Approve Event
1. [ ] Login as Deanship of Student Affairs
2. [ ] Open Notifications
3. [ ] Find event pending deanship approval
4. [ ] **Verify three buttons:**
   - [ ] Approve Event
   - [ ] Request Revision
   - [ ] Reject Event
5. [ ] Click "Approve Event"
6. [ ] **Verify:**
   - [ ] Toast: "Event approved successfully!"
   - [ ] Event status: "APPROVED"
   - [ ] Status badge is green

### ✅ Request Revision to Dean
1. [ ] Login as Deanship
2. [ ] Find pending event
3. [ ] Click "Request Revision"
4. [ ] Enter reason: "Need dean's clarification"
5. [ ] Submit
6. [ ] **Verify:**
   - [ ] Event status: "Needs Revision - Deanship Request"
   - [ ] Dean of Faculty receives notification
   - [ ] Dean can respond with message

---

## 8. Utility Function Tests

### ✅ Event Helpers
Open browser console and test:

```javascript
// Import utilities
import { 
  getStatusLabel, 
  getStatusClass, 
  formatEventDate,
  needsRevision,
  isPending 
} from './src/utils/eventHelpers.js';

// Test getStatusLabel
console.log(getStatusLabel('PENDING_FACULTY_APPROVAL')); 
// Expected: "Pending Faculty Leader"

console.log(getStatusLabel('APPROVED')); 
// Expected: "Approved"

// Test getStatusClass
console.log(getStatusClass('APPROVED')); 
// Expected: "approved"

console.log(getStatusClass('NEEDS_REVISION_DEAN')); 
// Expected: "revision"

// Test formatEventDate
console.log(formatEventDate('2024-01-15T10:00:00Z')); 
// Expected: "Jan 15, 2024, 10:00 AM"

// Test needsRevision
console.log(needsRevision('NEEDS_REVISION_DEAN')); 
// Expected: true

console.log(needsRevision('APPROVED')); 
// Expected: false

// Test isPending
console.log(isPending('PENDING_DEAN_APPROVAL')); 
// Expected: true
```

### ✅ Role Helpers
```javascript
import { 
  canPlanEvents, 
  canRejectPermanently,
  getRoleDisplayName 
} from './src/utils/roleHelpers.js';

console.log(canPlanEvents('CLUB_LEADER')); 
// Expected: true

console.log(canRejectPermanently('DEAN_OF_FACULTY')); 
// Expected: true

console.log(getRoleDisplayName('DEAN_OF_FACULTY')); 
// Expected: "Dean of Faculty"
```

---

## 9. Integration Tests

### ✅ Complete Approval Workflow
1. [ ] **Club Leader creates event**
   - Status: "Pending Faculty Leader"
2. [ ] **Faculty Leader approves**
   - Status: "Pending Dean of Faculty"
3. [ ] **Dean requests revision**
   - Status: "Needs Revision - Dean Request"
   - Club Leader sees revision section
4. [ ] **Club Leader responds**
   - Status: "Pending Faculty Leader"
   - Faculty Leader sees response
5. [ ] **Faculty Leader approves again**
   - Status: "Pending Dean of Faculty"
6. [ ] **Dean approves**
   - Status: "Pending Deanship"
7. [ ] **Deanship approves**
   - Status: "APPROVED" ✅

### ✅ Rejection Workflow
1. [ ] Club Leader creates event
2. [ ] Faculty Leader approves
3. [ ] Dean permanently rejects
4. [ ] **Verify:**
   - [ ] Event status: "REJECTED"
   - [ ] No further actions available
   - [ ] Red status badge
   - [ ] Club Leader notified

---

## 10. Performance Tests

### ✅ Page Load Times
- [ ] **Plan Events page loads < 2 seconds**
- [ ] **Notifications panel opens < 500ms**
- [ ] **Status badges render instantly**
- [ ] **No layout shift on load**

### ✅ Real-time Updates
- [ ] **Events refresh every 1 second**
- [ ] **Notifications update immediately after action**
- [ ] **Status changes visible without page refresh**
- [ ] **Cache clears properly**

### ✅ Memory Leaks
- [ ] Open DevTools → Performance → Memory
- [ ] Record for 30 seconds while navigating
- [ ] **Verify:** No continuous memory growth
- [ ] **Verify:** Listeners properly removed on unmount

---

## 11. Error Handling Tests

### ✅ Network Errors
- [ ] **Disconnect network**
- [ ] Try to approve event
- [ ] **Verify:**
  - [ ] Error toast displays
  - [ ] Button not stuck in loading state
  - [ ] Can retry action

### ✅ Invalid Data
- [ ] **Try to approve without event ID**
- [ ] **Verify:** Graceful error handling
- [ ] **Try to submit empty revision reason**
- [ ] **Verify:** Alert: "Please provide a reason"

---

## 12. Cross-Browser Tests

### ✅ Chrome
- [ ] All functionality works
- [ ] Styles render correctly
- [ ] No console errors

### ✅ Firefox
- [ ] All functionality works
- [ ] Styles render correctly
- [ ] No console errors

### ✅ Edge
- [ ] All functionality works
- [ ] Styles render correctly
- [ ] No console errors

---

## 13. Mobile Responsiveness

### ✅ Mobile View (375x667)
- [ ] Notifications panel scrollable
- [ ] Status badges stack vertically
- [ ] Buttons full-width
- [ ] Forms usable
- [ ] Text readable

### ✅ Tablet View (768x1024)
- [ ] Two-column layout works
- [ ] Buttons appropriate size
- [ ] Touch targets large enough

---

## 14. Accessibility Tests

### ✅ Keyboard Navigation
- [ ] Can tab through all buttons
- [ ] Can activate buttons with Enter/Space
- [ ] Focus indicators visible

### ✅ Screen Reader
- [ ] Status badges have proper labels
- [ ] Buttons have descriptive text
- [ ] Forms have proper labels

---

## Final Checklist

### ✅ Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] ESLint passes
- [ ] No TypeScript errors

### ✅ Documentation
- [ ] README updated
- [ ] Code comments added
- [ ] API documented

### ✅ Git
- [ ] Changes committed
- [ ] Descriptive commit message
- [ ] Branch pushed

---

## Test Results Summary

| Category | Total | Passed | Failed | Notes |
|----------|-------|--------|--------|-------|
| Build Tests | 3 | __ | __ | |
| Visual Tests | 12 | __ | __ | |
| Club Leader | 8 | __ | __ | |
| Faculty Leader | 10 | __ | __ | |
| Dean | 12 | __ | __ | |
| Deanship | 8 | __ | __ | |
| Utility Tests | 10 | __ | __ | |
| Integration | 5 | __ | __ | |
| Performance | 8 | __ | __ | |
| Error Handling | 4 | __ | __ | |
| Cross-Browser | 9 | __ | __ | |
| Mobile | 9 | __ | __ | |
| Accessibility | 6 | __ | __ | |
| **TOTAL** | **104** | **__** | **__** | |

---

## Bug Report Template

If you find issues, report them like this:

**Bug Title:** [Component] Brief description

**Steps to Reproduce:**
1. Go to...
2. Click...
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
[Attach if applicable]

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Role: Club Leader

**Severity:**
- [ ] Critical (blocks workflow)
- [ ] High (major feature broken)
- [ ] Medium (workaround exists)
- [ ] Low (cosmetic issue)

---

**Testing Status:** 
- ⏳ Not Started
- 🔄 In Progress
- ✅ Complete
- ❌ Failed

**Last Updated:** [Date]
**Tested By:** [Name]
