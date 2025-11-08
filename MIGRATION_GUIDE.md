# Migration Guide: From LocalStorage to Database

This guide outlines the migration from localStorage to database storage for UniVibe.

## Changes Made

### 1. Database Schema Updates

**Updated Prisma Schema (`server/prisma/schema.prisma`):**
- Added `createdBy` field to User model to track who created each user
- Added new `AdminPreference` model to store admin UI preferences (like active section)

### 2. Seed Data Created

**Comprehensive Seed File (`server/prisma/seed.js`):**
- **Admin Users**: 2 admin accounts (yanal@univibe.edu, younis@univibe.edu)
- **Students**: 21 student accounts with various roles (STUDENT, MODERATOR, CLUB_LEADER)
- **Communities**: 6 communities with proper member associations
  - Computer Science Club (14 members)
  - Art & Design Society (2 members)
  - Sports & Fitness (2 members)
  - Photography Club (1 member)
  - Music & Bands (1 member)
  - Book Club (1 member)
- **Events**: 3 sample events linked to communities

### 3. Backend API Endpoints Added

**New Endpoints:**

#### Community Management
- `DELETE /api/communities/:id/members/:userId` - Remove member from community (Admin only)
- `PATCH /api/communities/:id/members/:userId/role` - Update member role (Admin only)

#### Admin Preferences
- `GET /api/auth/preferences` - Get admin UI preferences (Admin only)
- `PATCH /api/auth/preferences` - Update admin UI preferences (Admin only)

### 4. Frontend Changes

#### Updated Components:
1. **CommunitiesContext.jsx** - Now fetches from API instead of localStorage
2. **AdminAuthContext.jsx** - Uses database authentication via API
3. **AdminPanel.jsx** - Manages students through API calls
4. **api.js** - Added new API methods for member management and preferences

## Migration Steps

### Step 1: Update Database Schema

```bash
# Navigate to server directory
cd server

# Generate Prisma migration
npx prisma migrate dev --name add_admin_preferences_and_created_by

# This will create the new AdminPreference table and add createdBy field to User
```

### Step 2: Seed the Database

```bash
# Run the seed script to populate initial data
npm run seed

# Or directly with node
node prisma/seed.js
```

### Step 3: Clear Browser Storage

Since we're moving from localStorage to database:
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear localStorage items:
   - `communities`
   - `students`
   - `currentAdmin`
   - `adminActiveSection`
   - `token` (will be recreated on login)

### Step 4: Restart Server

```bash
# In server directory
npm run dev
```

### Step 5: Test the Migration

1. **Login as Admin:**
   - Email: yanal@univibe.edu or younis@univibe.edu
   - Password: yanal1234 or younis1234

2. **Verify Communities:**
   - Should see 6 communities loaded from database
   - Check member counts are correct

3. **Verify Students:**
   - Navigate to Manage Users section
   - Should see 21 students loaded from database

4. **Verify Preferences:**
   - Switch between sections in admin panel
   - Refresh page - should remember last active section

## SQL Insert Statements (Reference)

If you need to manually insert data, here are the key SQL statements:

### Admin Users
```sql
-- These will be created by the seed script with hashed passwords
INSERT INTO users (email, password, "firstName", "lastName", role) VALUES
  ('yanal@univibe.edu', '$2a$10$...', 'Yanal', 'Oudeh', 'ADMIN'),
  ('younis@univibe.edu', '$2a$10$...', 'Younis', 'Masri', 'ADMIN');
```

### Sample Students
```sql
-- Sample students (passwords will be hashed)
INSERT INTO users (email, password, "firstName", "lastName", role) VALUES
  ('sarah@univibe.edu', '$2a$10$...', 'Sarah', 'Johnson', 'CLUB_LEADER'),
  ('mike@univibe.edu', '$2a$10$...', 'Mike', 'Chen', 'MODERATOR'),
  ('emily@univibe.edu', '$2a$10$...', 'Emily', 'Davis', 'STUDENT');
-- ... (21 total students)
```

### Communities
```sql
-- Communities (using actual user IDs from created users)
INSERT INTO communities (name, description, avatar, color, "createdBy") VALUES
  ('Computer Science Club', 'For all tech enthusiasts and programmers', '🖥️', '#667eea', '<sarah_user_id>'),
  ('Art & Design Society', 'Creative minds unite! Share your artwork and designs', '🎨', '#f093fb', '<jessica_user_id>');
-- ... (6 total communities)
```

### Community Members
```sql
-- Community memberships (linking users to communities)
INSERT INTO community_members ("userId", "communityId", "joinedAt") VALUES
  ('<sarah_id>', '<cs_club_id>', '2024-01-15'),
  ('<mike_id>', '<cs_club_id>', '2024-01-20');
-- ... (member associations)
```

### Events
```sql
-- Events linked to communities
INSERT INTO events (title, description, location, "startDate", "endDate", "communityId", "createdBy") VALUES
  ('Tech Innovation Summit', 'Join us for an inspiring day...', 'Main Auditorium', 
   '2025-03-15 09:00:00', '2025-03-15 17:00:00', '<cs_club_id>', '<sarah_id>');
-- ... (3 total events)
```

## What Changed from LocalStorage

### Before (LocalStorage):
```javascript
// Communities stored as JSON in localStorage
localStorage.setItem('communities', JSON.stringify(communities));
const communities = JSON.parse(localStorage.getItem('communities'));

// Students stored locally
localStorage.setItem('students', JSON.stringify(students));

// Admin session stored locally
localStorage.setItem('currentAdmin', JSON.stringify(admin));

// Preferences stored locally
localStorage.setItem('adminActiveSection', 'communities');
```

### After (Database via API):
```javascript
// Communities fetched from API
const data = await api.getCommunities();
setCommunities(data.communities);

// Students fetched from API
const students = await api.getStudents();

// Admin authenticated via API with JWT token
const result = await api.login(email, password);
localStorage.setItem('token', result.token); // Only token stored locally

// Preferences saved to database
await api.updateAdminPreferences({ activeSection: 'communities' });
```

## Benefits of This Migration

1. **Data Persistence**: Data survives browser cache clearing
2. **Multi-Device**: Same data across different browsers/devices
3. **Security**: Passwords properly hashed with bcrypt
4. **Scalability**: Can handle large amounts of data
5. **Relationships**: Proper foreign key relationships between entities
6. **Concurrent Access**: Multiple admins can work simultaneously
7. **Audit Trail**: Track who created what with timestamps

## Troubleshooting

### Issue: "Cannot read properties of undefined"
- **Solution**: Make sure database is seeded with `npm run seed`

### Issue: "Invalid credentials" when logging in
- **Solution**: Check that admin accounts were created during seeding

### Issue: Communities not showing
- **Solution**: Check API connection, verify backend is running on port 5000

### Issue: Token expired errors
- **Solution**: Login again to get a fresh JWT token

## Next Steps

Consider implementing:
1. Data migration tool to import existing localStorage data
2. Backup and restore functionality
3. Admin audit logs
4. Role-based permissions refinement
5. Real-time updates with WebSockets
