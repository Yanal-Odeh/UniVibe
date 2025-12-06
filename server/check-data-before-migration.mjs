import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function migrateBeforeSchemaChange() {
  try {
    console.log('Checking for data to preserve before schema changes...\n');

    // Check if communities table has clubLeaderId column
    const communities = await prisma.$queryRaw`
      SELECT id, name, "clubLeaderId", "createdBy"
      FROM communities 
      WHERE "clubLeaderId" IS NOT NULL
    `;

    if (communities.length > 0) {
      console.log(`Found ${communities.length} communities with clubLeaderId set:`);
      communities.forEach(comm => {
        console.log(`  - ${comm.name}: clubLeaderId = ${comm.clubLeaderId}, createdBy = ${comm.createdBy}`);
      });
      
      console.log('\n📝 Note: The createdBy field already exists and should preserve the club leader relationship.');
      console.log('If clubLeaderId and createdBy are different, you may need to update createdBy first.\n');
    } else {
      console.log('✅ No communities have clubLeaderId set, safe to proceed.\n');
    }

    // Check events for facultyLeaderRejectionReason
    const eventsWithReason = await prisma.$queryRaw`
      SELECT id, title, "facultyLeaderRejectionReason"
      FROM events 
      WHERE "facultyLeaderRejectionReason" IS NOT NULL
    `;

    if (eventsWithReason.length > 0) {
      console.log(`Found ${eventsWithReason.length} events with facultyLeaderRejectionReason:`);
      eventsWithReason.forEach(event => {
        console.log(`  - ${event.title}: "${event.facultyLeaderRejectionReason}"`);
      });
      console.log('\n⚠️  This data will be lost. Consider backing it up if needed.\n');
    } else {
      console.log('✅ No events have facultyLeaderRejectionReason set, safe to proceed.\n');
    }

    console.log('Migration check complete. You can now run: npx prisma db push');

  } catch (error) {
    console.error('Error:', error);
    console.log('\nNote: If columns do not exist, this is normal - schema may already be updated.');
  } finally {
    await prisma.$disconnect();
  }
}

migrateBeforeSchemaChange();
