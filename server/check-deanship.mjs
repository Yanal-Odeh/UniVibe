import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const deanships = await prisma.user.findMany({
  where: { role: 'DEANSHIP_OF_STUDENT_AFFAIRS' }
});

console.log(`Found ${deanships.length} Deanship user(s):`);
deanships.forEach(d => console.log(`  - ${d.firstName} ${d.lastName} (${d.email})`));

await prisma.$disconnect();
