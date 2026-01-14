import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function assignClubLeaders() {
  try {
    console.log('👥 Assigning club leaders to communities...\n');

    // Club Leader assignments (based on seed data)
    const assignments = [
      { email: 'sarah@univibe.edu', communityName: 'Engineers without borders (EWB)' },
      { email: 'jessica@univibe.edu', communityName: 'Theater troupe' },
      { email: 'ryan@univibe.edu', communityName: 'Medical Students Union' },
      { email: 'tom@univibe.edu', communityName: 'Entrepreneurs Association' },
      { email: 'amy@univibe.edu', communityName: 'Student Association for Physics and Astronomy (SAPA)' },
      { email: 'chris@univibe.edu', communityName: 'Legal Clinic' }
    ];

    for (const assignment of assignments) {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: assignment.email }
      });

      if (!user) {
        console.log(`⚠️  User ${assignment.email} not found`);
        continue;
      }

      // Find community
      const community = await prisma.community.findUnique({
        where: { name: assignment.communityName },
        include: { college: true }
      });

      if (!community) {
        console.log(`⚠️  Community "${assignment.communityName}" not found`);
        continue;
      }

      // Update community with club leader
      await prisma.community.update({
        where: { id: community.id },
        data: { clubLeaderId: user.id }
      });

      console.log(`✅ ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   → Club Leader of: ${community.name}`);
      console.log(`   → Faculty: ${community.college?.name || 'No college'}`);
      console.log('');
    }

    // Display final summary
    console.log('\n📊 Final Club Leader Assignments:');
    console.log('=' .repeat(80));
    
    const allCommunities = await prisma.community.findMany({
      include: { 
        college: true,
        clubLeader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    for (const community of allCommunities) {
      console.log(`${community.avatar} ${community.name}`);
      console.log(`   Faculty: ${community.college?.name || '❌ NO COLLEGE'}`);
      
      if (community.clubLeader) {
        console.log(`   Club Leader: ${community.clubLeader.firstName} ${community.clubLeader.lastName}`);
        console.log(`   Email: ${community.clubLeader.email}`);
        console.log(`   Role: ${community.clubLeader.role}`);
      } else {
        console.log(`   ❌ NO CLUB LEADER ASSIGNED`);
      }
      console.log('');
    }

    console.log('✨ All club leaders have been assigned!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

assignClubLeaders();
