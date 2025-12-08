import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Store sent reminder IDs to avoid duplicates
const sentReminders = new Set();

/**
 * Check for upcoming events and send reminder notifications
 */
export async function checkAndSendReminders() {
  try {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Find approved events that are starting soon
    const upcomingEvents = await prisma.event.findMany({
      where: {
        status: 'APPROVED',
        startDate: {
          gte: now,
          lte: oneDayFromNow
        }
      },
      include: {
        registrations: {
          include: {
            user: true
          }
        },
        savedByUsers: {
          include: {
            user: true
          }
        }
      }
    });

    for (const event of upcomingEvents) {
      const timeUntilEvent = event.startDate.getTime() - now.getTime();
      const hoursUntilEvent = timeUntilEvent / (1000 * 60 * 60);

      // Collect all users who should receive notifications
      const usersToNotify = new Set();
      
      // Add registered users
      event.registrations.forEach(reg => {
        usersToNotify.add(reg.userId);
      });

      // Add users who saved the event
      event.savedByUsers.forEach(saved => {
        usersToNotify.add(saved.userId);
      });

      // Send 1-day reminder (between 23 and 25 hours before)
      if (hoursUntilEvent >= 23 && hoursUntilEvent <= 25) {
        await sendReminder(
          event,
          Array.from(usersToNotify),
          'EVENT_REMINDER_1_DAY',
          `Reminder: "${event.title}" starts in 1 day on ${event.startDate.toLocaleDateString()}`
        );
      }

      // Send 1-hour reminder (between 55 minutes and 65 minutes before)
      if (hoursUntilEvent >= 0.9 && hoursUntilEvent <= 1.1) {
        await sendReminder(
          event,
          Array.from(usersToNotify),
          'EVENT_REMINDER_1_HOUR',
          `Reminder: "${event.title}" starts in 1 hour at ${event.startDate.toLocaleTimeString()}`
        );
      }
    }

    console.log(`✅ Event reminder check completed at ${now.toISOString()}`);
  } catch (error) {
    console.error('❌ Error checking event reminders:', error);
  }
}

/**
 * Send reminder notification to users
 */
async function sendReminder(event, userIds, type, message) {
  try {
    // Create a unique key for this reminder
    const reminderKey = `${event.id}_${type}`;
    
    // Check if we've already sent this reminder
    if (sentReminders.has(reminderKey)) {
      return;
    }

    // Get existing notifications to avoid duplicates
    const existingNotifications = await prisma.notification.findMany({
      where: {
        eventId: event.id,
        type: type,
        userId: { in: userIds }
      }
    });

    const existingUserIds = new Set(existingNotifications.map(n => n.userId));
    const usersToNotify = userIds.filter(userId => !existingUserIds.has(userId));

    if (usersToNotify.length === 0) {
      return;
    }

    // Create notifications for all users
    const notifications = usersToNotify.map(userId => ({
      userId,
      eventId: event.id,
      type,
      message,
      read: false
    }));

    await prisma.notification.createMany({
      data: notifications
    });

    // Mark this reminder as sent
    sentReminders.add(reminderKey);

    console.log(`📧 Sent ${type} reminders for event "${event.title}" to ${usersToNotify.length} users`);
  } catch (error) {
    console.error(`Error sending ${type} for event ${event.id}:`, error);
  }
}

/**
 * Start the reminder scheduler
 * Checks every 10 minutes for events that need reminders
 */
export function startReminderScheduler() {
  // Run immediately on startup
  checkAndSendReminders();

  // Then run every 10 minutes
  const interval = 10 * 60 * 1000; // 10 minutes
  setInterval(checkAndSendReminders, interval);

  console.log('📅 Event reminder scheduler started (checking every 10 minutes)');
}

/**
 * Clear the sent reminders cache (useful for testing)
 */
export function clearSentReminders() {
  sentReminders.clear();
}
