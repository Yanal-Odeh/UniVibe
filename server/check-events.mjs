import pkg from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function checkEventData() {
  try {
    console.log('🔍 Checking recent events...\n');
    
    const events = await prisma.event.findMany({
      include: {
        creator: true,
        college: true,
        community: {
          include: {
            college: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    for (const event of events) {
      console.log(`\n📅 Event: ${event.title}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Created by: ${event.creator.firstName} ${event.creator.lastName} (${event.creator.role})`);
      console.log(`   Event College: ${event.college?.name || '❌ NOT SET'}`);
      console.log(`   Community: ${event.community?.name || 'No community'}`);
      console.log(`   Community College: ${event.community?.college?.name || '❌ NOT SET'}`);
      
      // Fix if event college doesn't match community college
      if (event.community?.collegeId && event.collegeId !== event.community.collegeId) {
        console.log(`   ⚠️  MISMATCH! Fixing...`);
        await prisma.event.update({
          where: { id: event.id },
          data: { collegeId: event.community.collegeId }
        });
        console.log(`   ✅ Updated event college to match community`);
      }
    }

    console.log('\n✨ Done!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEventData();
