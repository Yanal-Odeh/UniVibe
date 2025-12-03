import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // 1. Seed Admin Users
  console.log('📝 Seeding admin users...');
  const admins = [
    {
      email: 'yanal@univibe.edu',
      password: 'yanal1234',
      firstName: 'Yanal',
      lastName: 'Oudeh',
      role: 'ADMIN'
    },
    {
      email: 'younis@univibe.edu',
      password: 'younis1234',
      firstName: 'Younis',
      lastName: 'Masri',
      role: 'ADMIN'
    }
  ];

  const createdAdmins = [];
  for (const admin of admins) {
    const existing = await prisma.user.findUnique({ where: { email: admin.email } });
    if (existing) {
      console.log(`⚠️  Admin ${admin.email} already exists`);
      createdAdmins.push(existing);
      continue;
    }

    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const newAdmin = await prisma.user.create({
      data: { ...admin, password: hashedPassword }
    });
    createdAdmins.push(newAdmin);
    console.log(`✅ Created admin: ${newAdmin.email}`);
  }

  // 2. Seed Students
  console.log('\n📝 Seeding students...');
  const students = [
    { email: 'sarah@univibe.edu', password: 'password123', firstName: 'Sarah', lastName: 'Johnson', role: 'CLUB_LEADER' },
    { email: 'mike@univibe.edu', password: 'password123', firstName: 'Mike', lastName: 'Chen', role: 'STUDENT' },
    { email: 'emily@univibe.edu', password: 'password123', firstName: 'Emily', lastName: 'Davis', role: 'STUDENT' },
    { email: 'alex@univibe.edu', password: 'password123', firstName: 'Alex', lastName: 'Kumar', role: 'STUDENT' },
    { email: 'jessica@univibe.edu', password: 'password123', firstName: 'Jessica', lastName: 'Lee', role: 'CLUB_LEADER' },
    { email: 'david@univibe.edu', password: 'password123', firstName: 'David', lastName: 'Park', role: 'STUDENT' },
    { email: 'ryan@univibe.edu', password: 'password123', firstName: 'Ryan', lastName: 'Martinez', role: 'CLUB_LEADER' },
    { email: 'lisa@univibe.edu', password: 'password123', firstName: 'Lisa', lastName: 'Wang', role: 'DEAN_OF_FACULTY' },
    { email: 'tom@univibe.edu', password: 'password123', firstName: 'Tom', lastName: 'Wilson', role: 'CLUB_LEADER' },
    { email: 'amy@univibe.edu', password: 'password123', firstName: 'Amy', lastName: 'Zhang', role: 'CLUB_LEADER' },
    { email: 'chris@univibe.edu', password: 'password123', firstName: 'Chris', lastName: 'Brown', role: 'CLUB_LEADER' },
    { email: 'olivia@univibe.edu', password: 'password123', firstName: 'Olivia', lastName: 'Martinez', role: 'STUDENT' },
    { email: 'daniel@univibe.edu', password: 'password123', firstName: 'Daniel', lastName: 'Lee', role: 'STUDENT' },
    { email: 'sophia@univibe.edu', password: 'password123', firstName: 'Sophia', lastName: 'Brown', role: 'STUDENT' },
    { email: 'noah@univibe.edu', password: 'password123', firstName: 'Noah', lastName: 'Anderson', role: 'STUDENT' },
    { email: 'emma@univibe.edu', password: 'password123', firstName: 'Emma', lastName: 'Taylor', role: 'STUDENT' },
    { email: 'liam@univibe.edu', password: 'password123', firstName: 'Liam', lastName: 'Garcia', role: 'STUDENT' },
    { email: 'ava@univibe.edu', password: 'password123', firstName: 'Ava', lastName: 'Rodriguez', role: 'STUDENT' },
    { email: 'william@univibe.edu', password: 'password123', firstName: 'William', lastName: 'Kim', role: 'STUDENT' },
    { email: 'isabella@univibe.edu', password: 'password123', firstName: 'Isabella', lastName: 'Nguyen', role: 'STUDENT' }
  ];

  const createdStudents = {};
  for (const student of students) {
    const existing = await prisma.user.findUnique({ where: { email: student.email } });
    if (existing) {
      console.log(`⚠️  Student ${student.email} already exists`);
      createdStudents[student.email] = existing;
      continue;
    }

    const hashedPassword = await bcrypt.hash(student.password, 10);
    const newStudent = await prisma.user.create({
      data: { 
        ...student, 
        password: hashedPassword,
        createdBy: createdAdmins[0].id
      }
    });
    createdStudents[student.email] = newStudent;
    console.log(`✅ Created student: ${newStudent.email}`);
  }

  // 3. Seed Communities
  console.log('\n📝 Seeding communities...');
  const communities = [
    {
      name: 'Computer Science Club',
      description: 'For all tech enthusiasts and programmers',
      avatar: '🖥️',
      color: '#667eea',
      createdBy: createdStudents['sarah@univibe.edu'].id,
      members: [
        { email: 'sarah@univibe.edu', joinedAt: new Date('2024-01-15') },
        { email: 'mike@univibe.edu', joinedAt: new Date('2024-01-20') },
        { email: 'emily@univibe.edu', joinedAt: new Date('2024-02-10') },
        { email: 'alex@univibe.edu', joinedAt: new Date('2024-02-15') },
        { email: 'james@univibe.edu', joinedAt: new Date('2024-01-25') },
        { email: 'olivia@univibe.edu', joinedAt: new Date('2024-03-01') },
        { email: 'daniel@univibe.edu', joinedAt: new Date('2024-03-05') },
        { email: 'sophia@univibe.edu', joinedAt: new Date('2024-03-10') },
        { email: 'noah@univibe.edu', joinedAt: new Date('2024-03-15') },
        { email: 'emma@univibe.edu', joinedAt: new Date('2024-03-20') },
        { email: 'liam@univibe.edu', joinedAt: new Date('2024-03-25') },
        { email: 'ava@univibe.edu', joinedAt: new Date('2024-04-01') },
        { email: 'william@univibe.edu', joinedAt: new Date('2024-04-05') },
        { email: 'isabella@univibe.edu', joinedAt: new Date('2024-04-10') }
      ]
    },
    {
      name: 'Art & Design Society',
      description: 'Creative minds unite! Share your artwork and designs',
      avatar: '🎨',
      color: '#f093fb',
      createdBy: createdStudents['jessica@univibe.edu'].id,
      members: [
        { email: 'jessica@univibe.edu', joinedAt: new Date('2024-01-10') },
        { email: 'david@univibe.edu', joinedAt: new Date('2024-01-25') }
      ]
    },
    {
      name: 'Sports & Fitness',
      description: 'Stay active and healthy together',
      avatar: '⚽',
      color: '#4facfe',
      createdBy: createdStudents['ryan@univibe.edu'].id,
      members: [
        { email: 'ryan@univibe.edu', joinedAt: new Date('2024-01-05') },
        { email: 'lisa@univibe.edu', joinedAt: new Date('2024-01-12') }
      ]
    },
    {
      name: 'Photography Club',
      description: 'Capture moments, share perspectives',
      avatar: '📷',
      color: '#43e97b',
      createdBy: createdStudents['tom@univibe.edu'].id,
      members: [
        { email: 'tom@univibe.edu', joinedAt: new Date('2024-01-08') }
      ]
    },
    {
      name: 'Music & Bands',
      description: 'Musicians, singers, and music lovers welcome',
      avatar: '🎵',
      color: '#fa709a',
      createdBy: createdStudents['amy@univibe.edu'].id,
      members: [
        { email: 'amy@univibe.edu', joinedAt: new Date('2024-01-03') }
      ]
    },
    {
      name: 'Book Club',
      description: 'Read, discuss, and share your favorite books',
      avatar: '📚',
      color: '#ffd16a',
      createdBy: createdStudents['chris@univibe.edu'].id,
      members: [
        { email: 'chris@univibe.edu', joinedAt: new Date('2024-01-18') }
      ]
    }
  ];

  const createdCommunities = [];
  for (const community of communities) {
    const existing = await prisma.community.findUnique({ where: { name: community.name } });
    if (existing) {
      console.log(`⚠️  Community "${community.name}" already exists`);
      // Update existing community to set club leader
      const updated = await prisma.community.update({
        where: { id: existing.id },
        data: { clubLeaderId: community.createdBy }
      });
      createdCommunities.push(updated);
      continue;
    }

    const newCommunity = await prisma.community.create({
      data: {
        name: community.name,
        description: community.description,
        avatar: community.avatar,
        color: community.color,
        createdBy: community.createdBy,
        clubLeaderId: community.createdBy
      }
    });
    
    // Add members
    for (const member of community.members) {
      const user = createdStudents[member.email];
      if (user) {
        await prisma.communityMember.create({
          data: {
            userId: user.id,
            communityId: newCommunity.id,
            joinedAt: member.joinedAt
          }
        });
      }
    }
    
    createdCommunities.push(newCommunity);
    console.log(`✅ Created community: ${newCommunity.name} with ${community.members.length} members`);
  }

  // 4. Seed Events
  console.log('\n📝 Seeding events...');
  const events = [
    {
      title: 'Tech Innovation Summit',
      description: 'Join us for an inspiring day of technology, innovation, and networking. The Tech Innovation Summit 2025 is our flagship event designed to bridge the gap between academic learning and industry innovation.',
      location: 'Main Auditorium',
      startDate: new Date('2025-03-15T09:00:00'),
      endDate: new Date('2025-03-15T17:00:00'),
      communityId: createdCommunities[0].id, // Computer Science Club
      createdBy: createdStudents['sarah@univibe.edu'].id
    },
    {
      title: 'Spring Music Festival',
      description: 'An evening of performances by student bands and guest artists. Enjoy a variety of musical acts across multiple stages.',
      location: 'Campus Grounds',
      startDate: new Date('2025-03-20T18:00:00'),
      endDate: new Date('2025-03-20T23:00:00'),
      communityId: createdCommunities[4].id, // Music & Bands
      createdBy: createdStudents['amy@univibe.edu'].id
    },
    {
      title: 'Career Fair 2025',
      description: 'Meet employers and learn about opportunities. Bring resumes and be ready to network.',
      location: 'Sports Complex',
      startDate: new Date('2025-03-25T10:00:00'),
      endDate: new Date('2025-03-25T16:00:00'),
      communityId: null, // University-wide event
      createdBy: createdAdmins[0].id
    }
  ];

  for (const event of events) {
    const existing = await prisma.event.findFirst({ 
      where: { 
        title: event.title,
        startDate: event.startDate
      } 
    });
    
    if (existing) {
      console.log(`⚠️  Event "${event.title}" already exists`);
      continue;
    }

    const newEvent = await prisma.event.create({ data: event });
    console.log(`✅ Created event: ${newEvent.title}`);
  }

  // 5. Seed Colleges and Locations
  console.log('\n📝 Seeding colleges and locations...');
  const colleges = [
    { name: 'College of Engineering', code: 'ENG' },
    { name: 'College of Business', code: 'BUS' },
    { name: 'College of Arts and Sciences', code: 'ART' },
    { name: 'College of Medicine', code: 'MED' },
    { name: 'College of Information Technology', code: 'IT' },
    { name: 'College of Science', code: 'SCI' }
  ];

  const createdColleges = {};
  for (const college of colleges) {
    let existingCollege = await prisma.college.findUnique({
      where: { code: college.code }
    });

    if (!existingCollege) {
      existingCollege = await prisma.college.create({ data: college });
      console.log(`✅ Created college: ${existingCollege.name}`);
    } else {
      console.log(`⚠️  College "${college.name}" already exists`);
    }

    createdColleges[college.code] = existingCollege;

    // Add 2 locations for each college
    const locations = [
      { name: 'Auditorium', capacity: 200, collegeId: existingCollege.id },
      { name: 'Conference Room', capacity: 50, collegeId: existingCollege.id }
    ];

    for (const location of locations) {
      const existingLocation = await prisma.location.findFirst({
        where: {
          name: location.name,
          collegeId: location.collegeId
        }
      });

      if (!existingLocation) {
        const newLocation = await prisma.location.create({ data: location });
        console.log(`✅ Created location: ${existingCollege.code} - ${newLocation.name}`);
      } else {
        console.log(`⚠️  Location "${location.name}" at ${existingCollege.code} already exists`);
      }
    }

    // Create Faculty Leader and Dean of Faculty for each college
    const facultyLeaderEmail = `faculty.${college.code.toLowerCase()}@univibe.edu`;
    const deanEmail = `dean.${college.code.toLowerCase()}@univibe.edu`;

    // Faculty Leader
    const existingFaculty = await prisma.user.findUnique({ where: { email: facultyLeaderEmail } });
    if (!existingFaculty) {
      const hashedPassword = await bcrypt.hash('faculty123', 10);
      await prisma.user.create({
        data: {
          email: facultyLeaderEmail,
          password: hashedPassword,
          firstName: 'Faculty',
          lastName: `Leader ${college.code}`,
          role: 'FACULTY_LEADER',
          collegeId: existingCollege.id
        }
      });
      console.log(`✅ Created Faculty Leader for ${college.code}`);
    } else {
      console.log(`⚠️  Faculty Leader for ${college.code} already exists`);
    }

    // Dean of Faculty
    const existingDean = await prisma.user.findUnique({ where: { email: deanEmail } });
    if (!existingDean) {
      const hashedPassword = await bcrypt.hash('dean123', 10);
      await prisma.user.create({
        data: {
          email: deanEmail,
          password: hashedPassword,
          firstName: 'Dean',
          lastName: `of ${college.name}`,
          role: 'DEAN_OF_FACULTY',
          collegeId: existingCollege.id
        }
      });
      console.log(`✅ Created Dean of Faculty for ${college.code}`);
    } else {
      console.log(`⚠️  Dean of Faculty for ${college.code} already exists`);
    }
  }

  // Update existing communities to assign them to colleges
  console.log('\n📝 Assigning communities to colleges...');
  const communityCollegeMapping = {
    'Computer Science Club': 'ENG',
    'Book Club': 'BUS',
    'Art & Design Society': 'ART',
    'Sports & Fitness': 'MED',
    'Photography Club': 'IT',
    'Music & Bands': 'SCI'
  };

  for (const [communityName, collegeCode] of Object.entries(communityCollegeMapping)) {
    const community = await prisma.community.findUnique({ where: { name: communityName } });
    if (community && !community.collegeId) {
      await prisma.community.update({
        where: { id: community.id },
        data: { collegeId: createdColleges[collegeCode].id }
      });
      console.log(`✅ Assigned "${communityName}" to ${collegeCode}`);
    }
  }

  console.log('\n✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
