import pkg from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function assignCommunities() {
  try {
    console.log('🔍 Fetching colleges...');
    const colleges = await prisma.college.findMany();
    
    if (colleges.length === 0) {
      console.log('❌ No colleges found!');
      return;
    }

    console.log('\n📚 Available Colleges:');
    colleges.forEach(college => {
      console.log(`  - ${college.name} (${college.code})`);
    });

    const artsCollege = colleges.find(c => c.code === 'ART' || c.name.toLowerCase().includes('arts'));
    const engineeringCollege = colleges.find(c => c.code === 'ENG' || c.name.toLowerCase().includes('engineering'));
    const scienceCollege = colleges.find(c => c.code === 'SCI' || c.name.toLowerCase().includes('science'));
    const businessCollege = colleges.find(c => c.code === 'BUS' || c.name.toLowerCase().includes('business'));

    // Fetch all communities
    console.log('\n🔍 Fetching communities...');
    const communities = await prisma.community.findMany();
    console.log(`Found ${communities.length} communities\n`);

    // Assignment map
    const assignments = {
      'Book Club': artsCollege,
      'Music & Bands': artsCollege,
      'Drama Club': artsCollege,
      'Art & Design': artsCollege,
      'Computer Science Club': engineeringCollege || scienceCollege,
      'Robotics Club': engineeringCollege,
      'Tech Innovation': engineeringCollege || scienceCollege,
      'Business Leaders': businessCollege || artsCollege,
      'Entrepreneurship': businessCollege || artsCollege,
      'Sports & Fitness': artsCollege, // Default to arts if no specific college
      'Photography Club': artsCollege,
      'Debate Society': artsCollege,
    };

    console.log('📝 Assigning communities to colleges...\n');
    
    for (const community of communities) {
      const assignedCollege = assignments[community.name] || artsCollege || colleges[0];
      
      if (!assignedCollege) {
        console.log(`⚠️  No college to assign for ${community.name}`);
        continue;
      }

      await prisma.community.update({
        where: { id: community.id },
        data: { collegeId: assignedCollege.id }
      });

      console.log(`✅ "${community.name}" → ${assignedCollege.name}`);
    }

    console.log('\n✨ All communities assigned successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

assignCommunities();
