/**
 * Text-to-Speech Service using ElevenLabs API
 *
 * ElevenLabs Pricing (Creator tier):
 * - ~$0.30 per 1,000 characters
 * - Voices: Various premium voices available
 * - Models: eleven_multilingual_v2 (best quality), eleven_turbo_v2 (faster)
 */

// Default voice IDs from ElevenLabs
export const ELEVENLABS_VOICES = {
  rachel: {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    description: 'Calm, warm female voice',
  },
  domi: {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    description: 'Strong, confident female voice',
  },
  bella: {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    description: 'Soft, friendly female voice',
  },
  antoni: {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    description: 'Well-rounded male voice',
  },
  josh: {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    description: 'Deep, resonant male voice',
  },
  arnold: {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    description: 'Crisp, clear male voice',
  },
  adam: {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    description: 'Deep, authoritative male voice',
  },
  sam: {
    id: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Sam',
    description: 'Raspy, dynamic male voice',
  },
} as const;

export type VoiceId = keyof typeof ELEVENLABS_VOICES;

// Default voice for coaches
export const DEFAULT_VOICE_ID = 'rachel';

// Model options
export const ELEVENLABS_MODELS = {
  multilingual_v2: 'eleven_multilingual_v2', // Best quality
  turbo_v2: 'eleven_turbo_v2', // Faster, lower latency
};

interface TTSOptions {
  voiceId?: string;
  model?: string;
  stability?: number; // 0-1, lower = more expressive
  similarityBoost?: number; // 0-1, higher = closer to original voice
  enableSSML?: boolean; // Enable SSML processing for pauses
}

/**
 * Convert pause markers like [pause 2s] to SSML break tags
 * Also wraps the entire text in speak tags for SSML processing
 */
export function convertPauseMarkersToSSML(text: string): string {
  // Replace [pause Xs] or [pause X.Xs] with SSML break tags
  // Supports formats: [pause 1s], [pause 2.5s], [pause 500ms]
  let ssmlText = text.replace(
    /\[pause\s+(\d+(?:\.\d+)?)(s|ms)?\]/gi,
    (match, duration, unit) => {
      // Default to seconds if no unit specified
      const timeUnit = unit?.toLowerCase() || 's';
      if (timeUnit === 'ms') {
        return `<break time="${duration}ms"/>`;
      }
      return `<break time="${duration}s"/>`;
    }
  );

  // Also support alternative formats: [pause: 2s], (pause 2s), ...pause 2s...
  ssmlText = ssmlText.replace(
    /\[pause:\s*(\d+(?:\.\d+)?)(s|ms)?\]/gi,
    (match, duration, unit) => {
      const timeUnit = unit?.toLowerCase() || 's';
      return `<break time="${duration}${timeUnit}"/>`;
    }
  );

  // Wrap in SSML speak tags
  return `<speak>${ssmlText}</speak>`;
}

/**
 * Check if text contains pause markers that need SSML processing
 */
export function hasPauseMarkers(text: string): boolean {
  return /\[pause[\s:]+\d+(?:\.\d+)?(?:s|ms)?\]/i.test(text);
}

/**
 * Check if ElevenLabs is configured
 */
export function isTTSConfigured(): boolean {
  return !!process.env.ELEVENLABS_API_KEY;
}

/**
 * Synthesize speech from text using ElevenLabs API
 * Returns audio as a Buffer (mp3 format)
 *
 * Automatically detects pause markers like [pause 2s] and converts to SSML
 */
export async function synthesizeSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  const voiceId = options.voiceId || ELEVENLABS_VOICES[DEFAULT_VOICE_ID].id;
  const stability = options.stability ?? 0.5;
  const similarityBoost = options.similarityBoost ?? 0.8;

  // Check if text contains pause markers and needs SSML processing
  const needsSSML = options.enableSSML !== false && hasPauseMarkers(text);

  // Use multilingual_v2 model for SSML as it has better support
  // Otherwise use the specified model or turbo for speed
  const model = needsSSML
    ? ELEVENLABS_MODELS.multilingual_v2
    : (options.model || ELEVENLABS_MODELS.turbo_v2);

  // Convert pause markers to SSML if needed
  const processedText = needsSSML ? convertPauseMarkersToSSML(text) : text;

  console.log(`TTS: SSML=${needsSSML}, model=${model}, text length=${text.length}`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: processedText,
        model_id: model,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ElevenLabs error:', errorText);
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Stream speech synthesis (for lower latency)
 * Returns a readable stream of audio chunks
 *
 * Automatically detects pause markers like [pause 2s] and converts to SSML
 */
export async function synthesizeSpeechStream(
  text: string,
  options: TTSOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  const voiceId = options.voiceId || ELEVENLABS_VOICES[DEFAULT_VOICE_ID].id;
  const stability = options.stability ?? 0.5;
  const similarityBoost = options.similarityBoost ?? 0.8;

  // Check if text contains pause markers and needs SSML processing
  const needsSSML = options.enableSSML !== false && hasPauseMarkers(text);

  // Use multilingual_v2 model for SSML as it has better support
  const model = needsSSML
    ? ELEVENLABS_MODELS.multilingual_v2
    : (options.model || ELEVENLABS_MODELS.turbo_v2);

  // Convert pause markers to SSML if needed
  const processedText = needsSSML ? convertPauseMarkersToSSML(text) : text;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: processedText,
        model_id: model,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ElevenLabs stream error:', errorText);
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('No response body from ElevenLabs');
  }

  return response.body;
}

/**
 * Get available voices from ElevenLabs
 */
export async function getAvailableVoices(): Promise<Array<{
  id: string;
  name: string;
  description?: string;
  category?: string;
}>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    // Return built-in voices if API key not configured
    return Object.values(ELEVENLABS_VOICES).map((v) => ({
      id: v.id,
      name: v.name,
      description: v.description,
    }));
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }

    const data = (await response.json()) as { voices: any[] };
    return data.voices.map((v: any) => ({
      id: v.voice_id,
      name: v.name,
      description: v.labels?.description || v.description,
      category: v.category,
    }));
  } catch (error) {
    console.error('Error fetching voices:', error);
    // Fallback to built-in voices
    return Object.values(ELEVENLABS_VOICES).map((v) => ({
      id: v.id,
      name: v.name,
      description: v.description,
    }));
  }
}

/**
 * Estimate character count for billing purposes
 * Excludes pause markers since they're converted to SSML and not spoken
 */
export function estimateCharacterCount(text: string): number {
  // Remove pause markers before counting
  const cleanText = text.replace(/\[pause[\s:]*\d+(?:\.\d+)?(?:s|ms)?\]/gi, '');
  return cleanText.length;
}

/**
 * Estimate cost in USD (approximate)
 */
export function estimateCost(text: string): number {
  const chars = estimateCharacterCount(text);
  // ~$0.30 per 1,000 characters at Creator tier
  return (chars / 1000) * 0.3;
}
