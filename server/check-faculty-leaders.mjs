import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function checkRoles() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['FACULTY_LEADER', 'DEANSHIP_OF_STUDENT_AFFAIRS']
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        college: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { college: { name: 'asc' } }
      ]
    });

    console.log('\n=== FACULTY LEADERS AND DEANSHIP CHECK ===\n');
    
    const facultyLeaders = users.filter(u => u.role === 'FACULTY_LEADER');
    const deanships = users.filter(u => u.role === 'DEANSHIP_OF_STUDENT_AFFAIRS');
    
    console.log('FACULTY_LEADER per college:');
    const byCollege = {};
    facultyLeaders.forEach(fl => {
      const collegeName = fl.college?.name || 'No College';
      if (!byCollege[collegeName]) byCollege[collegeName] = [];
      byCollege[collegeName].push(`${fl.firstName} ${fl.lastName}`);
    });
    
    Object.entries(byCollege).forEach(([college, leaders]) => {
      console.log(`  ${college}: ${leaders.length} leader(s) - ${leaders.join(', ')}`);
    });
    
    console.log(`\nDEANSHIP_OF_STUDENT_AFFAIRS: ${deanships.length} user(s)`);
    deanships.forEach(d => {
      console.log(`  ${d.firstName} ${d.lastName}`);
    });
    
    console.log('\n' + '='.repeat(45));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles();
