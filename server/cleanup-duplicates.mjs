import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function cleanupDuplicateApplications() {
  try {
    console.log('🔍 Finding duplicate applications...');

    // Get all applications
    const allApplications = await prisma.applicationForm.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log(`📊 Total applications: ${allApplications.length}`);

    // Group by userId and communityId
    const grouped = {};
    const duplicatesToDelete = [];

    for (const app of allApplications) {
      const key = `${app.userId}_${app.communityId}`;
      
      if (grouped[key]) {
        // This is a duplicate, mark for deletion (keep the first one)
        duplicatesToDelete.push(app.id);
        console.log(`❌ Duplicate found: ${app.name} - ${app.id}`);
      } else {
        grouped[key] = app;
      }
    }

    if (duplicatesToDelete.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    console.log(`\n🗑️  Deleting ${duplicatesToDelete.length} duplicate applications...`);

    // Delete duplicates
    const result = await prisma.applicationForm.deleteMany({
      where: {
        id: {
          in: duplicatesToDelete
        }
      }
    });

    console.log(`✅ Deleted ${result.count} duplicate applications`);
    console.log('\n✨ Cleanup complete! You can now run: npx prisma db push');

  } catch (error) {
    console.error('❌ Error cleaning up duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateApplications();
