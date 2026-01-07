import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Daily reset scheduler for study space reservations
 * Runs every day at midnight (00:00) to mark yesterday's reservations as COMPLETED
 */
export const startDailyResetScheduler = () => {
  // Schedule: Run at midnight every day
  // Cron format: second minute hour day month weekday
  // '0 0 * * *' = At 00:00 (midnight) every day
  
  cron.schedule('0 0 * * *', async () => {
    try {
      const now = new Date();
      console.log(`[${now.toISOString()}] Running daily study space reservation reset...`);
      
      // Get today at UTC midnight to avoid timezone issues
      const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const today = new Date(todayStr + 'T00:00:00.000Z');
      
      console.log(`Cleaning up reservations before: ${today.toISOString()} (${todayStr})`);
      
      // Mark all ACTIVE reservations from dates before today as COMPLETED
      const result = await prisma.studySpaceReservation.updateMany({
        where: {
          date: {
            lt: today
          },
          status: 'ACTIVE'
        },
        data: {
          status: 'COMPLETED'
        }
      });
      
      console.log(`✅ Study space reset complete: ${result.count} reservations marked as COMPLETED`);
      
    } catch (error) {
      console.error('❌ Error during daily study space reset:', error);
    }
  });
  
  console.log('📅 Study space daily reset scheduler started (runs at midnight)');
  
  // Optional: Run an initial cleanup when server starts
  runInitialCleanup();
};

/**
 * Run initial cleanup when server starts
 * Marks all past ACTIVE reservations as COMPLETED
 */
const runInitialCleanup = async () => {
  try {
    // Get today at UTC midnight to avoid timezone issues
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA');
    const today = new Date(todayStr + 'T00:00:00.000Z');
    
    const result = await prisma.studySpaceReservation.updateMany({
      where: {
        date: {
          lt: today
        },
        status: 'ACTIVE'
      },
      data: {
        status: 'COMPLETED'
      }
    });
    
    if (result.count > 0) {
      console.log(`✅ Initial cleanup: ${result.count} past reservations marked as COMPLETED`);
    }
  } catch (error) {
    console.error('❌ Error during initial cleanup:', error);
  }
};

/**
 * Manual reset function (for testing or admin use)
 * Can be called via API endpoint if needed
 */
export const manualReset = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const result = await prisma.studySpaceReservation.updateMany({
    where: {
      date: {
        lt: today
      },
      status: 'ACTIVE'
    },
    data: {
      status: 'COMPLETED'
    }
  });
  
  return {
    success: true,
    count: result.count,
    message: `${result.count} reservations marked as COMPLETED`
  };
};
