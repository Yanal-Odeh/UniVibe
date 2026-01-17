import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import communityRoutes from './routes/communities.js';
import eventRoutes from './routes/events.js';
import collegeRoutes from './routes/colleges.js';
import notificationRoutes from './routes/notifications.js';
import applicationRoutes from './routes/applications.js';
import registrationRoutes from './routes/registrations.js';
import savedEventRoutes from './routes/savedEvents.js';
import studySpaceRoutes from './routes/studySpaces.js';
import taskRoutes from './routes/tasks.js';
import { startReminderScheduler } from './services/eventReminderService.js';
import { startDailyResetScheduler } from './services/studySpaceResetService.js';

// Load .env from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
const PORT = process.env.PORT || 5000;

// Middleware
// Compression middleware - compress all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Balance between compression and speed
}));

// Allow any origin in development so Vite's port changes won't cause CORS failures.
const isDev = process.env.NODE_ENV === 'development';
const corsOrigin = isDev ? true : (process.env.CLIENT_URL || 'http://localhost:5173');
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
console.log(`CORS configured. origin=${isDev ? 'allow-any (development)' : corsOrigin}`);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/saved-events', savedEventRoutes);
app.use('/api/study-spaces', studySpaceRoutes);
app.use('/api', taskRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      database: 'Connected to Supabase'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Server is running',
      database: 'Database connection failed',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mobile access: http://192.168.1.8:${PORT}`);
  
  // Test database connection on startup
  try {
    await prisma.$connect();
    console.log('✅ Connected to Supabase database');
    
    // Start event reminder scheduler
    startReminderScheduler();
    
    // Start daily reset scheduler for study spaces
    startDailyResetScheduler();
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
  }
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
