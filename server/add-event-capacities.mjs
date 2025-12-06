import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function addEventCapacities() {
  try {
    console.log('Setting default capacities for events...');

    // Get all events
    const events = await prisma.event.findMany();
    console.log(`Found ${events.length} events`);

    // Update events with null capacity to have a default capacity
    // You can customize this based on location capacity or set a default
    for (const event of events) {
      if (event.capacity === null) {
        // If the event has a location with capacity, use that
        if (event.locationId) {
          const location = await prisma.location.findUnique({
            where: { id: event.locationId }
          });
          
          if (location && location.capacity) {
            await prisma.event.update({
              where: { id: event.id },
              data: { capacity: location.capacity }
            });
            console.log(`✅ Set capacity for "${event.title}" to ${location.capacity} (from location)`);
          } else {
            // Set a default capacity of 100
            await prisma.event.update({
              where: { id: event.id },
              data: { capacity: 100 }
            });
            console.log(`✅ Set default capacity for "${event.title}" to 100`);
          }
        } else {
          // No location, set default
          await prisma.event.update({
            where: { id: event.id },
            data: { capacity: 100 }
          });
          console.log(`✅ Set default capacity for "${event.title}" to 100`);
        }
      } else {
        console.log(`⏭️  Event "${event.title}" already has capacity: ${event.capacity}`);
      }
    }

    console.log('\n✅ Capacity setup complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEventCapacities();
