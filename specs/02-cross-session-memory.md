# Feature: Cross-Session Memory / Better User Context

## Overview
AI remembers past insights, breakthroughs, and commitments across conversations. Users set context during onboarding, and optionally the AI extracts insights from conversations.

## Current State
- `User.context` JSON field exists with: name, about, values, goals, challenges
- `PATCH /users/me/context` endpoint exists
- `buildSystemPrompt()` already injects this context
- Manual edit screen exists at `/mobile/app/context.tsx`

## Gap
Context is static (manually set), not dynamically updated from conversations.

---

## Option A: Enhanced Manual Context (Recommended First)

### US-M01: Post-Signup Onboarding Flow
**As a** new user
**I want** to set my personal context right after signing up
**So that** my coaches know me from the first conversation

**Acceptance Criteria:**
- [ ] After successful signup, redirect to onboarding flow (not directly to home)
- [ ] Onboarding is a multi-step wizard (not one long form)
- [ ] Step 1: "What should we call you?" (name)
- [ ] Step 2: "Tell us about yourself" (about - short bio)
- [ ] Step 3: "What matters most to you?" (values - chip selection)
- [ ] Step 4: "What are you working towards?" (goals)
- [ ] Step 5: "What's holding you back?" (challenges)
- [ ] Can skip each step
- [ ] Progress indicator
- [ ] "Finish" saves context and goes to home
- [ ] New users flagged as `hasCompletedOnboarding: false` until finished

**Files:**
- `/mobile/app/(welcome)/onboarding.tsx` (new multi-step wizard)
- Update `/mobile/app/_layout.tsx` to redirect new users

---

### US-M02: Periodic Context Refresh Prompts
**As a** returning user
**I want** to be reminded to update my context periodically
**So that** my coaches have current information

**Acceptance Criteria:**
- [ ] If context hasn't been updated in 30+ days, show a gentle nudge
- [ ] Nudge appears as a banner on home screen (dismissible)
- [ ] "Have your goals changed?" with link to context screen
- [ ] User can dismiss for 7 days
- [ ] Track `User.contextLastUpdatedAt` and `User.contextNudgeDismissedAt`

**Prisma Schema Addition:**
```prisma
model User {
  // ... existing fields
  contextLastUpdatedAt    DateTime? @map("context_last_updated_at")
  contextNudgeDismissedAt DateTime? @map("context_nudge_dismissed_at")
  hasCompletedOnboarding  Boolean   @default(false) @map("has_completed_onboarding")
}
```

**Files:**
- Update `/mobile/app/(tabs)/index.tsx` (home screen)
- `/mobile/src/components/ContextRefreshBanner.tsx`

---

### US-M03: Context Quick-Edit from Chat
**As a** user in a chat
**I want** to quickly update relevant context
**So that** I don't have to leave the conversation

**Acceptance Criteria:**
- [ ] Menu option in chat header: "Update My Context"
- [ ] Opens context.tsx as a modal/sheet (not full navigation)
- [ ] Can edit and save without losing chat position
- [ ] After save, next message uses updated context

**Files:**
- Update `/mobile/app/chat/[agentId].tsx`

---

## Option B: AI-Extracted Insights (Advanced)

### US-M04: UserInsight Database Model
**As a** developer
**I want** to store AI-extracted insights from conversations
**So that** we can build a rich picture of the user over time

**Acceptance Criteria:**
- [ ] New `UserInsight` model in Prisma
- [ ] Fields: id, userId, agentId, conversationId, category, content, confidence, extractedAt
- [ ] Categories: `goal_update`, `breakthrough`, `commitment`, `challenge`, `value_expressed`
- [ ] Soft delete with `archivedAt` field

**Prisma Schema:**
```prisma
model UserInsight {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  agentId         String?   @map("agent_id")
  conversationId  String?   @map("conversation_id")
  category        InsightCategory
  content         String
  confidence      Float     @default(0.8)  // 0-1 AI confidence score
  extractedAt     DateTime  @default(now()) @map("extracted_at")
  archivedAt      DateTime? @map("archived_at")

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  agent        Agent?        @relation(fields: [agentId], references: [id], onDelete: SetNull)
  conversation Conversation? @relation(fields: [conversationId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([userId, category])
  @@map("user_insights")
}

enum InsightCategory {
  GOAL_UPDATE
  BREAKTHROUGH
  COMMITMENT
  CHALLENGE
  VALUE_EXPRESSED
}
```

---

### US-M05: Insight Extraction Service
**As a** system
**I want** to extract insights after conversations end
**So that** the user's profile becomes richer over time

**Acceptance Criteria:**
- [ ] New service: `/backend/src/services/insightExtractor.ts`
- [ ] Takes conversation messages as input
- [ ] Uses LLM to extract structured insights
- [ ] Returns array of `{ category, content, confidence }`
- [ ] Uses Haiku (cheap/fast model) for extraction
- [ ] Extraction prompt focuses on: goals mentioned, breakthroughs, commitments made

**Extraction Prompt Template:**
```
Analyze this coaching conversation and extract key insights about the user.

Return JSON array of insights:
[
  {
    "category": "goal_update" | "breakthrough" | "commitment" | "challenge" | "value_expressed",
    "content": "Brief description of the insight",
    "confidence": 0.0-1.0
  }
]

Only include high-confidence insights. Be specific but concise.
Do not hallucinate - only extract what's clearly stated.

Conversation:
{messages}
```

---

### US-M06: Trigger Extraction After Conversation
**As a** system
**I want** to automatically extract insights when a conversation becomes inactive
**So that** insights are captured without manual intervention

**Acceptance Criteria:**
- [ ] Trigger extraction when conversation has been idle for 30+ minutes
- [ ] Or trigger when user explicitly ends conversation
- [ ] Run extraction in background (don't block user)
- [ ] Store extracted insights in `UserInsight` table
- [ ] Don't re-extract for same conversation

**Implementation Options:**
1. **Simple**: Cron job that checks for conversations needing extraction
2. **Better**: Queue job scheduled 30 min after last message
3. **Best**: Real-time with debouncing (requires job queue)

For MVP, use option 1 with a cron job.

**Files:**
- `/backend/src/services/insightExtractor.ts`
- `/backend/src/jobs/extractInsights.ts` (cron job)

---

### US-M07: Inject Insights into Prompts
**As a** coach AI
**I want** to see the user's extracted insights
**So that** I can reference past breakthroughs and commitments

**Acceptance Criteria:**
- [ ] `buildSystemPrompt()` fetches recent insights (last 90 days)
- [ ] Groups insights by category
- [ ] Prioritizes high-confidence insights
- [ ] Limits to top 10 insights to avoid token bloat
- [ ] Format is clear and actionable

**Prompt Format Example:**
```
## What I Know About You (from past conversations)

### Recent Breakthroughs
- Realized work-life balance issue stems from fear of disappointing others (Jan 15)
- Identified morning routine as key leverage point (Jan 10)

### Active Commitments
- Exercise 3x/week (committed Jan 12)
- Daily 10-minute meditation (committed Jan 8)

### Current Challenges
- Struggling to maintain boundaries with family (ongoing)
```

---

### US-M08: User Can Review/Edit Insights
**As a** user
**I want** to see what the AI has learned about me
**So that** I can correct inaccuracies and feel in control

**Acceptance Criteria:**
- [ ] New screen: `/mobile/app/insights.tsx`
- [ ] Lists all insights grouped by category
- [ ] Can archive (soft delete) incorrect insights
- [ ] Can edit insight content
- [ ] Shows which conversation the insight came from
- [ ] Link to this screen from profile/settings

---

## Task Breakdown (Ralph-ready)

### Option A Tasks (Do First)

| Task ID | Description | Depends On | Est. Time |
|---------|-------------|------------|-----------|
| M01 | Add hasCompletedOnboarding to User schema | - | 15 min |
| M02 | Add contextLastUpdatedAt field | - | 15 min |
| M03 | Create onboarding wizard layout | M01 | 45 min |
| M04 | Create onboarding step 1: Name | M03 | 30 min |
| M05 | Create onboarding step 2: About | M03 | 30 min |
| M06 | Create onboarding step 3: Values | M03 | 45 min |
| M07 | Create onboarding step 4: Goals | M03 | 30 min |
| M08 | Create onboarding step 5: Challenges | M03 | 30 min |
| M09 | Integrate onboarding completion flow | M04-M08 | 30 min |
| M10 | Redirect new users to onboarding | M09 | 30 min |
| M11 | Create ContextRefreshBanner component | M02 | 45 min |
| M12 | Add banner to home screen | M11 | 20 min |
| M13 | Add dismiss logic (7-day snooze) | M12 | 20 min |
| M14 | Add "Update Context" to chat menu | - | 30 min |
| M15 | Open context as modal from chat | M14 | 45 min |

### Option B Tasks (Advanced - Phase 2)

| Task ID | Description | Depends On | Est. Time |
|---------|-------------|------------|-----------|
| M16 | Create UserInsight Prisma model | - | 30 min |
| M17 | Create insight extraction service | M16 | 1.5 hr |
| M18 | Create extraction prompt template | M17 | 30 min |
| M19 | Create cron job for extraction | M17 | 1 hr |
| M20 | Extend buildSystemPrompt with insights | M16 | 1 hr |
| M21 | Create GET /users/me/insights endpoint | M16 | 30 min |
| M22 | Create mobile insights review screen | M21 | 1.5 hr |
| M23 | Add archive/edit insight functionality | M22 | 45 min |
| M24 | Add insights link to profile | M22 | 15 min |

## Files to Create/Modify

**Create (Option A):**
- `/mobile/app/(welcome)/onboarding.tsx`
- `/mobile/src/components/ContextRefreshBanner.tsx`

**Create (Option B):**
- `/backend/src/services/insightExtractor.ts`
- `/backend/src/jobs/extractInsights.ts`
- `/backend/src/routes/insights.ts`
- `/mobile/app/insights.tsx`

**Modify:**
- `/backend/prisma/schema.prisma`
- `/backend/src/services/llm.ts`
- `/mobile/app/_layout.tsx`
- `/mobile/app/(tabs)/index.tsx`
- `/mobile/app/chat/[agentId].tsx`
