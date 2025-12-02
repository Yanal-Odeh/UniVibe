import pkg from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function checkAndAssignColleges() {
  try {
    console.log('🔍 Checking Faculty Leaders and Deans...\n');
    
    const colleges = await prisma.college.findMany();
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['FACULTY_LEADER', 'DEAN_OF_FACULTY']
        }
      },
      include: {
        college: true
      }
    });

    console.log('📚 Colleges:');
    colleges.forEach(c => console.log(`  - ${c.name} (ID: ${c.id})`));
    
    console.log('\n👥 Faculty Leaders and Deans:');
    for (const user of users) {
      const collegeName = user.college ? user.college.name : '❌ NOT ASSIGNED';
      console.log(`  - ${user.firstName} ${user.lastName} (${user.role}): ${collegeName}`);
      
      // Auto-assign to Arts college if not assigned
      if (!user.collegeId && colleges.length > 0) {
        const artsCollege = colleges.find(c => c.code === 'ART') || colleges[0];
        await prisma.user.update({
          where: { id: user.id },
          data: { collegeId: artsCollege.id }
        });
        console.log(`    ✅ Assigned to ${artsCollege.name}`);
      }
    }

    console.log('\n✨ All Faculty Leaders and Deans have college assignments!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndAssignColleges();
