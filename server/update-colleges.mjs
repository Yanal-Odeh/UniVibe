import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function updateColleges() {
  try {
    console.log('📝 Updating college names...\n');

    const collegeUpdates = [
      { code: 'ENG', name: 'Faculty of Engineering' },
      { code: 'MED', name: 'Faculty of Medicine and Allied medical Sciences' },
      { code: 'ART', name: 'Faculty of Fine Arts' },
      { code: 'IT', name: 'Faculty of Information Technology & Artificial Intelligence' },
      { code: 'SCI', name: 'Faculty of Science' }
    ];

    // Add new LAW college
    const lawCollege = await prisma.college.findUnique({
      where: { code: 'LAW' }
    });

    if (!lawCollege) {
      const newLaw = await prisma.college.create({
        data: {
          code: 'LAW',
          name: 'Faculty of Law and Political Sciences'
        }
      });
      console.log(`✅ Created new college: ${newLaw.name}`);

      // Add locations for LAW
      await prisma.location.createMany({
        data: [
          { name: 'Auditorium', capacity: 200, collegeId: newLaw.id },
          { name: 'Conference Room', capacity: 50, collegeId: newLaw.id }
        ]
      });
      console.log('✅ Created locations for Faculty of Law');

      // Create Faculty Leader for LAW
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('faculty123', 10);
      await prisma.user.create({
        data: {
          email: 'faculty.law@univibe.edu',
          password: hashedPassword,
          firstName: 'Faculty',
          lastName: 'Leader LAW',
          role: 'FACULTY_LEADER',
          collegeId: newLaw.id
        }
      });
      console.log('✅ Created Faculty Leader for Faculty of Law');

      // Create Dean for LAW
      const deanPassword = await bcrypt.hash('dean123', 10);
      await prisma.user.create({
        data: {
          email: 'dean.law@univibe.edu',
          password: deanPassword,
          firstName: 'Dean',
          lastName: 'of LAW',
          role: 'DEAN_OF_FACULTY',
          collegeId: newLaw.id
        }
      });
      console.log('✅ Created Dean of Faculty for Faculty of Law\n');
    } else {
      console.log('⚠️  Faculty of Law already exists\n');
    }

    // Update existing colleges
    for (const update of collegeUpdates) {
      const college = await prisma.college.findUnique({
        where: { code: update.code }
      });

      if (college) {
        await prisma.college.update({
          where: { code: update.code },
          data: { name: update.name }
        });
        console.log(`✅ Updated ${update.code}: ${update.name}`);
      } else {
        console.log(`⚠️  College with code ${update.code} not found`);
      }
    }

    // Delete old BUS college if exists
    const busCollege = await prisma.college.findUnique({
      where: { code: 'BUS' }
    });

    if (busCollege) {
      // Check if any communities are assigned to BUS
      const communities = await prisma.community.findMany({
        where: { collegeId: busCollege.id }
      });

      if (communities.length > 0) {
        // Reassign communities to LAW
        const lawCollegeFinal = await prisma.college.findUnique({
          where: { code: 'LAW' }
        });

        if (lawCollegeFinal) {
          await prisma.community.updateMany({
            where: { collegeId: busCollege.id },
            data: { collegeId: lawCollegeFinal.id }
          });
          console.log(`\n✅ Reassigned ${communities.length} communities from BUS to LAW`);
        }
      }

      // Delete users associated with BUS
      await prisma.user.deleteMany({
        where: { collegeId: busCollege.id }
      });
      console.log('✅ Deleted users from old BUS college');

      // Delete locations
      await prisma.location.deleteMany({
        where: { collegeId: busCollege.id }
      });
      console.log('✅ Deleted locations from old BUS college');

      // Delete college
      await prisma.college.delete({
        where: { code: 'BUS' }
      });
      console.log('✅ Deleted old Business college');
    }

    console.log('\n✨ College names updated successfully!');

    // Show all colleges
    const allColleges = await prisma.college.findMany({
      orderBy: { code: 'asc' }
    });

    console.log('\n📋 Current Colleges:');
    allColleges.forEach(c => {
      console.log(`   ${c.code}: ${c.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateColleges();
