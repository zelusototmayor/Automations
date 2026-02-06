/**
 * Speech-to-Text API Routes
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { transcribeAudio, isSTTConfigured } from '../services/stt';
import { hasCoachAccess } from '../services/subscription';
import multer from 'multer';

const router = Router();

// Configure multer for audio file uploads (max 25MB - Whisper limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
  fileFilter: (req, file, cb) => {
    // Accept common audio formats (including iOS CAF and 3GP for Android)
    const allowedMimes = [
      'audio/webm',
      'audio/wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/mp4',
      'audio/m4a',
      'audio/x-m4a',
      'audio/ogg',
      'audio/flac',
      'audio/x-caf', // iOS CAF format
      'audio/caf',
      'audio/3gpp', // Android 3GP format
      'audio/3gp',
      'audio/aac',
      'audio/x-aac',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Log the rejected format for debugging
      console.log('Rejected audio format:', file.mimetype, 'filename:', file.originalname);
      cb(new Error(`Unsupported audio format: ${file.mimetype}`));
    }
  },
});

/**
 * GET /stt/status - Check if STT is configured
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    configured: isSTTConfigured(),
    maxFileSizeMB: 25,
    supportedFormats: ['webm', 'wav', 'mp3', 'mp4', 'm4a', 'ogg', 'flac', 'caf', '3gp', 'aac'],
  });
});

/**
 * POST /stt/transcribe - Transcribe audio to text
 */
router.post(
  '/transcribe',
  authenticate,
  upload.single('audio'),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;

      const { agent_id } = req.body;

      if (!agent_id) {
        res.status(400).json({ error: 'Missing agent_id' });
        return;
      }

      // STT is available only to creators or users who purchased this coach
      const hasAccess = await hasCoachAccess(userId, agent_id);
      if (!hasAccess) {
        res.status(403).json({
          error: 'Voice input requires lifetime access to this coach',
          code: 'COACH_ACCESS_REQUIRED',
        });
        return;
      }

      if (!isSTTConfigured()) {
        res.status(503).json({ error: 'Speech-to-text service not configured' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No audio file provided' });
        return;
      }

      const { language } = req.body;

      const result = await transcribeAudio(req.file.buffer, {
        language: language as string | undefined,
        filename: req.file.originalname || 'audio.webm',
      });

      res.json({
        text: result.text,
        language: result.language,
        duration: result.duration,
      });
    } catch (error: any) {
      console.error('Error transcribing audio:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      if (error.message?.includes('Unsupported audio format')) {
        res.status(400).json({ error: error.message });
        return;
      }

      // Return more specific error message
      res.status(500).json({
        error: error.message || 'Failed to transcribe audio',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

export default router;
