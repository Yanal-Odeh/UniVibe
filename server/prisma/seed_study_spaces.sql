-- Seed data for study spaces
-- Run this after migrating the Prisma schema

INSERT INTO study_spaces (id, name, category, description, capacity, location, hours, amenities, image, color, created_at, updated_at)
VALUES
  ('clsp001', 'Main Library - Level 3', 'quiet', 'Silent study area with individual desks and excellent lighting.', 120, 'Main Library, 3rd Floor', '24/7', ARRAY['Wifi', 'Power Outlets', 'Silent Zone'], '📚', '#4f46e5', NOW(), NOW()),
  ('clsp002', 'Collaborative Learning Center', 'collaborative', 'Open space perfect for group projects and discussions.', 80, 'Student Center, 2nd Floor', '8 AM - 10 PM', ARRAY['Wifi', 'Whiteboards', 'Group Tables', 'Projectors'], '👥', '#10b981', NOW(), NOW()),
  ('clsp003', 'Science Library Reading Room', 'quiet', 'Dedicated quiet space for focused individual study.', 60, 'Science Building, 1st Floor', '7 AM - Midnight', ARRAY['Wifi', 'Power Outlets', 'Natural Light'], '🔬', '#3b82f6', NOW(), NOW()),
  ('clsp004', 'Campus Café Study Area', 'cafe', 'Casual study space with coffee and light background music.', 40, 'Student Union Building', '7 AM - 8 PM', ARRAY['Wifi', 'Coffee', 'Snacks', 'Comfortable Seating'], '☕', '#f59e0b', NOW(), NOW()),
  ('clsp005', 'Engineering Study Pods', 'collaborative', 'Private study rooms for small groups with tech equipment.', 8, 'Engineering Building, Ground Floor', '8 AM - 10 PM', ARRAY['Wifi', 'Smart TV', 'Whiteboards', 'Bookable'], '🔧', '#8b5cf6', NOW(), NOW()),
  ('clsp006', 'Garden Study Terrace', 'quiet', 'Outdoor study space with natural ambiance and fresh air.', 30, 'Behind Main Library', '8 AM - 6 PM', ARRAY['Wifi', 'Shade', 'Natural Setting'], '🌿', '#059669', NOW(), NOW()),
  ('clsp007', 'Digital Learning Lab', 'collaborative', 'Tech-enabled space with computers and multimedia resources.', 50, 'Library, Basement', '8 AM - 9 PM', ARRAY['Wifi', 'Computers', 'Printers', 'Scanners'], '💻', '#6366f1', NOW(), NOW()),
  ('clsp008', 'Cozy Corner Lounge', 'cafe', 'Comfortable seating area for relaxed studying and reading.', 25, 'Arts Building, 2nd Floor', '9 AM - 9 PM', ARRAY['Wifi', 'Soft Seating', 'Coffee Table', 'Warm Lighting'], '🛋️', '#ec4899', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Verify the data was inserted
SELECT COUNT(*) as total_spaces FROM study_spaces;
SELECT name, capacity, category, location FROM study_spaces ORDER BY name;
