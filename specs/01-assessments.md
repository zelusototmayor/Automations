# Feature: Structured Coaching Assessments

## Overview
Interactive exercises coaches can add (e.g., Wheel of Life, goal-setting frameworks) that collect structured data and inform future conversations.

## User Stories

### US-A01: Assessment Schema Definition
**As a** developer
**I want** a clear JSON schema for assessments
**So that** the system can validate and process assessment configurations consistently

**Acceptance Criteria:**
- [ ] TypeScript interface `AssessmentConfig` defined in `/backend/src/types/index.ts`
- [ ] TypeScript interface `AssessmentQuestion` with types: `scale_1_10`, `multiple_choice`, `open_text`
- [ ] TypeScript interface `AssessmentResponse` for storing user answers
- [ ] Zod validation schema for assessment config
- [ ] Unit tests for validation

**Implementation Notes:**
```typescript
interface AssessmentConfig {
  id: string;
  name: string;  // "Wheel of Life"
  description?: string;
  triggerType: 'first_message' | 'on_demand' | 'scheduled';
  questions: AssessmentQuestion[];
}

interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'scale_1_10' | 'multiple_choice' | 'open_text';
  options?: string[];  // For multiple_choice
  category?: string;   // For grouping (e.g., "Career", "Health")
  required?: boolean;
}

interface AssessmentResponse {
  id: string;
  assessmentId: string;
  conversationId: string;
  userId: string;
  answers: Record<string, string | number>;  // questionId -> answer
  completedAt: Date;
}
```

---

### US-A02: Database Migration for Assessments
**As a** developer
**I want** to store assessment configs and responses in the database
**So that** coaches can configure assessments and users' responses persist

**Acceptance Criteria:**
- [ ] New field `Agent.assessmentConfigs` (Json[]) in Prisma schema
- [ ] New model `AssessmentResponse` in Prisma schema
- [ ] Migration runs successfully
- [ ] Seed data includes example "Wheel of Life" assessment

**Prisma Schema Addition:**
```prisma
model Agent {
  // ... existing fields
  assessmentConfigs  Json[]  @default([]) @map("assessment_configs")
}

model AssessmentResponse {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  agentId         String   @map("agent_id")
  conversationId  String?  @map("conversation_id")
  assessmentId    String   @map("assessment_id")
  answers         Json     @default("{}")
  completedAt     DateTime @default(now()) @map("completed_at")

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  agent        Agent        @relation(fields: [agentId], references: [id], onDelete: Cascade)
  conversation Conversation? @relation(fields: [conversationId], references: [id], onDelete: SetNull)

  @@index([userId, agentId])
  @@index([conversationId])
  @@map("assessment_responses")
}
```

---

### US-A03: Backend API for Assessments
**As a** mobile app
**I want** API endpoints for assessment CRUD and response submission
**So that** I can fetch assessments and submit user responses

**Acceptance Criteria:**
- [ ] `GET /agents/:id/assessments` - Get agent's assessment configs
- [ ] `POST /agents/:id/assessments` - Add assessment config (creator only)
- [ ] `PUT /agents/:id/assessments/:assessmentId` - Update assessment config
- [ ] `DELETE /agents/:id/assessments/:assessmentId` - Delete assessment config
- [ ] `POST /assessments/:assessmentId/responses` - Submit user responses
- [ ] `GET /users/me/assessment-responses` - Get user's assessment history
- [ ] All endpoints have proper auth and validation

**File:** `/backend/src/routes/assessments.ts`

---

### US-A04: Creator UI - Add Assessment Step
**As a** coach creator
**I want** to add assessments when creating my coach
**So that** users get structured exercises during conversations

**Acceptance Criteria:**
- [ ] New step in creator wizard (after personality config)
- [ ] Can add multiple assessments
- [ ] Can configure: name, description, trigger type
- [ ] Can add questions with different types (scale, multiple choice, open text)
- [ ] Can reorder questions
- [ ] Can remove questions
- [ ] Preview mode shows how assessment will look
- [ ] Assessment configs saved to agent on publish

**File:** `/mobile/app/creator/assessments.tsx`

**UI Components Needed:**
- `AssessmentBuilder` - Main form for building assessment
- `QuestionEditor` - Edit individual question
- `AssessmentPreview` - Preview how it looks to users

---

### US-A05: Chat UI - Assessment Modal
**As a** user chatting with a coach
**I want** to complete assessments when prompted
**So that** my coach can provide more personalized advice

**Acceptance Criteria:**
- [ ] Assessment triggered on first message (if `triggerType: 'first_message'`)
- [ ] Assessment available via button (if `triggerType: 'on_demand'`)
- [ ] Modal/sheet displays assessment questions
- [ ] Scale questions show slider (1-10)
- [ ] Multiple choice shows selectable options
- [ ] Open text shows text input
- [ ] Progress indicator for multi-question assessments
- [ ] Submit button saves responses
- [ ] Toast/confirmation on completion
- [ ] Can skip optional questions

**Files:**
- `/mobile/src/components/AssessmentModal.tsx`
- Update `/mobile/app/chat/[agentId].tsx`

---

### US-A06: Inject Assessment Results into Prompts
**As a** coach AI
**I want** to see the user's assessment results
**So that** I can reference them in my coaching

**Acceptance Criteria:**
- [ ] `buildSystemPrompt()` in `llm.ts` fetches user's assessment responses for this agent
- [ ] Assessment results formatted clearly in prompt
- [ ] Results include: assessment name, question text, user's answer
- [ ] Old results (>30 days) can be summarized or excluded
- [ ] Performance: cached or efficiently queried

**Prompt Format Example:**
```
## Assessment Results

### Wheel of Life (completed Jan 15, 2026)
- Career Satisfaction: 6/10
- Relationships: 8/10
- Health & Fitness: 4/10
- Personal Growth: 7/10

Use these scores to guide your coaching. The user's lowest area is Health & Fitness.
```

---

## Task Breakdown (Ralph-ready)

| Task ID | Description | Depends On | Est. Time |
|---------|-------------|------------|-----------|
| A01 | Define TypeScript interfaces for assessments | - | 30 min |
| A02 | Add Zod validation schema | A01 | 20 min |
| A03 | Create Prisma migration for assessments | A01 | 30 min |
| A04 | Seed example Wheel of Life assessment | A03 | 20 min |
| A05 | Create assessments routes file | A03 | 15 min |
| A06 | Implement GET /agents/:id/assessments | A05 | 30 min |
| A07 | Implement POST /agents/:id/assessments | A05 | 45 min |
| A08 | Implement PUT assessment endpoint | A07 | 30 min |
| A09 | Implement DELETE assessment endpoint | A07 | 20 min |
| A10 | Implement POST /assessments/:id/responses | A05 | 45 min |
| A11 | Implement GET /users/me/assessment-responses | A10 | 30 min |
| A12 | Create mobile AssessmentModal component | A01 | 1 hr |
| A13 | Create ScaleQuestion component (1-10 slider) | A12 | 30 min |
| A14 | Create MultipleChoiceQuestion component | A12 | 30 min |
| A15 | Create OpenTextQuestion component | A12 | 20 min |
| A16 | Integrate AssessmentModal into chat screen | A12, A06, A10 | 1 hr |
| A17 | Add assessment step to creator wizard | A06, A07 | 2 hr |
| A18 | Extend buildSystemPrompt() with assessment results | A10, A11 | 1 hr |
| A19 | Add mobile types for assessments | A01 | 20 min |
| A20 | End-to-end test: create coach with assessment, complete as user | All | 1 hr |

## Files to Create/Modify

**Create:**
- `/backend/src/routes/assessments.ts`
- `/mobile/src/components/AssessmentModal.tsx`
- `/mobile/src/components/questions/ScaleQuestion.tsx`
- `/mobile/src/components/questions/MultipleChoiceQuestion.tsx`
- `/mobile/src/components/questions/OpenTextQuestion.tsx`
- `/mobile/app/creator/assessments.tsx`

**Modify:**
- `/backend/prisma/schema.prisma`
- `/backend/src/types/index.ts`
- `/backend/src/services/llm.ts`
- `/backend/src/index.ts` (register routes)
- `/mobile/src/types/index.ts`
- `/mobile/app/chat/[agentId].tsx`
- `/mobile/app/creator/[id].tsx` or `/mobile/app/creator/new.tsx`
