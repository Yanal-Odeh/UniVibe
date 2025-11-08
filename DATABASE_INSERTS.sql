-- ============================================
-- UniVibe Database: Complete Insert Statements
-- ============================================
-- Note: This file is for REFERENCE ONLY
-- Use the seed script (npm run seed) instead
-- These are the statements the seed script executes
-- ============================================

-- ============================================
-- 1. ADMIN USERS
-- ============================================
-- Passwords are hashed with bcrypt (salt rounds: 10)
-- Plain text passwords: yanal1234, younis1234

INSERT INTO users (id, email, password, "firstName", "lastName", role, "createdAt", "updatedAt") VALUES
('admin_yanal_001', 'yanal@univibe.edu', '$2a$10$YourHashedPasswordHere1', 'Yanal', 'Oudeh', 'ADMIN', NOW(), NOW()),
('admin_younis_002', 'younis@univibe.edu', '$2a$10$YourHashedPasswordHere2', 'Younis', 'Masri', 'ADMIN', NOW(), NOW());

-- ============================================
-- 2. STUDENT USERS
-- ============================================
-- All student passwords: password123 (hashed with bcrypt)

INSERT INTO users (id, email, password, "firstName", "lastName", role, "createdBy", "createdAt", "updatedAt") VALUES
-- Club Leaders
('user_sarah_001', 'sarah@univibe.edu', '$2a$10$HashedPassword', 'Sarah', 'Johnson', 'CLUB_LEADER', 'admin_yanal_001', '2024-01-15', NOW()),
('user_jessica_002', 'jessica@univibe.edu', '$2a$10$HashedPassword', 'Jessica', 'Lee', 'CLUB_LEADER', 'admin_yanal_001', '2024-01-10', NOW()),
('user_ryan_003', 'ryan@univibe.edu', '$2a$10$HashedPassword', 'Ryan', 'Martinez', 'CLUB_LEADER', 'admin_yanal_001', '2024-01-05', NOW()),
('user_tom_004', 'tom@univibe.edu', '$2a$10$HashedPassword', 'Tom', 'Wilson', 'CLUB_LEADER', 'admin_yanal_001', '2024-01-08', NOW()),
('user_amy_005', 'amy@univibe.edu', '$2a$10$HashedPassword', 'Amy', 'Zhang', 'CLUB_LEADER', 'admin_yanal_001', '2024-01-03', NOW()),
('user_chris_006', 'chris@univibe.edu', '$2a$10$HashedPassword', 'Chris', 'Brown', 'CLUB_LEADER', 'admin_yanal_001', '2024-01-18', NOW()),

-- Moderators
('user_mike_007', 'mike@univibe.edu', '$2a$10$HashedPassword', 'Mike', 'Chen', 'MODERATOR', 'admin_yanal_001', '2024-01-20', NOW()),
('user_lisa_008', 'lisa@univibe.edu', '$2a$10$HashedPassword', 'Lisa', 'Wang', 'MODERATOR', 'admin_yanal_001', '2024-01-12', NOW()),
('user_james_009', 'james@univibe.edu', '$2a$10$HashedPassword', 'James', 'Wilson', 'MODERATOR', 'admin_yanal_001', '2024-01-25', NOW()),

-- Regular Students
('user_emily_010', 'emily@univibe.edu', '$2a$10$HashedPassword', 'Emily', 'Davis', 'STUDENT', 'admin_yanal_001', '2024-02-10', NOW()),
('user_alex_011', 'alex@univibe.edu', '$2a$10$HashedPassword', 'Alex', 'Kumar', 'STUDENT', 'admin_yanal_001', '2024-02-15', NOW()),
('user_david_012', 'david@univibe.edu', '$2a$10$HashedPassword', 'David', 'Park', 'STUDENT', 'admin_yanal_001', '2024-01-25', NOW()),
('user_olivia_013', 'olivia@univibe.edu', '$2a$10$HashedPassword', 'Olivia', 'Martinez', 'STUDENT', 'admin_yanal_001', '2024-03-01', NOW()),
('user_daniel_014', 'daniel@univibe.edu', '$2a$10$HashedPassword', 'Daniel', 'Lee', 'STUDENT', 'admin_yanal_001', '2024-03-05', NOW()),
('user_sophia_015', 'sophia@univibe.edu', '$2a$10$HashedPassword', 'Sophia', 'Brown', 'STUDENT', 'admin_yanal_001', '2024-03-10', NOW()),
('user_noah_016', 'noah@univibe.edu', '$2a$10$HashedPassword', 'Noah', 'Anderson', 'STUDENT', 'admin_yanal_001', '2024-03-15', NOW()),
('user_emma_017', 'emma@univibe.edu', '$2a$10$HashedPassword', 'Emma', 'Taylor', 'STUDENT', 'admin_yanal_001', '2024-03-20', NOW()),
('user_liam_018', 'liam@univibe.edu', '$2a$10$HashedPassword', 'Liam', 'Garcia', 'STUDENT', 'admin_yanal_001', '2024-03-25', NOW()),
('user_ava_019', 'ava@univibe.edu', '$2a$10$HashedPassword', 'Ava', 'Rodriguez', 'STUDENT', 'admin_yanal_001', '2024-04-01', NOW()),
('user_william_020', 'william@univibe.edu', '$2a$10$HashedPassword', 'William', 'Kim', 'STUDENT', 'admin_yanal_001', '2024-04-05', NOW()),
('user_isabella_021', 'isabella@univibe.edu', '$2a$10$HashedPassword', 'Isabella', 'Nguyen', 'STUDENT', 'admin_yanal_001', '2024-04-10', NOW());

-- ============================================
-- 3. COMMUNITIES
-- ============================================

INSERT INTO communities (id, name, description, avatar, color, "createdBy", "createdAt", "updatedAt") VALUES
('comm_cs_001', 'Computer Science Club', 'For all tech enthusiasts and programmers', '🖥️', '#667eea', 'user_sarah_001', '2024-01-15', NOW()),
('comm_art_002', 'Art & Design Society', 'Creative minds unite! Share your artwork and designs', '🎨', '#f093fb', 'user_jessica_002', '2024-01-10', NOW()),
('comm_sports_003', 'Sports & Fitness', 'Stay active and healthy together', '⚽', '#4facfe', 'user_ryan_003', '2024-01-05', NOW()),
('comm_photo_004', 'Photography Club', 'Capture moments, share perspectives', '📷', '#43e97b', 'user_tom_004', '2024-01-08', NOW()),
('comm_music_005', 'Music & Bands', 'Musicians, singers, and music lovers welcome', '🎵', '#fa709a', 'user_amy_005', '2024-01-03', NOW()),
('comm_book_006', 'Book Club', 'Read, discuss, and share your favorite books', '📚', '#ffd16a', 'user_chris_006', '2024-01-18', NOW());

-- ============================================
-- 4. COMMUNITY MEMBERS
-- ============================================

-- Computer Science Club Members (14 members)
INSERT INTO community_members (id, "userId", "communityId", "joinedAt") VALUES
('cm_001', 'user_sarah_001', 'comm_cs_001', '2024-01-15'),
('cm_002', 'user_mike_007', 'comm_cs_001', '2024-01-20'),
('cm_003', 'user_emily_010', 'comm_cs_001', '2024-02-10'),
('cm_004', 'user_alex_011', 'comm_cs_001', '2024-02-15'),
('cm_005', 'user_james_009', 'comm_cs_001', '2024-01-25'),
('cm_006', 'user_olivia_013', 'comm_cs_001', '2024-03-01'),
('cm_007', 'user_daniel_014', 'comm_cs_001', '2024-03-05'),
('cm_008', 'user_sophia_015', 'comm_cs_001', '2024-03-10'),
('cm_009', 'user_noah_016', 'comm_cs_001', '2024-03-15'),
('cm_010', 'user_emma_017', 'comm_cs_001', '2024-03-20'),
('cm_011', 'user_liam_018', 'comm_cs_001', '2024-03-25'),
('cm_012', 'user_ava_019', 'comm_cs_001', '2024-04-01'),
('cm_013', 'user_william_020', 'comm_cs_001', '2024-04-05'),
('cm_014', 'user_isabella_021', 'comm_cs_001', '2024-04-10');

-- Art & Design Society Members (2 members)
INSERT INTO community_members (id, "userId", "communityId", "joinedAt") VALUES
('cm_015', 'user_jessica_002', 'comm_art_002', '2024-01-10'),
('cm_016', 'user_david_012', 'comm_art_002', '2024-01-25');

-- Sports & Fitness Members (2 members)
INSERT INTO community_members (id, "userId", "communityId", "joinedAt") VALUES
('cm_017', 'user_ryan_003', 'comm_sports_003', '2024-01-05'),
('cm_018', 'user_lisa_008', 'comm_sports_003', '2024-01-12');

-- Photography Club Members (1 member)
INSERT INTO community_members (id, "userId", "communityId", "joinedAt") VALUES
('cm_019', 'user_tom_004', 'comm_photo_004', '2024-01-08');

-- Music & Bands Members (1 member)
INSERT INTO community_members (id, "userId", "communityId", "joinedAt") VALUES
('cm_020', 'user_amy_005', 'comm_music_005', '2024-01-03');

-- Book Club Members (1 member)
INSERT INTO community_members (id, "userId", "communityId", "joinedAt") VALUES
('cm_021', 'user_chris_006', 'comm_book_006', '2024-01-18');

-- ============================================
-- 5. EVENTS
-- ============================================

INSERT INTO events (id, title, description, location, "startDate", "endDate", "communityId", "createdBy", "createdAt", "updatedAt") VALUES
(
  'event_001',
  'Tech Innovation Summit',
  'Join us for an inspiring day of technology, innovation, and networking. The Tech Innovation Summit 2025 is our flagship event designed to bridge the gap between academic learning and industry innovation.',
  'Main Auditorium',
  '2025-03-15 09:00:00',
  '2025-03-15 17:00:00',
  'comm_cs_001',
  'user_sarah_001',
  NOW(),
  NOW()
),
(
  'event_002',
  'Spring Music Festival',
  'An evening of performances by student bands and guest artists. Enjoy a variety of musical acts across multiple stages.',
  'Campus Grounds',
  '2025-03-20 18:00:00',
  '2025-03-20 23:00:00',
  'comm_music_005',
  'user_amy_005',
  NOW(),
  NOW()
),
(
  'event_003',
  'Career Fair 2025',
  'Meet employers and learn about opportunities. Bring resumes and be ready to network.',
  'Sports Complex',
  '2025-03-25 10:00:00',
  '2025-03-25 16:00:00',
  NULL,
  'admin_yanal_001',
  NOW(),
  NOW()
);

-- ============================================
-- 6. ADMIN PREFERENCES (Optional - will be created on first use)
-- ============================================

INSERT INTO admin_preferences (id, "userId", "activeSection", "createdAt", "updatedAt") VALUES
('pref_001', 'admin_yanal_001', 'communities', NOW(), NOW()),
('pref_002', 'admin_younis_002', 'communities', NOW(), NOW());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count users by role
SELECT role, COUNT(*) as count FROM users GROUP BY role;
-- Expected: ADMIN (2), CLUB_LEADER (6), MODERATOR (3), STUDENT (12)

-- Count communities
SELECT COUNT(*) FROM communities;
-- Expected: 6

-- Count community members by community
SELECT 
  c.name, 
  COUNT(cm."userId") as member_count 
FROM communities c
LEFT JOIN community_members cm ON c.id = cm."communityId"
GROUP BY c.id, c.name
ORDER BY member_count DESC;
-- Expected: Computer Science Club (14), others (1-2)

-- Count events
SELECT COUNT(*) FROM events;
-- Expected: 3

-- List all communities with their creators
SELECT 
  c.name as community,
  u."firstName" || ' ' || u."lastName" as creator,
  u.role as creator_role
FROM communities c
JOIN users u ON c."createdBy" = u.id;

-- ============================================
-- CLEANUP QUERIES (if needed)
-- ============================================

-- To remove all data (CAUTION: destructive)
-- TRUNCATE TABLE admin_preferences, events, community_members, communities, users CASCADE;

-- To remove and recreate tables
-- DROP TABLE IF EXISTS admin_preferences, events, community_members, communities, users, _prisma_migrations CASCADE;
-- Then run: npx prisma migrate deploy

-- ============================================
-- NOTES
-- ============================================
-- 1. All passwords are hashed with bcrypt (10 salt rounds)
-- 2. Plain text password for students: password123
-- 3. Plain text passwords for admins: yanal1234, younis1234
-- 4. IDs use cuid format in actual implementation
-- 5. Timestamps use NOW() for current time
-- 6. Foreign key constraints ensure referential integrity
-- 7. Unique constraints: email (users), name (communities), userId+communityId (community_members)
