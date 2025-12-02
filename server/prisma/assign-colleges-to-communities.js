import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function assignCollegesToCommunities() {
  try {
    console.log('Fetching communities and colleges...');
    
    const communities = await prisma.community.findMany();
    const colleges = await prisma.college.findMany();
    
    console.log(`Found ${communities.length} communities`);
    console.log(`Found ${colleges.length} colleges`);
    
    if (colleges.length === 0) {
      console.log('No colleges found. Please create colleges first.');
      return;
    }
    
    // Display current state
    console.log('\nCurrent communities:');
    for (const community of communities) {
      const collegeName = community.collegeId 
        ? colleges.find(c => c.id === community.collegeId)?.name || 'Unknown'
        : 'Not assigned';
      console.log(`- ${community.name}: ${collegeName}`);
    }
    
    // Count communities without college assignment
    const unassignedCount = communities.filter(c => !c.collegeId).length;
    console.log(`\n${unassignedCount} communities need college assignment.`);
    
    if (unassignedCount > 0) {
      console.log('\nAssigning communities to first college (College of Arts and Sciences)...');
      const firstCollege = colleges[0];
      
      for (const community of communities) {
        if (!community.collegeId) {
          await prisma.community.update({
            where: { id: community.id },
            data: { collegeId: firstCollege.id }
          });
          console.log(`✅ Assigned "${community.name}" to "${firstCollege.name}"`);
        }
      }
    }
    
    console.log('\n✅ All communities now have college assignments!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignCollegesToCommunities();
