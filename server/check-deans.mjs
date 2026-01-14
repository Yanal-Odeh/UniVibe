import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function checkDeans() {
  try {
    console.log('🔍 Checking Dean assignments...\n');

    // Get all colleges
    const colleges = await prisma.college.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('📊 Colleges and their Deans:');
    console.log('=' .repeat(80));

    for (const college of colleges) {
      console.log(`\n${college.name} (${college.code})`);
      console.log(`College ID: ${college.id}`);
      
      // Find Faculty Leader for this college
      const facultyLeader = await prisma.user.findFirst({
        where: {
          role: 'FACULTY_LEADER',
          collegeId: college.id
        }
      });

      if (facultyLeader) {
        console.log(`✅ Faculty Leader: ${facultyLeader.firstName} ${facultyLeader.lastName} (${facultyLeader.email})`);
      } else {
        console.log(`❌ NO FACULTY LEADER ASSIGNED`);
      }

      // Find Dean of Faculty for this college
      const dean = await prisma.user.findFirst({
        where: {
          role: 'DEAN_OF_FACULTY',
          collegeId: college.id
        }
      });

      if (dean) {
        console.log(`✅ Dean of Faculty: ${dean.firstName} ${dean.lastName} (${dean.email})`);
      } else {
        console.log(`❌ NO DEAN OF FACULTY ASSIGNED`);
      }
    }

    console.log('\n\n📋 All users with DEAN_OF_FACULTY or FACULTY_LEADER roles:');
    console.log('=' .repeat(80));

    const leaders = await prisma.user.findMany({
      where: {
        role: { in: ['FACULTY_LEADER', 'DEAN_OF_FACULTY'] }
      },
      include: {
        college: true
      },
      orderBy: [
        { role: 'asc' },
        { lastName: 'asc' }
      ]
    });

    for (const leader of leaders) {
      console.log(`\n${leader.role}: ${leader.firstName} ${leader.lastName}`);
      console.log(`   Email: ${leader.email}`);
      console.log(`   College: ${leader.college?.name || '❌ NO COLLEGE ASSIGNED'}`);
      console.log(`   College ID: ${leader.collegeId || 'null'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkDeans();
