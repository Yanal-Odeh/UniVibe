import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * 
 * Creating multiple instances of PrismaClient creates multiple connection pools,
 * which can exhaust database connections and hurt performance.
 * This singleton ensures only ONE PrismaClient instance exists across the application.
 * 
 * Best Practices:
 * - In development: Prevents hot reload from creating new instances
 * - In production: Ensures optimal connection pooling
 * - Recommended for serverless/edge: Use with Prisma Accelerate or pgBouncer
 */

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  // Optional: Configure connection pool for better performance
  // Adjust based on your hosting environment
  // datasources: {
  //   db: {
  //     url: process.env.DATABASE_URL,
  //   },
  // },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
