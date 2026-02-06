import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { prisma } from '../services/database';
import {
  synthesizeSpeech,
  isTTSConfigured,
  getAvailableVoices,
  estimateCost,
  ELEVENLABS_VOICES,
} from '../services/tts';
import { hasCoachAccess, isCreatorUser } from '../services/subscription';

const router = Router();

// Simple in-memory cache for TTS responses (production would use Redis)
const ttsCache = new Map<string, { audio: Buffer; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCacheKey(text: string, voiceId: string): string {
  return `${voiceId}:${text.substring(0, 100)}:${text.length}`;
}

function getCachedAudio(key: string): Buffer | null {
  const cached = ttsCache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    ttsCache.delete(key);
    return null;
  }

  return cached.audio;
}

function setCachedAudio(key: string, audio: Buffer): void {
  // Limit cache size
  if (ttsCache.size > 100) {
    // Remove oldest entries
    const entries = Array.from(ttsCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    for (let i = 0; i < 20; i++) {
      ttsCache.delete(entries[i][0]);
    }
  }

  ttsCache.set(key, { audio, timestamp: Date.now() });
}

/**
 * GET /tts/voices - Get available TTS voices
 */
router.get('/voices', async (req: Request, res: Response) => {
  try {
    if (!isTTSConfigured()) {
      // Return built-in voices even without API key (for UI purposes)
      res.json({
        voices: Object.entries(ELEVENLABS_VOICES).map(([key, v]) => ({
          id: v.id,
          key,
          name: v.name,
          description: v.description,
        })),
        configured: false,
      });
      return;
    }

    const voices = await getAvailableVoices();
    res.json({ voices, configured: true });
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

/**
 * POST /tts/synthesize - Synthesize speech from text
 */
router.post('/synthesize', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { text, voiceId, agentId } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Missing text' });
      return;
    }

    if (!isTTSConfigured()) {
      res.status(503).json({ error: 'TTS service not configured' });
      return;
    }

    // TTS is available only to creators or users who purchased this coach
    let hasAccess = false;
    if (agentId) {
      hasAccess = await hasCoachAccess(userId, agentId);
    } else {
      hasAccess = await isCreatorUser(userId);
    }
    if (!hasAccess) {
      res.status(403).json({
        error: agentId
          ? 'TTS requires lifetime access to this coach'
          : 'TTS preview requires creator access',
        code: 'COACH_ACCESS_REQUIRED',
      });
      return;
    }

    // Get voice ID from agent if not provided
    let resolvedVoiceId = voiceId;
    if (!resolvedVoiceId && agentId) {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        select: { voiceId: true },
      });

      resolvedVoiceId = agent?.voiceId || ELEVENLABS_VOICES.rachel.id;
    }

    // Default to Rachel voice
    resolvedVoiceId = resolvedVoiceId || ELEVENLABS_VOICES.rachel.id;

    // Check cache
    const cacheKey = getCacheKey(text, resolvedVoiceId);
    const cachedAudio = getCachedAudio(cacheKey);

    if (cachedAudio) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('X-Cache', 'HIT');
      res.send(cachedAudio);
      return;
    }

    // Limit text length (prevent abuse)
    if (text.length > 5000) {
      res.status(400).json({ error: 'Text too long (max 5000 characters)' });
      return;
    }

    // Synthesize speech
    const audio = await synthesizeSpeech(text, { voiceId: resolvedVoiceId });

    // Cache the result
    setCachedAudio(cacheKey, audio);

    // Log cost for monitoring
    console.log(`TTS: ${text.length} chars, est. cost: $${estimateCost(text).toFixed(4)}`);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Cache', 'MISS');
    res.send(audio);
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    res.status(500).json({ error: 'Failed to synthesize speech' });
  }
});

/**
 * GET /tts/status - Check TTS service status
 */
router.get('/status', async (req: Request, res: Response) => {
  res.json({
    configured: isTTSConfigured(),
    cacheSize: ttsCache.size,
  });
});

export default router;
