-- First, get the college IDs
-- Run this to see the colleges
SELECT id, name, code FROM colleges;

-- Then update communities to assign them to colleges
-- Replace the IDs with actual IDs from the query above

-- Example assignments (you'll need to replace with actual IDs):
-- Book Club → College of Arts and Sciences
-- Computer Science Club → College of Engineering
-- Music & Bands → College of Arts and Sciences
-- Sports & Fitness → College of Physical Education (if exists)
-- etc.

-- Template SQL (replace the IDs):
UPDATE communities 
SET "collegeId" = 'ARTS_COLLEGE_ID_HERE'
WHERE name IN ('Book Club', 'Music & Bands', 'Drama Club', 'Art & Design');

UPDATE communities 
SET "collegeId" = 'ENGINEERING_COLLEGE_ID_HERE'
WHERE name IN ('Computer Science Club', 'Robotics Club', 'Tech Innovation');

-- To run this, you can use Prisma Studio or run these queries directly in your database
