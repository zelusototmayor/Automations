# Feature: Accountability / Follow-up Notifications

## Overview
Push notifications that check in on user's progress toward stated goals and commitments.

## Current State
- expo-secure-store configured
- No push notification setup
- No background job infrastructure (need to add)

## Prerequisites
- Redis server (for job queue)
- Bull or BullMQ (job scheduler)
- Expo Push Notifications API
- expo-notifications package

---

## User Stories

### US-P01: Expo Notifications Setup
**As a** developer
**I want** to configure expo-notifications in the mobile app
**So that** we can send and receive push notifications

**Acceptance Criteria:**
- [ ] Install `expo-notifications` package
- [ ] Configure app.json with notification permissions
- [ ] Request notification permissions on app start
- [ ] Handle permission denied gracefully
- [ ] Register for push token on permission grant
- [ ] Store push token locally in SecureStore

**Files:**
- Update `/mobile/package.json`
- Update `/mobile/app.json`
- Create `/mobile/src/services/notifications.ts`
- Update `/mobile/app/_layout.tsx`

---

### US-P02: Push Token Storage Backend
**As a** system
**I want** to store user push tokens in the database
**So that** I can send notifications to specific users

**Acceptance Criteria:**
- [ ] Add `pushToken` field to User model
- [ ] Add `pushTokenUpdatedAt` timestamp
- [ ] Create `PATCH /users/me/push-token` endpoint
- [ ] Endpoint validates token format (ExponentPushToken[...])
- [ ] Mobile app sends token after registration

**Prisma Schema Addition:**
```prisma
model User {
  // ... existing fields
  pushToken          String?   @map("push_token")
  pushTokenUpdatedAt DateTime? @map("push_token_updated_at")
}
```

**Files:**
- Update `/backend/prisma/schema.prisma`
- Update `/backend/src/routes/users.ts`

---

### US-P03: Expo Push Service
**As a** backend
**I want** a service to send push notifications via Expo's API
**So that** I can notify users on their devices

**Acceptance Criteria:**
- [ ] Create `/backend/src/services/pushNotification.ts`
- [ ] Function `sendPushNotification(pushToken, title, body, data?)`
- [ ] Function `sendBatchNotifications(notifications[])`
- [ ] Handle Expo push receipts for delivery confirmation
- [ ] Handle invalid tokens (mark as invalid in DB)
- [ ] Retry logic for failed sends
- [ ] Rate limiting awareness

**Expo Push API:**
```typescript
// POST https://exp.host/--/api/v2/push/send
{
  to: "ExponentPushToken[xxx]",
  title: "Check-in from Coach",
  body: "How's your morning routine going?",
  data: { type: "accountability_checkin", agentId: "..." }
}
```

---

### US-P04: Job Queue Setup (Bull + Redis)
**As a** backend
**I want** a job queue for scheduling delayed notifications
**So that** I can send notifications at the right time

**Acceptance Criteria:**
- [ ] Add `bull` and `ioredis` dependencies
- [ ] Create Redis connection configuration
- [ ] Create `/backend/src/jobs/queue.ts` with queue setup
- [ ] Create accountability queue for scheduled notifications
- [ ] Job processor sends notification and updates status
- [ ] Dashboard/monitoring for queue (optional: bull-board)

**Files:**
- Update `/backend/package.json`
- Create `/backend/src/jobs/queue.ts`
- Create `/backend/src/jobs/accountabilityNotification.ts`

---

### US-P05: Commitment Detection in Chat
**As a** system
**I want** to detect when users make commitments during coaching
**So that** I can schedule follow-up notifications

**Acceptance Criteria:**
- [ ] Create commitment detection service
- [ ] Uses LLM to identify commitments from messages
- [ ] Extracts: action, timeline, specific date/time if mentioned
- [ ] Returns structured commitment object
- [ ] Runs after each conversation turn (lightweight)

**Commitment Structure:**
```typescript
interface DetectedCommitment {
  action: string;           // "Exercise for 30 minutes"
  timeline?: string;        // "tomorrow morning", "this week"
  specificTime?: Date;      // If parseable
  confidence: number;       // 0-1
}
```

**Detection Prompt:**
```
Analyze this message for any commitments the user is making.
A commitment is when the user states they WILL do something specific.

Examples:
- "I'll meditate every morning" -> commitment
- "I should probably exercise more" -> NOT a commitment (vague)
- "I'm going to call my mom tomorrow at 5pm" -> commitment with time

Return JSON:
{
  "hasCommitment": boolean,
  "commitment": {
    "action": "string",
    "timeline": "string or null",
    "specificTime": "ISO date string or null",
    "confidence": 0-1
  } or null
}
```

---

### US-P06: Schedule Follow-up Notifications
**As a** system
**I want** to schedule accountability check-ins based on commitments
**So that** users get reminded at the right time

**Acceptance Criteria:**
- [ ] When commitment detected, create ScheduledNotification record
- [ ] Calculate notification time based on timeline
- [ ] Default: 24 hours after commitment if no specific time
- [ ] If specific time mentioned, send 1 hour after
- [ ] Queue job for notification time
- [ ] Notification includes context from commitment

**Prisma Schema:**
```prisma
model ScheduledNotification {
  id              String              @id @default(uuid())
  userId          String              @map("user_id")
  agentId         String?             @map("agent_id")
  conversationId  String?             @map("conversation_id")
  type            NotificationType
  title           String
  body            String
  data            Json?               @default("{}")
  scheduledFor    DateTime            @map("scheduled_for")
  status          NotificationStatus  @default(PENDING)
  sentAt          DateTime?           @map("sent_at")
  createdAt       DateTime            @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([scheduledFor, status])
  @@map("scheduled_notifications")
}

enum NotificationType {
  ACCOUNTABILITY_CHECKIN
  COACH_MESSAGE
  SYSTEM
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}
```

---

### US-P07: Notification Job Processor
**As a** job queue
**I want** to process scheduled notifications at the right time
**So that** users receive timely check-ins

**Acceptance Criteria:**
- [ ] Cron job runs every minute checking for due notifications
- [ ] Fetches notifications where `scheduledFor <= now` and `status = PENDING`
- [ ] Gets user's push token
- [ ] Sends notification via Expo Push API
- [ ] Updates status to SENT or FAILED
- [ ] Handles missing/invalid push tokens gracefully

---

### US-P08: Notification Settings UI
**As a** user
**I want** to control what notifications I receive
**So that** I'm not overwhelmed

**Acceptance Criteria:**
- [ ] Settings screen with notification preferences
- [ ] Toggle: Accountability check-ins (on/off)
- [ ] Toggle: Coach messages (on/off)
- [ ] Quiet hours: Don't send between X and Y time
- [ ] Settings stored in `User.notificationPreferences` JSON

**Files:**
- Create `/mobile/app/settings/notifications.tsx`
- Update `/backend/prisma/schema.prisma` (User.notificationPreferences)

---

### US-P09: Handle Notification Tap
**As a** user
**I want** to tap a notification and go to the relevant chat
**So that** I can respond to check-ins easily

**Acceptance Criteria:**
- [ ] Notification includes `agentId` in data payload
- [ ] Tapping notification opens app
- [ ] If `agentId` present, navigate to that chat
- [ ] If conversation exists, resume it
- [ ] If no conversation, start new one

**Files:**
- Update `/mobile/src/services/notifications.ts`
- Update `/mobile/app/_layout.tsx`

---

### US-P10: Manual Check-in Scheduling
**As a** user chatting with a coach
**I want** to ask for a reminder
**So that** I can be held accountable

**Acceptance Criteria:**
- [ ] User can say "Remind me tomorrow" in chat
- [ ] Coach acknowledges and schedules notification
- [ ] Uses tool/function calling for structured response
- [ ] Or: Add "Set Reminder" button in chat UI
- [ ] Shows confirmation when reminder is set

---

## Task Breakdown (Ralph-ready)

### Infrastructure Tasks

| Task ID | Description | Depends On | Est. Time |
|---------|-------------|------------|-----------|
| P01 | Install expo-notifications | - | 15 min |
| P02 | Configure app.json permissions | P01 | 15 min |
| P03 | Create notifications service (mobile) | P01 | 45 min |
| P04 | Implement permission request flow | P03 | 30 min |
| P05 | Implement push token registration | P03 | 30 min |
| P06 | Add pushToken to User schema | - | 15 min |
| P07 | Create push token API endpoint | P06 | 30 min |
| P08 | Send push token from mobile on register | P05, P07 | 20 min |
| P09 | Add bull and ioredis dependencies | - | 15 min |
| P10 | Create Redis connection config | P09 | 20 min |
| P11 | Create job queue setup | P10 | 30 min |
| P12 | Create Expo push service | - | 1 hr |
| P13 | Implement send notification function | P12 | 30 min |
| P14 | Implement batch notifications | P12 | 30 min |
| P15 | Handle push receipts | P12 | 45 min |

### Feature Tasks

| Task ID | Description | Depends On | Est. Time |
|---------|-------------|------------|-----------|
| P16 | Create ScheduledNotification schema | P06 | 20 min |
| P17 | Create commitment detection service | - | 1.5 hr |
| P18 | Integrate commitment detection into chat | P17 | 45 min |
| P19 | Create notification scheduling logic | P16, P18 | 1 hr |
| P20 | Create notification processor job | P11, P13, P16 | 1 hr |
| P21 | Create cron trigger for processor | P20 | 30 min |
| P22 | Add notificationPreferences to User | - | 20 min |
| P23 | Create notification settings screen | P22 | 1.5 hr |
| P24 | Implement quiet hours logic | P22, P20 | 30 min |
| P25 | Handle notification tap navigation | P03 | 45 min |
| P26 | End-to-end test notification flow | All | 1 hr |

## Files to Create/Modify

**Create:**
- `/mobile/src/services/notifications.ts`
- `/mobile/app/settings/notifications.tsx`
- `/backend/src/services/pushNotification.ts`
- `/backend/src/services/commitmentDetector.ts`
- `/backend/src/jobs/queue.ts`
- `/backend/src/jobs/accountabilityNotification.ts`

**Modify:**
- `/mobile/package.json`
- `/mobile/app.json`
- `/mobile/app/_layout.tsx`
- `/backend/package.json`
- `/backend/prisma/schema.prisma`
- `/backend/src/routes/users.ts`
- `/backend/src/routes/chat.ts`

## Environment Variables Needed

```env
# Redis (for job queue)
REDIS_URL=redis://localhost:6379

# No Expo API key needed - uses project's push token
```

## Docker Compose Addition

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```
