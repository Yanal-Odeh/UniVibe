import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import prisma from './utils/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

async function getDeansAndColleges() {
  try {
    const deans = await prisma.user.findMany({
      where: {
        role: 'DEAN_OF_FACULTY'
      },
      include: {
        college: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });
    
    console.log('\n=== DEANS OF FACULTY AND THEIR COLLEGES ===\n');
    
    if (deans.length === 0) {
      console.log('❌ No deans found in the database.');
    } else {
      console.log(`Total Deans: ${deans.length}\n`);
      deans.forEach((dean, index) => {
        console.log(`${index + 1}. 👤 Dean: ${dean.firstName} ${dean.lastName}`);
        console.log(`   📧 Email: ${dean.email}`);
        console.log(`   🏛️  College: ${dean.college ? dean.college.name : '⚠️  Not assigned'}`);
        console.log(`   🔖 College Code: ${dean.college ? dean.college.code : 'N/A'}`);
        console.log(`   🆔 College ID: ${dean.collegeId || 'Not assigned'}`);
        console.log('');
      });
    }
    
    // Also show all colleges
    console.log('\n=== ALL COLLEGES ===\n');
    const colleges = await prisma.college.findMany({
      orderBy: {
        code: 'asc'
      }
    });
    
    colleges.forEach((college, index) => {
      console.log(`${index + 1}. ${college.name} (${college.code})`);
      console.log(`   ID: ${college.id}`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

getDeansAndColleges();
