import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const prisma = new PrismaClient();

const studySpacesData = [
  {
    name: 'Main Library - Level 3',
    category: 'quiet',
    description: 'Silent study area with individual desks and excellent lighting.',
    capacity: 120,
    location: 'Main Library, 3rd Floor',
    hours: '24/7',
    amenities: ['Wifi', 'Power Outlets', 'Silent Zone'],
    image: '📚',
    color: '#4f46e5'
  },
  {
    name: 'Collaborative Learning Center',
    category: 'collaborative',
    description: 'Open space perfect for group projects and discussions.',
    capacity: 80,
    location: 'Student Center, 2nd Floor',
    hours: '8 AM - 10 PM',
    amenities: ['Wifi', 'Whiteboards', 'Group Tables', 'Projectors'],
    image: '👥',
    color: '#10b981'
  },
  {
    name: 'Science Library Reading Room',
    category: 'quiet',
    description: 'Dedicated quiet space for focused individual study.',
    capacity: 60,
    location: 'Science Building, 1st Floor',
    hours: '7 AM - Midnight',
    amenities: ['Wifi', 'Power Outlets', 'Natural Light'],
    image: '🔬',
    color: '#3b82f6'
  },
  {
    name: 'Campus Café Study Area',
    category: 'cafe',
    description: 'Casual study space with coffee and light background music.',
    capacity: 40,
    location: 'Student Union Building',
    hours: '7 AM - 8 PM',
    amenities: ['Wifi', 'Coffee', 'Snacks', 'Comfortable Seating'],
    image: '☕',
    color: '#f59e0b'
  },
  {
    name: 'Engineering Study Pods',
    category: 'collaborative',
    description: 'Private study rooms for small groups with tech equipment.',
    capacity: 8,
    location: 'Engineering Building, Ground Floor',
    hours: '8 AM - 10 PM',
    amenities: ['Wifi', 'Smart TV', 'Whiteboards', 'Bookable'],
    image: '🔧',
    color: '#8b5cf6'
  },
  {
    name: 'Garden Study Terrace',
    category: 'quiet',
    description: 'Outdoor study space with natural ambiance and fresh air.',
    capacity: 30,
    location: 'Behind Main Library',
    hours: '8 AM - 6 PM',
    amenities: ['Wifi', 'Shade', 'Natural Setting'],
    image: '🌿',
    color: '#059669'
  },
  {
    name: 'Digital Learning Lab',
    category: 'collaborative',
    description: 'Tech-enabled space with computers and multimedia resources.',
    capacity: 50,
    location: 'Library, Basement',
    hours: '8 AM - 9 PM',
    amenities: ['Wifi', 'Computers', 'Printers', 'Scanners'],
    image: '💻',
    color: '#6366f1'
  },
  {
    name: 'Cozy Corner Lounge',
    category: 'cafe',
    description: 'Comfortable seating area for relaxed studying and reading.',
    capacity: 25,
    location: 'Arts Building, 2nd Floor',
    hours: '9 AM - 9 PM',
    amenities: ['Wifi', 'Soft Seating', 'Coffee Table', 'Warm Lighting'],
    image: '🛋️',
    color: '#ec4899'
  }
];

async function seedStudySpaces() {
  console.log('🌱 Starting study spaces seeding...');

  try {
    // Check if study spaces already exist
    const existingCount = await prisma.studySpace.count();
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing study spaces. Skipping seed.`);
      console.log('   To re-seed, delete existing data first.');
      return;
    }

    // Create study spaces
    let created = 0;
    for (const space of studySpacesData) {
      try {
        await prisma.studySpace.create({
          data: space
        });
        created++;
        console.log(`✅ Created: ${space.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⏭️  Skipped (already exists): ${space.name}`);
        } else {
          console.error(`❌ Error creating ${space.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Successfully seeded ${created} study spaces!`);
    
    // Verify
    const totalSpaces = await prisma.studySpace.count();
    console.log(`📊 Total study spaces in database: ${totalSpaces}`);
    
  } catch (error) {
    console.error('❌ Error seeding study spaces:', error);
    throw error;
  }
}

async function main() {
  await seedStudySpaces();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
