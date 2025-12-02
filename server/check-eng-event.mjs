import pkg from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function checkEngineering() {
  try {
    console.log('🔍 Checking Engineering event...\n');
    
    // Find the "lab" event
    const event = await prisma.event.findFirst({
      where: { title: { contains: 'lab', mode: 'insensitive' } },
      include: {
        creator: true,
        college: true,
        community: {
          include: { college: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!event) {
      console.log('❌ No "lab" event found');
      return;
    }

    console.log('📅 Event Details:');
    console.log(`   Title: ${event.title}`);
    console.log(`   Event College ID: ${event.collegeId}`);
    console.log(`   Event College Name: ${event.college?.name || 'NOT SET'}`);
    console.log(`   Community: ${event.community?.name}`);
    console.log(`   Community College ID: ${event.community?.collegeId}`);
    console.log(`   Community College Name: ${event.community?.college?.name || 'NOT SET'}`);

    // Find Faculty Leader ENG
    const facultyLeader = await prisma.user.findFirst({
      where: {
        email: 'faculty.eng@univibe.edu',
        role: 'FACULTY_LEADER'
      },
      include: { college: true }
    });

    if (facultyLeader) {
      console.log('\n👤 Faculty Leader ENG:');
      console.log(`   Name: ${facultyLeader.firstName} ${facultyLeader.lastName}`);
      console.log(`   College ID: ${facultyLeader.collegeId}`);
      console.log(`   College Name: ${facultyLeader.college?.name || 'NOT SET'}`);
    }

    console.log('\n🔍 Checking Match:');
    console.log(`   Event College ID: ${event.collegeId}`);
    console.log(`   Faculty College ID: ${facultyLeader?.collegeId}`);
    console.log(`   Match: ${event.collegeId === facultyLeader?.collegeId ? '✅ YES' : '❌ NO'}`);

    // Fix if needed
    if (event.community?.collegeId && event.collegeId !== event.community.collegeId) {
      console.log('\n⚠️  Event college mismatch! Fixing...');
      await prisma.event.update({
        where: { id: event.id },
        data: { collegeId: event.community.collegeId }
      });
      console.log('✅ Fixed! Event college now matches community college.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEngineering();
