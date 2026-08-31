import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';

import { authRoutes } from './routes/auth.js';
import { institutionRoutes } from './routes/institutions.js';
import { categoryRoutes } from './routes/categories.js';
import { listingRoutes } from './routes/listings.js';
import { conversationRoutes } from './routes/conversations.js';
import { offerRoutes } from './routes/offers.js';
import { notificationRoutes } from './routes/notifications.js';
import { userRoutes } from './routes/users.js';
import { reportRoutes } from './routes/reports.js';
import { wishlistRoutes } from './routes/wishlist.js';
import { mediaRoutes } from './routes/media.js';
import { adminRoutes } from './routes/admin.js';
import { leaderboardRoutes } from './routes/leaderboard.js';
import { initializeSocketIO } from './services/socket.js';
import { errorHandler } from './middleware/errorHandler.js';

export const prisma = new PrismaClient();

const app = express();

// Trust proxy for accurate IP tracking behind Render's reverse proxy
app.set('trust proxy', 1);

const httpServer = createServer(app);

// Parse the frontend URLs from the environment variable
const frontendOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(s => s.trim());

const io = new SocketServer(httpServer, {
  cors: {
    origin: frontendOrigins,
    credentials: true,
  },
});

// Security middleware
app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || frontendOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/signup', authLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/institutions', institutionRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/campuses', leaderboardRoutes);

// Error handling
app.use(errorHandler);

// Initialize Socket.IO
initializeSocketIO(io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`CampusKart backend running on port ${PORT}`);
});

export { io };