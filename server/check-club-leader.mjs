import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function checkClubLeader() {
  try {
    // Find Sarah Johnson
    const sarah = await prisma.user.findFirst({
      where: {
        firstName: 'Sarah',
        lastName: 'Johnson'
      }
    });

    console.log('Sarah Johnson User:', {
      id: sarah?.id,
      email: sarah?.email,
      role: sarah?.role
    });

    // Find EWB community
    const ewb = await prisma.community.findFirst({
      where: {
        name: {
          contains: 'Engineers'
        }
      }
    });

    console.log('\nEWB Community:', {
      id: ewb?.id,
      name: ewb?.name,
      clubLeaderId: ewb?.clubLeaderId,
      createdBy: ewb?.createdBy
    });

    // Check the specific event
    const event = await prisma.event.findFirst({
      where: {
        title: 'newwork'
      },
      include: {
        community: true
      }
    });

    console.log('\nEvent:', {
      id: event?.id,
      title: event?.title,
      communityId: event?.communityId,
      communityName: event?.community?.name,
      communityClubLeaderId: event?.community?.clubLeaderId
    });

    console.log('\n=== COMPARISON ===');
    console.log('Sarah ID:', sarah?.id);
    console.log('EWB clubLeaderId:', ewb?.clubLeaderId);
    console.log('Event community clubLeaderId:', event?.community?.clubLeaderId);
    console.log('Match?', sarah?.id === event?.community?.clubLeaderId);

    // If not matching, let's fix it
    if (sarah && ewb && sarah.id !== ewb.clubLeaderId) {
      console.log('\n⚠️  Sarah is NOT the club leader. Fixing...');
      await prisma.community.update({
        where: { id: ewb.id },
        data: { clubLeaderId: sarah.id }
      });
      console.log('✅ Fixed! Sarah is now the club leader of EWB');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClubLeader();
