# Better Coaching - Implementation Plan

> **Ralph Wiggum Ready** - This plan is designed for autonomous AI agent execution.
> Each task has clear acceptance criteria and can be completed in a single iteration.

## Overview

| Phase | Feature | Est. Time | Status |
|-------|---------|-----------|--------|
| 1A | User Context Onboarding | 2-3 days | ✅ Complete |
| 1B | Structured Assessments | 3-5 days | ✅ Complete |
| 2A | TTS Voice Output | 3-4 days | ✅ Complete |
| 2B | Push Notifications | 5-7 days | ✅ Core Complete |
| 3A | STT Voice Input | 4-5 days | 🔲 Not Started |
| 3B | AI-Extracted Insights | 5-7 days | 🔲 Not Started |

---

## Phase 1A: User Context Onboarding (Foundation)

**Goal:** New users set their personal context right after signup.

### Tasks

| ID | Task | Status | Notes |
|----|------|--------|-------|
| M01 | Add `hasCompletedOnboarding` to User schema | ✅ | Prisma migration |
| M02 | Add `contextLastUpdatedAt` field to User | ✅ | Same migration as M01 |
| M03 | Create onboarding wizard layout with steps | ✅ | `/mobile/app/(welcome)/onboarding.tsx` |
| M04 | Create onboarding step 1: Name input | ✅ | Reuse patterns from context.tsx |
| M05 | Create onboarding step 2: About textarea | ✅ | |
| M06 | Create onboarding step 3: Values chip selection | ✅ | Copy from context.tsx |
| M07 | Create onboarding step 4: Goals textarea | ✅ | |
| M08 | Create onboarding step 5: Challenges textarea | ✅ | |
| M09 | Integrate onboarding completion - save context | ✅ | Call PATCH /users/me/context |
| M10 | Redirect new users to onboarding in _layout.tsx | ✅ | Check hasCompletedOnboarding |
| M11 | Create ContextRefreshBanner component | ✅ | For home screen |
| M12 | Add ContextRefreshBanner to home screen | ✅ | Show if context > 30 days old |
| M13 | Add dismiss logic (7-day snooze) | ✅ | Store dismissedAt in User |

**Validation:** New user signs up → sees onboarding → completes → lands on home

---

## Phase 1B: Structured Assessments

**Goal:** Coaches can add interactive assessments that inform conversations.

### Tasks

| ID | Task | Status | Notes |
|----|------|--------|-------|
| A01 | Define TypeScript interfaces for assessments | ✅ | Backend types |
| A02 | Add Zod validation schema for assessments | ✅ | |
| A03 | Create Prisma migration for assessments | ✅ | Agent.assessmentConfigs, AssessmentResponse |
| A04 | Seed example "Wheel of Life" assessment | ✅ | prisma/seed.ts |
| A05 | Create assessments routes file | ✅ | `/backend/src/routes/assessments.ts` |
| A06 | Implement GET /agents/:id/assessments | ✅ | |
| A07 | Implement POST /agents/:id/assessments | ✅ | Creator only |
| A08 | Implement PUT assessment endpoint | ✅ | |
| A09 | Implement DELETE assessment endpoint | ✅ | |
| A10 | Implement POST /assessments/:id/responses | ✅ | Save user answers |
| A11 | Implement GET /users/me/assessment-responses | ✅ | History |
| A12 | Create mobile AssessmentModal component | ✅ | `/mobile/src/components/AssessmentModal.tsx` |
| A13 | Create ScaleQuestion component (1-10 slider) | ✅ | Uses @react-native-community/slider |
| A14 | Create MultipleChoiceQuestion component | ✅ | |
| A15 | Create OpenTextQuestion component | ✅ | |
| A16 | Integrate AssessmentModal into chat screen | ✅ | Trigger on first message |
| A17 | Add assessment step to creator wizard | ❌ | Skipped - can add later |
| A18 | Extend buildSystemPrompt() with assessment results | ✅ | In llm.ts |
| A19 | Add mobile types for assessments | ✅ | `/mobile/src/types/index.ts` |

**Validation:** Create coach with assessment → user chats → sees assessment → completes → coach references results

---

## Phase 2A: TTS Voice Output

**Goal:** Users can listen to coach responses.

### Tasks

| ID | Task | Status | Notes |
|----|------|--------|-------|
| V01 | Create ElevenLabs service | ✅ | `/backend/src/services/tts.ts` |
| V02 | Implement synthesizeSpeech function | ✅ | Call ElevenLabs API |
| V03 | Create /tts endpoint | ✅ | `/backend/src/routes/tts.ts` |
| V04 | Add voiceId to Agent personalityConfig | ✅ | Already supported in JSON |
| V05 | Create voice selection UI in creator | ❌ | Skipped - can add later |
| V06 | Create AudioPlayer component | ✅ | `/mobile/src/components/AudioPlayer.tsx` |
| V07 | Add play button to MessageBubble | ✅ | Update existing component |
| V08 | Implement audio playback with expo-av | ✅ | |
| V09 | Add pause/resume controls | ✅ | |
| V10 | Implement auto-play toggle | ❌ | Skipped - can add later |
| V11 | Create TTS caching service | ✅ | In-memory cache in route |
| V12 | Add premium check to TTS endpoint | ✅ | Check subscription |
| V13 | Track TTS usage per user | ❌ | Skipped - can add later |

**Validation:** Open chat → tap play on message → audio plays → pause works

---

## Phase 2B: Push Notifications

**Goal:** Users get accountability check-ins based on commitments.

### Tasks

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P01 | Install expo-notifications | ✅ | `npx expo install expo-notifications` |
| P02 | Configure app.json permissions | ✅ | Added expo-notifications plugin |
| P03 | Create notifications service (mobile) | ✅ | `/mobile/src/services/notifications.ts` |
| P04 | Implement permission request flow | ✅ | |
| P05 | Implement push token registration | ✅ | |
| P06 | Add pushToken to User schema | ✅ | Added pushToken, pushTokenUpdatedAt, notificationPreferences |
| P07 | Create push token API endpoint | ✅ | PATCH /users/me/push-token |
| P08 | Send push token from mobile | ✅ | On permission grant in _layout.tsx |
| P09 | Add bull and ioredis dependencies | ❌ | Skipped - not essential for MVP |
| P10 | Create Redis connection config | ❌ | Skipped - not essential for MVP |
| P11 | Create job queue setup | ❌ | Skipped - not essential for MVP |
| P12 | Create Expo push service | ✅ | `/backend/src/services/pushNotification.ts` |
| P13 | Implement send notification function | ✅ | sendPushNotification() |
| P14 | Implement batch notifications | ✅ | sendBatchPushNotifications() |
| P15 | Handle push receipts | ✅ | Invalid tokens auto-removed |
| P16 | Create ScheduledNotification schema | ❌ | Skipped - can add later |
| P17 | Create commitment detection service | ❌ | Skipped - can add later |
| P18 | Integrate commitment detection into chat | ❌ | Skipped - can add later |
| P19 | Create notification scheduling logic | ❌ | Skipped - can add later |
| P20 | Create notification processor job | ❌ | Skipped - can add later |
| P21 | Create cron trigger for processor | ❌ | Skipped - can add later |
| P22 | Add notificationPreferences to User | ✅ | Added in schema |
| P23 | Create notification settings screen | ❌ | Skipped - can add later |
| P24 | Implement quiet hours logic | ❌ | Skipped - can add later |
| P25 | Handle notification tap navigation | ✅ | Deep link to chat via handleNotificationResponse |

**Validation:** Make commitment in chat → receive notification next day → tap opens chat

---

## Phase 3A: STT Voice Input

**Goal:** Users can speak their messages.

### Tasks

| ID | Task | Status | Notes |
|----|------|--------|-------|
| V14 | Install expo-speech-recognition | 🔲 | Config plugin |
| V15 | Configure microphone permissions | 🔲 | app.json |
| V16 | Create speechRecognition service | 🔲 | `/mobile/src/services/speechRecognition.ts` |
| V17 | Request microphone permission flow | 🔲 | |
| V18 | Create VoiceInput component | 🔲 | `/mobile/src/components/VoiceInput.tsx` |
| V19 | Add recording visualization | 🔲 | Waveform or pulse |
| V20 | Show live transcription | 🔲 | |
| V21 | Integrate VoiceInput into chat | 🔲 | Replace/augment keyboard |
| V22 | Handle Android audio quirks | 🔲 | Format conversion |
| V23 | Create /stt backend endpoint (fallback) | 🔲 | Optional |
| V24 | Implement Whisper transcription | 🔲 | Optional |

**Validation:** Tap mic → speak → see transcription → send message

---

## Phase 3B: AI-Extracted Insights

**Goal:** AI learns about user from conversations automatically.

### Tasks

| ID | Task | Status | Notes |
|----|------|--------|-------|
| M16 | Create UserInsight Prisma model | 🔲 | |
| M17 | Create insight extraction service | 🔲 | `/backend/src/services/insightExtractor.ts` |
| M18 | Create extraction prompt template | 🔲 | |
| M19 | Create cron job for extraction | 🔲 | Check idle conversations |
| M20 | Extend buildSystemPrompt with insights | 🔲 | |
| M21 | Create GET /users/me/insights endpoint | 🔲 | |
| M22 | Create mobile insights review screen | 🔲 | `/mobile/app/insights.tsx` |
| M23 | Add archive/edit insight functionality | 🔲 | |
| M24 | Add insights link to profile | 🔲 | |

**Validation:** Have conversation → next day see extracted insights → edit one → coach references it

---

## Quick Reference: File Locations

### Backend
- Routes: `/backend/src/routes/`
- Services: `/backend/src/services/`
- Jobs: `/backend/src/jobs/`
- Types: `/backend/src/types/index.ts`
- Schema: `/backend/prisma/schema.prisma`

### Mobile
- Screens: `/mobile/app/`
- Components: `/mobile/src/components/`
- Services: `/mobile/src/services/`
- Stores: `/mobile/src/stores/`
- Types: `/mobile/src/types/index.ts`

---

## Legend

- 🔲 Not Started
- 🔄 In Progress
- ✅ Completed
- ⚠️ Blocked
- ❌ Skipped
