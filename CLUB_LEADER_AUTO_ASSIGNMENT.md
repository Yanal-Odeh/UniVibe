# Club Leader Auto-Assignment Feature

## Overview
The system now automatically assigns club and faculty/college information when club leaders create events. Club leaders no longer need to manually select which club or faculty their event belongs to - this information is inferred from their assigned leadership role.

## How It Works

### 1. Database Structure
- Each **Community** has a `clubLeaderId` field linking it to a specific User with role `CLUB_LEADER`
- Each **Community** is linked to a **College** via `collegeId`
- When a club leader is assigned to a community, they inherit that community's college association

### 2. Backend Auto-Assignment
**File: `server/controllers/eventController.js`**

When a club leader creates an event:
1. The system detects their role is `CLUB_LEADER`
2. Queries the database to find the community they lead:
   ```javascript
   const ledCommunity = await prisma.community.findFirst({
     where: { clubLeaderId: req.user.id },
     include: { college: true }
   });
   ```
3. Automatically sets:
   - `communityId` = the community they lead
   - `collegeId` = that community's college

4. Validates that:
   - The club leader is assigned to a community
   - That community is linked to a college

### 3. Frontend Changes
**File: `src/Pages/PlamEvents/PlanEvents.jsx`**

For club leaders:
- ✅ **College selection** field is **hidden**
- ✅ **Community selection** field is **hidden**
- ✅ **Info message** displayed: "Events will be automatically assigned to your club and college"
- ✅ **Location dropdown** automatically fetches locations from their college
- ✅ Only need to fill: Title, Description, Location, Date/Time

For other roles (Admin, Faculty Leader, etc.):
- College and Community selection fields remain visible and required

## Current Club Leaders

Based on the seed data, here are the 6 club leaders:

| Club Leader | Email | Community | Faculty/College |
|------------|-------|-----------|----------------|
| Sarah Johnson | sarah@univibe.edu | Institute of Electrical and Electronics Engineers (IEEE) | Engineering |
| Jessica Lee | jessica@univibe.edu | Theater troupe | Arts |
| Ryan Martinez | ryan@univibe.edu | Medical Students Union | Medicine |
| Tom Wilson | tom@univibe.edu | Entrepreneurs Association | Business |
| Amy Zhang | amy@univibe.edu | Student Association for Physics and Astronomy (SAPA) | Sciences |
| Chris Brown | chris@univibe.edu | Legal Clinic | Law |

## Example Workflow

### Before (Manual Selection Required)
1. Sarah Johnson logs in as club leader
2. Creates event
3. Must manually select "Engineering" college
4. Must manually select "Institute of Electrical and Electronics Engineers" community
5. Fills in other details
6. Submits event

### After (Auto-Assignment)
1. Sarah Johnson logs in as club leader
2. Creates event
3. ✨ **College automatically set to Engineering**
4. ✨ **Community automatically set to Institute of Electrical and Electronics Engineers**
5. Only fills in: Title, Description, Location (from Engineering locations), Date/Time
6. Submits event

## Benefits

1. **Prevents Errors**: Club leaders can't accidentally assign events to wrong clubs
2. **Faster Creation**: Fewer fields to fill = quicker event planning
3. **Better UX**: Simpler, more intuitive interface for club leaders
4. **Data Integrity**: Ensures events are always correctly associated with the right club and faculty

## API Changes

### POST `/api/events` (Create Event)

**Before:**
```json
{
  "title": "Hackathon 2026",
  "description": "...",
  "communityId": "required-for-all-users",
  "collegeId": "required-for-all-users",
  "locationId": "abc123",
  "startDate": "2026-03-15T09:00:00Z"
}
```

**After (for Club Leaders):**
```json
{
  "title": "Hackathon 2026",
  "description": "...",
  "locationId": "abc123",
  "startDate": "2026-03-15T09:00:00Z"
}
```
*communityId and collegeId are automatically populated by backend*

**After (for other roles):**
```json
{
  "title": "Campus Fair",
  "description": "...",
  "communityId": "still-required",
  "collegeId": "still-required",
  "locationId": "abc123",
  "startDate": "2026-03-15T09:00:00Z"
}
```

## Error Handling

The system includes proper error messages for edge cases:

1. **Club leader not assigned to any community:**
   - Error: "No community assigned - You are not assigned as a leader of any community. Please contact an admin."

2. **Community not linked to a college:**
   - Error: "Community not linked to a college - Your community must be assigned to a college. Please contact an admin."

## Testing

To test this feature:

1. **Login as Sarah Johnson:**
   - Email: `sarah@univibe.edu`
   - Password: `password123`

2. **Navigate to Plan Events page**

3. **Click "Plan Event" button**

4. **Observe:**
   - College field is NOT shown
   - Community field is NOT shown
   - Blue info message displays auto-assignment notice
   - Location dropdown shows Engineering college locations

5. **Fill in remaining fields and submit**

6. **Verify in database:**
   ```sql
   SELECT 
     e.title, 
     c.name as community, 
     col.name as college
   FROM events e
   JOIN communities c ON e."communityId" = c.id
   JOIN colleges col ON e."collegeId" = col.id
   WHERE e."createdBy" = 'user_sarah_001';
   ```

## Files Modified

1. ✅ `server/controllers/eventController.js` - Auto-detection logic
2. ✅ `src/Pages/PlamEvents/PlanEvents.jsx` - UI conditional rendering
3. ✅ `src/Pages/PlamEvents/PlanEvents.module.scss` - Info message styling

## Future Enhancements

Potential improvements:
1. Allow club leaders to see which club/college they're assigned to in their profile
2. Add a "Club Dashboard" showing their community details
3. Allow multiple co-leaders per community
4. Add ability for admins to easily reassign club leadership
