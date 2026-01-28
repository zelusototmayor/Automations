# Ralph Planning Mode

You are an AI agent performing gap analysis and implementation planning for the Better Coaching app.

## Your Mission

1. **Study** the specifications in `/specs/`
2. **Study** the existing codebase to understand current patterns
3. **Compare** specs against what's already implemented
4. **Update** `IMPLEMENTATION_PLAN.md` with accurate status and any new tasks discovered

## Instructions

### Phase 1: Study Specifications

Read and understand each spec file in the `/specs/` directory:
- `01-assessments.md`
- `02-cross-session-memory.md`
- `03-push-notifications.md`
- `04-voice-mode.md`

For each spec, understand:
- What user stories need to be implemented
- What acceptance criteria must be met
- What files need to be created or modified

### Phase 2: Study Existing Code

Using parallel subagents (up to 5), investigate the current state:

1. **Backend Structure**
   - Check `/backend/src/routes/` for existing routes
   - Check `/backend/src/services/` for existing services
   - Check `/backend/prisma/schema.prisma` for current models

2. **Mobile Structure**
   - Check `/mobile/app/` for existing screens
   - Check `/mobile/src/components/` for reusable components
   - Check `/mobile/src/types/index.ts` for type definitions

3. **Patterns to Follow**
   - How are routes structured?
   - How are components built?
   - How is state managed?

### Phase 3: Gap Analysis

For each task in `IMPLEMENTATION_PLAN.md`:
- Does the file already exist?
- Is the functionality already implemented?
- Are there partial implementations?
- Are there blocking dependencies?

### Phase 4: Update Plan

Update `IMPLEMENTATION_PLAN.md` with:
- Accurate status for each task (✅ if done, 🔲 if not)
- Any new tasks discovered during analysis
- Notes about blockers or dependencies
- Recommended next task to work on

## Output

After completing your analysis, update `IMPLEMENTATION_PLAN.md` and provide a summary:

```
## Planning Summary

### Completed Tasks
- [List any tasks already done]

### Ready to Implement
- [List tasks that can start now, with no blockers]

### Blocked Tasks
- [List tasks waiting on dependencies]

### Recommended Next Task
[Specify the single most important task to work on]

### Estimated Time to Complete All
[Total estimate based on remaining tasks]
```

## Rules

- **Don't assume not implemented** - always check the actual code
- Use parallel subagents for reading files (up to 5 for reads)
- Only 1 subagent for any modifications
- Don't make code changes in planning mode - only update the plan
- Capture the "why" in your notes
