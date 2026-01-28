# Feature: Voice Mode (TTS + STT)

## Overview
Users can listen to coach responses (Text-to-Speech) and optionally speak their messages (Speech-to-Text).

## Current State
- `expo-av` already in dependencies (audio playback ready)
- No TTS integration
- No STT setup

---

# Part A: Text-to-Speech (Coach Speaks to User)

## Provider: ElevenLabs

**Pricing (per million characters):**
| Plan | Characters/month | Overage |
|------|------------------|---------|
| Free | 10,000 | N/A |
| Starter ($5/mo) | 30,000 | $0.30/1k chars |
| Creator ($22/mo) | 100,000 | $0.30/1k chars |
| Pro ($99/mo) | 500,000 | $0.24/1k chars |

**Cost Estimate:** Average coaching response ~500 chars → ~$0.15/response at Creator tier overages

---

## User Stories

### US-V01: ElevenLabs Integration Setup
**As a** backend
**I want** to integrate with ElevenLabs API
**So that** I can convert text to speech

**Acceptance Criteria:**
- [ ] Add `elevenlabs` SDK or use REST API directly
- [ ] Create `/backend/src/services/tts.ts`
- [ ] Function `synthesizeSpeech(text, voiceId): Buffer`
- [ ] Function `getAvailableVoices(): Voice[]`
- [ ] Handle API errors gracefully
- [ ] Respect rate limits

**ElevenLabs API:**
```typescript
// POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
// Headers: xi-api-key: {API_KEY}
// Body: { text: "Hello", model_id: "eleven_monolingual_v1" }
// Response: audio/mpeg stream
```

---

### US-V02: TTS Backend Endpoint
**As a** mobile app
**I want** an API endpoint to get audio for a message
**So that** I can play coach responses as speech

**Acceptance Criteria:**
- [ ] `POST /tts` endpoint
- [ ] Input: `{ text: string, voiceId?: string }`
- [ ] Output: Audio file (mp3) as stream or base64
- [ ] Caches common phrases to reduce API calls
- [ ] Validates text length (max 5000 chars)
- [ ] Returns voice metadata in headers

**Files:**
- Create `/backend/src/routes/tts.ts`
- Register in `/backend/src/index.ts`

---

### US-V03: Voice Selection per Coach
**As a** coach creator
**I want** to select a voice for my coach
**So that** my coach has a distinctive audio identity

**Acceptance Criteria:**
- [ ] Add `voiceId` to Agent.personalityConfig
- [ ] Creator wizard shows voice selection (last step)
- [ ] Play sample of each voice
- [ ] Default voice if not selected
- [ ] Store ElevenLabs voice ID

**Voice Options (ElevenLabs defaults):**
- Rachel (female, American)
- Drew (male, American)
- Clyde (male, American, deep)
- Bella (female, American, soft)
- Custom voices if user has ElevenLabs account (future)

---

### US-V04: Audio Playback in Chat
**As a** user
**I want** to listen to coach responses
**So that** I can consume coaching while doing other things

**Acceptance Criteria:**
- [ ] Play button appears next to each assistant message
- [ ] Tapping play fetches audio from TTS endpoint
- [ ] Shows loading indicator while fetching
- [ ] Audio plays through device speaker
- [ ] Pause/resume functionality
- [ ] Audio progress indicator
- [ ] Stops when message scrolled off screen (optional)

**Components:**
- `/mobile/src/components/AudioPlayer.tsx`
- `/mobile/src/components/MessageBubble.tsx` (add play button)

---

### US-V05: Auto-Play Mode
**As a** user
**I want** to enable auto-play for coach responses
**So that** I can have a hands-free experience

**Acceptance Criteria:**
- [ ] Toggle in chat settings: "Auto-play responses"
- [ ] When enabled, new assistant messages auto-play audio
- [ ] Respect device mute switch
- [ ] Don't auto-play while another audio is playing
- [ ] Store preference in local storage

---

### US-V06: TTS Caching Strategy
**As a** system
**I want** to cache generated audio
**So that** we reduce API costs and latency

**Acceptance Criteria:**
- [ ] Cache key: hash of (text + voiceId)
- [ ] Store in Redis or file system
- [ ] Cache TTL: 7 days
- [ ] Max cache size: 1GB
- [ ] Clear old entries when limit reached
- [ ] Track cache hit rate

---

### US-V07: Premium-Only TTS
**As a** business
**I want** TTS to be a premium feature
**So that** we can monetize the feature

**Acceptance Criteria:**
- [ ] TTS endpoint checks subscription status
- [ ] Free users get X free TTS plays per month (e.g., 10)
- [ ] Premium users get unlimited TTS
- [ ] Show upgrade prompt when free limit reached
- [ ] Track TTS usage per user

---

# Part B: Speech-to-Text (User Speaks to Coach)

## Provider Comparison

| Provider | Latency | Cost | Expo Support |
|----------|---------|------|--------------|
| expo-speech-recognition | Low | Free (on-device) | Native plugin |
| OpenAI Whisper | Medium | $0.006/min | Via backend |
| Deepgram | Low | $0.0043/min | WebSocket |

**Recommendation:** Start with `expo-speech-recognition` (free, on-device), upgrade if quality issues.

---

## User Stories

### US-V08: expo-speech-recognition Setup
**As a** mobile app
**I want** to configure speech recognition
**So that** users can speak their messages

**Acceptance Criteria:**
- [ ] Install `expo-speech-recognition` package
- [ ] Configure app.json with microphone permissions
- [ ] Request microphone permission on first use
- [ ] Handle permission denied gracefully
- [ ] Test on both iOS and Android

**Files:**
- Update `/mobile/package.json`
- Update `/mobile/app.json`
- Create `/mobile/src/services/speechRecognition.ts`

---

### US-V09: Recording UI
**As a** user
**I want** a clear way to speak my message
**So that** I can chat hands-free

**Acceptance Criteria:**
- [ ] Microphone button in chat input area
- [ ] Tap to start recording
- [ ] Visual feedback while recording (pulsing, waveform)
- [ ] Tap again to stop and send
- [ ] Or: Hold to talk, release to send
- [ ] Cancel option (swipe away or X button)
- [ ] Show live transcription as user speaks

**UI Design:**
```
┌─────────────────────────────────────────┐
│  [Type a message...]        [🎤 Mic]   │
└─────────────────────────────────────────┘

When recording:
┌─────────────────────────────────────────┐
│  "I've been thinking about..."  [🔴 ⏹] │
│  ──────●────────────  0:05              │
│        [Cancel]                          │
└─────────────────────────────────────────┘
```

**Files:**
- `/mobile/src/components/VoiceInput.tsx`
- Update `/mobile/app/chat/[agentId].tsx`

---

### US-V10: Transcription Processing
**As a** mobile app
**I want** to convert speech to text
**So that** I can send it as a message

**Acceptance Criteria:**
- [ ] Use expo-speech-recognition for transcription
- [ ] Show interim results as user speaks
- [ ] Final result sent as message
- [ ] Handle no speech detected
- [ ] Handle recognition errors
- [ ] Timeout after 60 seconds of silence

---

### US-V11: Audio Format Handling (Android)
**As a** developer
**I want** to handle audio format differences on Android
**So that** speech recognition works reliably

**Acceptance Criteria:**
- [ ] Handle different audio formats across Android versions
- [ ] Convert audio if needed (FFmpeg or native)
- [ ] Test on Android 10, 11, 12, 13+
- [ ] Fallback to backend transcription if on-device fails

---

### US-V12: Backend Fallback (Whisper)
**As a** system
**I want** a backend fallback for transcription
**So that** we can handle devices where on-device fails

**Acceptance Criteria:**
- [ ] Create `/backend/src/routes/stt.ts`
- [ ] `POST /stt` accepts audio file upload
- [ ] Uses OpenAI Whisper API for transcription
- [ ] Returns transcribed text
- [ ] Handle audio format conversion if needed

**Only needed if on-device recognition has quality issues.**

---

## Task Breakdown (Ralph-ready)

### TTS Tasks

| Task ID | Description | Depends On | Est. Time |
|---------|-------------|------------|-----------|
| V01 | Create ElevenLabs service | - | 1 hr |
| V02 | Implement synthesizeSpeech function | V01 | 30 min |
| V03 | Create /tts endpoint | V02 | 45 min |
| V04 | Add voiceId to Agent schema | - | 15 min |
| V05 | Create voice selection UI (creator) | V04 | 1.5 hr |
| V06 | Create AudioPlayer component | - | 1.5 hr |
| V07 | Add play button to MessageBubble | V06 | 30 min |
| V08 | Implement audio playback with expo-av | V06 | 45 min |
| V09 | Add pause/resume controls | V08 | 30 min |
| V10 | Implement auto-play toggle | V08 | 30 min |
| V11 | Create TTS caching service | V02 | 1 hr |
| V12 | Add premium check to TTS endpoint | V03 | 30 min |
| V13 | Track TTS usage per user | V12 | 30 min |

### STT Tasks

| Task ID | Description | Depends On | Est. Time |
|---------|-------------|------------|-----------|
| V14 | Install expo-speech-recognition | - | 15 min |
| V15 | Configure microphone permissions | V14 | 15 min |
| V16 | Create speechRecognition service | V14 | 45 min |
| V17 | Request microphone permission flow | V15 | 30 min |
| V18 | Create VoiceInput component | V16 | 1.5 hr |
| V19 | Add recording visualization | V18 | 45 min |
| V20 | Show live transcription | V18 | 30 min |
| V21 | Integrate VoiceInput into chat | V18 | 30 min |
| V22 | Handle Android audio quirks | V16 | 1 hr |
| V23 | Create /stt backend endpoint (fallback) | - | 1 hr |
| V24 | Implement Whisper transcription | V23 | 45 min |
| V25 | End-to-end voice chat test | All | 1 hr |

## Files to Create/Modify

**Create:**
- `/backend/src/services/tts.ts`
- `/backend/src/routes/tts.ts`
- `/backend/src/routes/stt.ts` (if needed)
- `/mobile/src/services/speechRecognition.ts`
- `/mobile/src/components/AudioPlayer.tsx`
- `/mobile/src/components/VoiceInput.tsx`

**Modify:**
- `/backend/package.json`
- `/backend/src/index.ts`
- `/backend/prisma/schema.prisma` (Agent.personalityConfig, User TTS usage)
- `/mobile/package.json`
- `/mobile/app.json`
- `/mobile/app/chat/[agentId].tsx`
- `/mobile/src/components/MessageBubble.tsx`
- `/mobile/app/creator/[id].tsx` (voice selection step)

## Environment Variables Needed

```env
# ElevenLabs
ELEVENLABS_API_KEY=xi_xxxxxxxx

# OpenAI (for Whisper fallback)
OPENAI_API_KEY=sk-xxxxxxxx  # Already exists
```

## Recommended Sequence

1. **TTS First** (more value, simpler)
   - V01-V03: Backend integration
   - V06-V09: Mobile playback
   - V04-V05: Voice selection

2. **STT Second** (more complex, nice-to-have)
   - V14-V17: Setup
   - V18-V21: UI
   - V22-V24: Polish/fallback
