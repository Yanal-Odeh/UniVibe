import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkMembers() {
  try {
    const members = await prisma.communityMember.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        community: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('=== Community Members ===');
    console.log(JSON.stringify(members, null, 2));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkMembers();
