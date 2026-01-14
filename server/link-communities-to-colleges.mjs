import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function linkCommunitiesToColleges() {
  try {
    console.log('🔗 Linking communities to colleges...\n');

    // Get all colleges
    const colleges = await prisma.college.findMany();
    console.log(`Found ${colleges.length} colleges in database\n`);

    // Community to College mapping
    const communityCollegeMap = [
      { communityName: 'Engineers without borders (EWB)', collegeCode: 'ENG' },
      { communityName: 'Theater troupe', collegeCode: 'ART' },
      { communityName: 'Medical Students Union', collegeCode: 'MED' },
      { communityName: 'Entrepreneurs Association', collegeCode: 'IT' },
      { communityName: 'Student Association for Physics and Astronomy (SAPA)', collegeCode: 'SCI' },
      { communityName: 'Legal Clinic', collegeCode: 'LAW' }
    ];

    // Also check old names for backward compatibility
    const oldNameMap = [
      { communityName: 'Computer Science Club', collegeCode: 'ENG' },
      { communityName: 'Art & Design Society', collegeCode: 'ART' },
      { communityName: 'Sports & Fitness', collegeCode: 'MED' },
      { communityName: 'Photography Club', collegeCode: 'IT' },
      { communityName: 'Music & Bands', collegeCode: 'SCI' },
      { communityName: 'Book Club', collegeCode: 'LAW' }
    ];

    const allMappings = [...communityCollegeMap, ...oldNameMap];

    for (const mapping of allMappings) {
      // Find community
      const community = await prisma.community.findUnique({
        where: { name: mapping.communityName },
        include: { college: true, clubLeader: true }
      });

      if (!community) {
        console.log(`⚠️  Community "${mapping.communityName}" not found`);
        continue;
      }

      // Find college
      const college = colleges.find(c => c.code === mapping.collegeCode);
      if (!college) {
        console.log(`⚠️  College with code "${mapping.collegeCode}" not found`);
        continue;
      }

      // Update community to link to college
      if (community.collegeId !== college.id) {
        await prisma.community.update({
          where: { id: community.id },
          data: { collegeId: college.id }
        });
        console.log(`✅ Linked "${community.name}" → ${college.name} (${college.code})`);
      } else {
        console.log(`✓  "${community.name}" already linked to ${college.name}`);
      }

      // Show club leader info
      if (community.clubLeader) {
        console.log(`   Club Leader: ${community.clubLeader.firstName} ${community.clubLeader.lastName} (${community.clubLeader.email})`);
      } else {
        console.log(`   ⚠️  No club leader assigned`);
      }
      console.log('');
    }

    // Display final summary
    console.log('\n📊 Final Summary:');
    console.log('=' .repeat(80));
    
    const allCommunities = await prisma.community.findMany({
      include: { 
        college: true,
        clubLeader: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    for (const community of allCommunities) {
      const leaderInfo = community.clubLeader 
        ? `${community.clubLeader.firstName} ${community.clubLeader.lastName}`
        : 'No leader';
      const collegeInfo = community.college?.name || '❌ NO COLLEGE';
      
      console.log(`${community.avatar} ${community.name}`);
      console.log(`   Faculty: ${collegeInfo}`);
      console.log(`   Leader: ${leaderInfo}`);
      console.log('');
    }

    console.log('✨ All communities have been linked to their colleges!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

linkCommunitiesToColleges();
