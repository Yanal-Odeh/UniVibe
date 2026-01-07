import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const prisma = new PrismaClient();

async function cleanupOldReservations() {
  try {
    console.log('Starting cleanup of old reservations...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Today:', today.toISOString());
    
    // Find all ACTIVE reservations with dates before today
    const oldReservations = await prisma.studySpaceReservation.findMany({
      where: {
        status: 'ACTIVE',
        date: {
          lt: today
        }
      },
      include: {
        space: true,
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    console.log(`Found ${oldReservations.length} old reservations to mark as COMPLETED`);
    
    if (oldReservations.length > 0) {
      // Mark them as COMPLETED
      const result = await prisma.studySpaceReservation.updateMany({
        where: {
          status: 'ACTIVE',
          date: {
            lt: today
          }
        },
        data: {
          status: 'COMPLETED'
        }
      });
      
      console.log(`✅ Successfully marked ${result.count} reservations as COMPLETED`);
      
      // Show details of what was cleaned up
      oldReservations.forEach(res => {
        console.log(`  - ${res.student.firstName} ${res.student.lastName}: ${res.space.name} on ${res.date.toDateString()}`);
      });
    } else {
      console.log('✅ No old reservations found - database is clean!');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldReservations();
