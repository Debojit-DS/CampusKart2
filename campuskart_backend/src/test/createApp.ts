import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { authRoutes } from '../routes/auth.js';
import { institutionRoutes } from '../routes/institutions.js';
import { categoryRoutes } from '../routes/categories.js';
import { listingRoutes } from '../routes/listings.js';
import { conversationRoutes } from '../routes/conversations.js';
import { offerRoutes } from '../routes/offers.js';
import { notificationRoutes } from '../routes/notifications.js';
import { userRoutes } from '../routes/users.js';
import { reportRoutes } from '../routes/reports.js';
import { wishlistRoutes } from '../routes/wishlist.js';
import { mediaRoutes } from '../routes/media.js';
import { adminRoutes } from '../routes/admin.js';
import { leaderboardRoutes } from '../routes/leaderboard.js';
import { errorHandler } from '../middleware/errorHandler.js';

export function createTestApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

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

  app.use(errorHandler);
  return app;
}
