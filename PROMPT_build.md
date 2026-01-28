# Ralph Building Mode

You are an AI agent implementing features for the Better Coaching app.

## Your Mission

1. **Read** `IMPLEMENTATION_PLAN.md` to find the next task
2. **Study** the relevant spec in `/specs/` for context
3. **Implement** the task following existing patterns
4. **Validate** your implementation with appropriate checks
5. **Update** `IMPLEMENTATION_PLAN.md` marking task complete
6. **Commit** your changes with a clear message

## Instructions

### Step 1: Orient

Read `IMPLEMENTATION_PLAN.md` and identify:
- The next task marked 🔲 (Not Started) that has no blockers
- The relevant spec file for that task
- Any related files to study

### Step 2: Study

Using parallel subagents (up to 5), investigate:
- The spec file for detailed requirements
- Existing similar implementations to follow patterns
- Types and interfaces that need to be used/extended

Example patterns to study:
- For routes: Look at existing routes in `/backend/src/routes/`
- For components: Look at existing components in `/mobile/src/components/`
- For services: Look at existing services in `/backend/src/services/`

### Step 3: Implement

**Use only 1 subagent for building/writing code.**

Follow these principles:
- Match existing code style exactly
- Use existing utilities and helpers
- Follow TypeScript conventions (explicit types, no `any`)
- Add proper error handling
- Include inline comments for complex logic

For each implementation:
1. Create/modify the required files
2. Update any imports in index files
3. Add types to type definition files
4. Update Prisma schema if needed

### Step 4: Validate

Run appropriate checks:
- `npm run typecheck` (from /mobile) - TypeScript compilation
- `npm run build` (from /backend) - Backend compilation
- `npx prisma validate` (from /backend) - Schema validation

Fix any errors before proceeding.

### Step 5: Update Plan

Mark the task complete in `IMPLEMENTATION_PLAN.md`:
- Change 🔲 to ✅
- Add any learnings or notes
- Identify next task

### Step 6: Commit

Create a focused commit:
```bash
git add <specific files>
git commit -m "feat(<area>): <description>

- <bullet point of what was done>
- <bullet point of what was done>

Task: <task ID from plan>
"
```

## Code Style Guide

### Backend (TypeScript/Express)

```typescript
// Route handler pattern
router.post('/endpoint', authenticate, async (req: Request, res: Response) => {
  try {
    const { field1, field2 } = req.body;

    // Validation
    if (!field1) {
      res.status(400).json({ error: 'Missing field1' });
      return;
    }

    // Business logic
    const result = await someService.doThing(field1);

    res.json({ data: result });
  } catch (error) {
    console.error('Error in endpoint:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});
```

### Mobile (React Native/NativeWind)

```typescript
// Component pattern
import { View, Text, Pressable } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
}

export function MyComponent({ title, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-primary-600 rounded-xl p-4 active:opacity-70"
    >
      <Text className="text-white font-semibold">{title}</Text>
    </Pressable>
  );
}
```

### Prisma Schema

```prisma
model NewModel {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  someField String
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("new_models")
}
```

## Rules

- **Study before building** - Understand patterns first
- **One task per iteration** - Don't try to do multiple tasks
- **Validate before committing** - Run typecheck/build
- **Match existing style** - Don't introduce new patterns unless necessary
- **Keep changes focused** - Only change what's needed for the task
- **Document blockers** - If stuck, update plan with notes and move on

## Completion Signal

When you've successfully completed a task and committed, output:

```
<promise>TASK_COMPLETE</promise>
```

This signals the loop to continue with the next iteration.

If blocked or unable to complete:

```
<promise>BLOCKED: <reason></promise>
```

This signals that human intervention is needed.
