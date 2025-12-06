import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function updateDeans() {
  try {
    console.log('📝 Updating Dean names...\n');

    const deanUpdates = [
      { 
        code: 'MED', 
        firstName: 'Dr. Faris', 
        lastName: 'Abushamma',
        email: 'dean.med@univibe.edu'
      },
      { 
        code: 'ENG', 
        firstName: 'Dr. Muhannad', 
        lastName: 'Haj Hussein',
        email: 'dean.eng@univibe.edu'
      },
      { 
        code: 'ART', 
        firstName: 'Dr. Ghawi', 
        lastName: 'Ghawi',
        email: 'dean.art@univibe.edu'
      },
      { 
        code: 'IT', 
        firstName: 'Dr. Ahmed', 
        lastName: 'Awad',
        email: 'dean.it@univibe.edu'
      },
      { 
        code: 'LAW', 
        firstName: 'Dr. Noor', 
        lastName: 'Adas',
        email: 'dean.law@univibe.edu'
      },
      { 
        code: 'SCI', 
        firstName: 'Dr. Ghassan', 
        lastName: 'Saffarini',
        email: 'dean.sci@univibe.edu'
      }
    ];

    for (const deanInfo of deanUpdates) {
      // Get the college
      const college = await prisma.college.findUnique({
        where: { code: deanInfo.code }
      });

      if (!college) {
        console.log(`⚠️  College ${deanInfo.code} not found`);
        continue;
      }

      // Find existing dean
      const existingDean = await prisma.user.findUnique({
        where: { email: deanInfo.email }
      });

      if (existingDean) {
        // Update existing dean
        await prisma.user.update({
          where: { email: deanInfo.email },
          data: {
            firstName: deanInfo.firstName,
            lastName: deanInfo.lastName
          }
        });
        console.log(`✅ Updated Dean for ${deanInfo.code}: ${deanInfo.firstName} ${deanInfo.lastName}`);
      } else {
        // Create new dean if doesn't exist
        const hashedPassword = await bcrypt.hash('dean123', 10);
        await prisma.user.create({
          data: {
            email: deanInfo.email,
            password: hashedPassword,
            firstName: deanInfo.firstName,
            lastName: deanInfo.lastName,
            role: 'DEAN_OF_FACULTY',
            collegeId: college.id
          }
        });
        console.log(`✅ Created Dean for ${deanInfo.code}: ${deanInfo.firstName} ${deanInfo.lastName}`);
      }
    }

    console.log('\n✨ Dean names updated successfully!');

    // Show all deans
    const allDeans = await prisma.user.findMany({
      where: { role: 'DEAN_OF_FACULTY' },
      include: { college: true },
      orderBy: { email: 'asc' }
    });

    console.log('\n📋 Current Deans:');
    allDeans.forEach(dean => {
      console.log(`   ${dean.college?.code || 'N/A'}: ${dean.firstName} ${dean.lastName} (${dean.email})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateDeans();
