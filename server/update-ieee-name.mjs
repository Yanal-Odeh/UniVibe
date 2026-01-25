import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function updateIEEEName() {
  try {
    console.log('🔄 Updating Engineers without borders to IEEE...');

    // Find the community with old name
    const community = await prisma.community.findFirst({
      where: {
        OR: [
          { name: { contains: 'Engineers without borders' } },
          { name: { contains: 'EWB' } },
          { name: { equals: 'Computer Science Club' } }
        ]
      }
    });

    if (!community) {
      console.log('❌ Community not found');
      return;
    }

    console.log('Found community:', community.name);

    // Update the community
    const updated = await prisma.community.update({
      where: { id: community.id },
      data: {
        name: 'Institute of Electrical and Electronics Engineers (IEEE)',
        description: 'Institute of Electrical and Electronics Engineers community focusing on engineering excellence'
      }
    });

    console.log('✅ Successfully updated community to:', updated.name);

  } catch (error) {
    console.error('❌ Error updating community:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateIEEEName();
