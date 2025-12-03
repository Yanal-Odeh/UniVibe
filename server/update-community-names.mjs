import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function updateCommunities() {
  try {
    console.log('📝 Updating community names...\n');

    // Get colleges
    const colleges = await prisma.college.findMany();
    const collegeMap = {};
    colleges.forEach(c => collegeMap[c.code] = c);

    const communityUpdates = [
      {
        oldName: 'Computer Science Club',
        newName: 'Engineers without borders (EWB)',
        collegeCode: 'ENG',
        description: 'Engineers without borders community focusing on social impact projects',
        avatar: '🌍'
      },
      {
        oldName: 'Music & Bands',
        newName: 'Student Association for Physics and Astronomy (SAPA)',
        collegeCode: 'SCI',
        description: 'Student association dedicated to physics and astronomy research',
        avatar: '🔭'
      },
      {
        oldName: 'Photography Club',
        newName: 'Entrepreneurs Association',
        collegeCode: 'IT',
        description: 'Association for aspiring entrepreneurs and innovators',
        avatar: '💡'
      },
      {
        oldName: 'Sports & Fitness',
        newName: 'Medical Students Union',
        collegeCode: 'MED',
        description: 'Union representing medical students and health sciences',
        avatar: '⚕️'
      },
      {
        oldName: 'Art & Design Society',
        newName: 'Theater troupe',
        collegeCode: 'ART',
        description: 'Theater and performing arts community',
        avatar: '🎭'
      },
      {
        oldName: 'Book Club',
        newName: 'Legal Clinic',
        collegeCode: 'LAW',
        description: 'Legal clinic providing legal education and community service',
        avatar: '⚖️'
      }
    ];

    for (const update of communityUpdates) {
      // Find community by old name
      const community = await prisma.community.findUnique({
        where: { name: update.oldName }
      });

      if (community) {
        const college = collegeMap[update.collegeCode];
        
        await prisma.community.update({
          where: { id: community.id },
          data: {
            name: update.newName,
            description: update.description,
            avatar: update.avatar,
            collegeId: college.id
          }
        });
        console.log(`✅ Updated: "${update.oldName}" → "${update.newName}" (${update.collegeCode})`);
      } else {
        console.log(`⚠️  Community "${update.oldName}" not found`);
      }
    }

    console.log('\n✨ Community names updated successfully!');

    // Show all communities
    const allCommunities = await prisma.community.findMany({
      include: { college: true },
      orderBy: { name: 'asc' }
    });

    console.log('\n📋 Current Communities:');
    allCommunities.forEach(c => {
      console.log(`   ${c.avatar} ${c.name} - ${c.college?.name || 'No college'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateCommunities();
