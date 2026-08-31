import { Router, Response } from 'express';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Configure Cloudinary if credentials are present
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret);

// POST /media/sign-upload
router.post('/sign-upload', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { folder } = req.body;

    if (!folder || !['listings', 'avatars', 'chat'].includes(folder)) {
      return res.status(400).json({ error: 'INVALID_FOLDER' });
    }

    const targetFolder = `campuskart/${folder}`;
    const timestamp = Math.floor(Date.now() / 1000);

    if (isCloudinaryConfigured) {
      // Generate a real Cloudinary signature
      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder: targetFolder },
        apiSecret!
      );

      return res.json({
        cloudName,
        apiKey,
        folder: targetFolder,
        timestamp,
        signature,
      });
    }

    // Demo/mock mode
    return res.json({
      cloudName: cloudName || 'demo',
      apiKey: apiKey || 'demo',
      folder: targetFolder,
      timestamp,
      signature: 'mock-signature',
    });
  } catch (err) {
    console.error('Sign upload error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// POST /media/check-quality
const checkQualitySchema = z.object({
  imageUrl: z.string().url(),
});

router.post('/check-quality', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    checkQualitySchema.parse(req.body);

    // In production, call a vision LLM API (e.g., Google Vision, AWS Rekognition)
    // For hackathon/demo, return a mock response
    return res.json({
      quality: 'ok',
      message: 'Image looks good!',
    });
  } catch (err) {
    console.error('Check quality error:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors });
    }
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export { router as mediaRoutes };
