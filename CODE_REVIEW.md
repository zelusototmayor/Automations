# Better Coaching — Code Review

**Reviewer:** Automated deep review  
**Date:** 2025-07-24  
**Scope:** Full codebase — backend, mobile, web, infrastructure, design

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Backend Review](#3-backend-review)
4. [Mobile App Review](#4-mobile-app-review)
5. [Web App Review](#5-web-app-review)
6. [Database & Data Models](#6-database--data-models)
7. [Features — Implemented vs Stubbed](#7-features--implemented-vs-stubbed)
8. [UI/UX & Design System](#8-uiux--design-system)
9. [Deployment & Infrastructure](#9-deployment--infrastructure)
10. [Security](#10-security)
11. [Gaps to Production](#11-gaps-to-production)
12. [Prioritized Action Items](#12-prioritized-action-items)

---

## 1. Executive Summary

Better Coaching is an **AI coaching marketplace** built for the RevenueCat Shipyard 2026 Hackathon. Users discover, chat with, and create AI coaching agents. The project has three components: a **Node/Express backend**, a **React Native (Expo) mobile app**, and a **Next.js web creator portal**.

### What Works Well
- **Solid architecture** — Clean separation of concerns across backend services, well-structured Expo Router navigation, and proper Zustand state management.
- **Multi-LLM streaming** — Anthropic, OpenAI, and Google Gemini all supported with SSE streaming. The provider abstraction via async generators is elegant.
- **Auth system** — JWT access + refresh token rotation with database-stored refresh tokens is production-quality auth.
- **RAG knowledge pipeline** — Full document extraction (Notion, Google Docs, file uploads), chunking with overlap, pgvector embeddings, and hybrid search. This is impressive for a hackathon.
- **Design system** — Detailed UI spec, custom Tailwind tokens, pastel palette, glassmorphism effects, and a comprehensive component library. The design is cohesive and premium-feeling.
- **Revenue model** — RevenueCat integration, free trial tracking, subscription gating, and creator studio — the monetization path is fully thought through.

### Key Concerns
- **No tests** — Zero test files across the entire codebase.
- **Duplicate/divergent schemas** — Supabase SQL schema diverges from Prisma schema; both exist simultaneously.
- **Inconsistent naming conventions** — Backend uses camelCase (Prisma), types use snake_case, mobile uses both.
- **Missing rate limiting** — No request throttling on any endpoint.
- **Several stubbed features** — Profile edit, notifications, privacy settings, help/FAQ are all placeholder buttons.
- **No CI/CD** — No GitHub Actions, no lint config, no pre-commit hooks.

**Overall Assessment:** Impressive hackathon project with genuine depth in the AI/knowledge pipeline and clean architecture. Needs hardening for production: tests, rate limiting, input validation tightening, and finishing the stubbed-out features.

---

## 2. Architecture Overview

### Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Backend** | Node.js + Express 5 + TypeScript | API server |
| **Database** | PostgreSQL 16 + Prisma ORM | pgvector for embeddings |
| **Mobile** | React Native + Expo SDK 54 | Expo Router, NativeWind |
| **Web** | Next.js 15 + React 19 | Creator portal + landing page |
| **State** | Zustand | Both mobile and web |
| **Auth** | JWT (access + refresh tokens) | bcrypt + SecureStore |
| **AI** | Anthropic, OpenAI, Google Gemini | Multi-provider with streaming |
| **Payments** | RevenueCat | iOS + Android subscriptions |
| **Styling** | NativeWind (mobile), Tailwind CSS v4 (web) | Custom design system |
| **Deployment** | Docker Compose | PostgreSQL + API containers |

### Project Structure (Good)

```
Better-coaching/
├── backend/          # Express API (11 services, 8 routes)
│   ├── prisma/       # Schema + migrations + seed
│   └── src/
│       ├── routes/   # REST endpoints
│       ├── services/ # Business logic (auth, LLM, RAG, subscriptions)
│       ├── middleware/
│       └── types/
├── mobile/           # Expo app (15 screens, 30+ components)
│   ├── app/          # File-based routing
│   └── src/
│       ├── components/
│       ├── services/
│       ├── stores/
│       └── types/
├── web/              # Next.js creator portal
│   └── src/
│       ├── app/      # Pages (landing, login, dashboard, creator, knowledge)
│       ├── components/
│       ├── hooks/
│       └── lib/
├── mockup/           # HTML/CSS mockups (7 slides)
└── scripts/ralph/    # Automation scripts for UI revamp
```

### Architecture Strengths
- **Backend services are properly decoupled** — each service (auth, LLM, embedding, chunking, retrieval, integration) has a single responsibility.
- **API layer is consistent** — all routes follow the same pattern: validate → authenticate → business logic → respond.
- **Mobile state management is clean** — Zustand stores map 1:1 to feature domains (auth, agents, chat, creator).
- **The RAG pipeline is properly layered** — content extraction → chunking → embedding → storage → retrieval. Each step is independently testable.

### Architecture Concerns
- **No shared type definitions** — Backend types (`src/types/index.ts`), mobile types (`src/types/index.ts`), and web types are all manually maintained copies. They will drift.
- **Supabase schema file is orphaned** — `backend/supabase/schema.sql` has a completely different schema from Prisma (different column names, RLS policies, triggers). This is confusing and likely from an earlier architecture. Should be deleted or documented.
- **No API versioning** — All routes are under `/api/` with no version prefix.

---

## 3. Backend Review

### 3.1 Entry Point (`src/index.ts`) — ✅ Good

Clean Express setup with:
- Helmet for security headers
- CORS with comma-separated origin support
- Health check with database ping
- Graceful shutdown handlers (SIGTERM, SIGINT)
- Proper 404 and error handlers

**Issue:** `dotenv.config()` is called after imports. If any imported module reads `process.env` at import time (e.g., `auth.ts` reads `JWT_SECRET`), the env vars won't be loaded yet. Move `dotenv.config()` to the very top.

```typescript
// Current (problematic):
import authRouter from './routes/auth'; // This reads JWT_SECRET at import time
dotenv.config(); // Too late!

// Fix:
import dotenv from 'dotenv';
dotenv.config(); // Load first
import authRouter from './routes/auth'; // Now JWT_SECRET is available
```

### 3.2 Authentication Service — ✅ Solid

- bcrypt with 12 salt rounds (good)
- Short-lived access tokens (15 min) with refresh token rotation
- Refresh tokens stored in database with expiry
- Old refresh tokens deleted on rotation (prevents reuse)
- Separate secrets for access and refresh tokens

**Issues:**
1. **Fallback secret in code:** `const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'` — This means the app will silently start with an insecure secret if the env var is missing. Should throw on startup instead.
2. **No password complexity validation beyond length:** The Zod schema only checks `min(8)`. Consider requiring mixed case, numbers, or special characters.
3. **No account lockout:** Unlimited login attempts per email. Vulnerable to brute-force.

### 3.3 LLM Service — ✅ Well-designed

The multi-provider streaming architecture is elegant:
- Lazy client initialization (only instantiates when first used)
- Async generators for streaming (`yield*` delegation pattern)
- System prompt builder correctly layers: base prompt → knowledge context → RAG results → user context → example conversations
- 15,000 char truncation on inline knowledge to prevent token overflow

**Issues:**
1. **Google client uses wrong env var:** `process.env.GOOGLE_AI_API_KEY` but `.env.example` has `GOOGLE_API_KEY`. Will silently fail.
2. **No token counting on response:** The `tokenCount` field on messages is always `null` — never populated. This means billing/analytics on token usage won't work.
3. **No timeout on LLM calls:** If an LLM provider hangs, the SSE connection stays open indefinitely.
4. **Temperature is unvalidated:** If a creator sets temperature > 2.0 (which the UI could allow), Anthropic will reject the request.

### 3.4 Knowledge Pipeline — ✅ Impressive

Full RAG implementation:
- **Content extraction** from Notion (recursive block traversal) and Google Docs (paragraph/table extraction)
- **Smart chunking** with paragraph/sentence boundary respect, configurable overlap, heading context preservation
- **Batch embedding** via OpenAI ada-002 with pgvector storage
- **Hybrid retrieval** combining vector similarity + PostgreSQL full-text search
- **Change detection** via content hashing (skips re-processing unchanged docs)

**Issues:**
1. **Embedding model is hardcoded** to `text-embedding-ada-002` (1536 dims). Should be configurable since ada-002 is not the latest.
2. **Token estimation** uses `chars / 4` which is rough. For production, use tiktoken.
3. **No retry logic** on embedding API calls. A transient error fails the entire document.
4. **The `knowledgeSimple` route** (`/api/knowledge-simple/`) uses Notion's internal/undocumented `loadPageChunk` API — this could break at any time. The official Notion API route (`/api/knowledge/`) is more robust.

### 3.5 Routes — Generally Good

**Auth routes:** Proper Zod validation, correct HTTP status codes (201 for register, 409 for duplicate, 401 for bad credentials).

**Agent routes:** Correct ownership verification before update/delete. Model validation against supported models list. `GET /agents/mine` correctly placed before `GET /agents/:id` to avoid route conflicts.

**Chat routes:** SSE streaming implemented correctly. Conversation creation, message saving, usage counting all handled in the right order. Free trial gating works.

**Issues:**
1. **No input sanitization on agent creation:** The `system_prompt` and `greeting_message` fields accept arbitrary content with no length limits. A malicious creator could inject a massive system prompt.
2. **No pagination on conversations list:** `GET /chat/conversations` returns all conversations with no limit.
3. **Webhook idempotency is in-memory:** The `processedEvents` Set will be lost on server restart, and doesn't work across multiple instances. Should use the database (the `webhook_events` table exists in the Supabase schema but not in Prisma).
4. **The agents route uses `req.params.id as string`** which is safe in Express 5 but the `as string` casts are unnecessary noise.

### 3.6 Encryption — ⚠️ Concerning

```typescript
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
```

- Uses CryptoJS AES with a string passphrase (not a proper key derivation)
- Fallback to a hardcoded default key
- MD5 for content hashing (acceptable for change detection, but concerning if anyone uses it for security)
- CryptoJS is a legacy library — Node.js built-in `crypto` module is better

### 3.7 Subscription Service — ✅ Good

Clean separation of subscription logic:
- `canSendMessage()` correctly checks premium status, then free trial
- `canCreateCoach()` properly gates the creator studio
- RevenueCat webhook handler maps events to subscription status changes
- Free trial tracking via database (one free message per coach per user)

---

## 4. Mobile App Review

### 4.1 Navigation — ✅ Well-structured

Expo Router file-based routing with:
- Welcome flow for first-time users (`(welcome)/`)
- Tab navigation with 5 tabs (`(tabs)/`)
- Modal presentations for auth, paywall, context, quiz
- Dynamic routes for chat (`chat/[agentId]`) and coach detail (`coach/[id]`)
- Auth state-based redirects in `_layout.tsx`

**Issue:** The `index.ts` at the root references `./App` but the app uses Expo Router's entry point (`expo-router/entry` in package.json). This file appears to be leftover from a pre-Router setup and would break if referenced.

### 4.2 State Management — ✅ Clean

Four Zustand stores, each focused:
- **auth** — User session, subscription, initialization logic
- **agents** — Featured/browsed agents, categories, search state
- **chat** — Conversations, messages, streaming state with optimistic updates
- **creator** — Agent draft wizard, system prompt generation

**Strengths:**
- The auth store's `initialize()` handles token loading → validation → user fetch → RevenueCat init in the correct order
- Token refresh uses a promise lock to prevent concurrent refreshes
- Chat store does optimistic UI (add message immediately, rollback on error)

**Issues:**
1. **The auth store has a race condition note** that's been addressed, but `personal_context` field on the User type doesn't match the backend (backend returns `context` not `personal_context`). The context screen reads from `user?.personal_context` which may always be undefined.
2. **No error state in stores** — When API calls fail, errors are logged to console but never surfaced to the UI as state. The stores only have loading booleans, not error states.
3. **The agents store triggers API calls inside `setCategory`/`setSearch`** — This tightly couples store mutations with side effects. A debounced search would be cleaner.

### 4.3 API Service — ✅ Good

- Token refresh with retry pattern (one retry on 401)
- SSE parsing for chat streaming (manual since React Native doesn't support ReadableStream)
- Comprehensive API coverage for all backend endpoints

**Issues:**
1. **No request timeout:** If the backend is down, `fetch()` will hang until the OS kills it.
2. **SSE parsing is fragile:** The chat `sendMessage` reads the entire response as text then parses SSE events. If the backend sends partial JSON, parsing silently fails. The error handling catch only ignores `SyntaxError` specifically.
3. **API URL has a default port mismatch:** Mobile default is `localhost:3003`, backend default is `localhost:3000`, Docker Compose exposes `3001`. Three different ports.

### 4.4 Screens — Mostly Complete

| Screen | Status | Notes |
|--------|--------|-------|
| Welcome | ✅ Complete | Animated entry, dev login button, guest mode |
| Auth | ✅ Complete | Sign in/up toggle, validation, error handling |
| Home | ✅ Complete | Continue section, categories, featured coaches |
| Explore | ✅ Complete | Search, category filters, debounced search |
| Chat | ✅ Complete | SSE streaming, welcome view, coach info modal, suggestions |
| Coach Detail | ✅ Complete | Stats, tags, conversation starters, free trial note |
| Create | ✅ Complete | Auth gate, premium gate, my coaches list |
| History | ✅ Complete | Conversation list, delete with confirmation |
| Profile | ✅ Complete | Subscription status, menu items, sign out |
| Paywall | ✅ Complete | Package cards, feature list, purchase flow |
| Context | ✅ Complete | Values picker, goals/challenges form |
| Quiz | ✅ Complete | Multi-step quiz, coach matching algorithm |
| Creator (new) | ⚠️ Partial | Routes exist but screens reference creator steps |
| Creator (edit) | ⚠️ Partial | Route exists but implementation unclear |

**Issues:**
1. **Auth screen shows "Check Your Email" after signup** — but the backend doesn't send confirmation emails. The registration completes immediately. This message misleads users.
2. **"Unread" badge in Continue section is fake** — hardcoded to show for conversations < 24h old. There's no actual read/unread tracking.
3. **Some screens still reference old design tokens** — `bg-primary-600`, `text-primary-700`, `bg-background-light` appear in create.tsx, history.tsx, context.tsx instead of the new sage/pastel palette.
4. **Several profile menu items are no-ops:** "Edit Profile", "Notifications", "Privacy & Security", "Help & FAQ", "Contact Us", "Terms & Privacy" all have `onPress={() => {}}`.

### 4.5 Components — ✅ Well-built

The component library is comprehensive:
- **Button** — 5 variants (primary, secondary, ghost, outline, danger), 3 sizes, loading state, icon support
- **CoachCard** — 4 variants (default, compact, horizontal, grid) with gradient avatars
- **FloatingTabBar** — Glassmorphism blur effect, animated active pill, badge support
- **Badge/Rating/Icons** — Full set of UI primitives

**Issue:** The `Icons.tsx` file (not fully read but imported everywhere) likely contains all SVG icon components. Should verify it's not a massive file that inflates bundle size — consider using expo-vector-icons instead.

---

## 5. Web App Review

### 5.1 Overall — ⚠️ Less Polished Than Mobile

The web app serves as a **creator portal** (not a consumer-facing app). It includes:
- Landing page with marketing sections
- Login page
- Dashboard (agent list with knowledge stats)
- Agent creator (6-step wizard)
- Knowledge management page (per agent)
- Integrations page (Notion/Google OAuth connections)

**Issues:**
1. **No shared auth middleware** — The web app stores tokens in localStorage (via Zustand persist). No token refresh logic on the web side. If the access token expires, the user gets an error with no auto-recovery.
2. **The web store doesn't have `refreshToken` refresh logic** — Unlike the mobile app which has a full refresh flow, the web just stores the token and hopes it's valid.
3. **Landing page is functional but unfinished** — Several landing components (AppPreview, Categories, etc.) exist but the connection between landing page → sign up → dashboard flow isn't seamless.
4. **No route protection** — Dashboard and agent pages don't redirect unauthenticated users. They'll just fail with API errors.

### 5.2 API Client — ✅ Good

The web API client (`lib/api.ts`) is well-typed with separate namespaced objects (`authApi`, `agentsApi`, `integrationsApi`, `knowledgeApi`). Error handling uses a custom `ApiError` class with status codes.

---

## 6. Database & Data Models

### 6.1 Prisma Schema — ✅ Well-designed

13 models covering the full domain:

| Model | Purpose | Relations |
|-------|---------|-----------|
| `User` | Users with subscription info | → Agents, Conversations, Ratings, RefreshTokens, IntegrationConnections |
| `RefreshToken` | JWT refresh token storage | → User |
| `Agent` | AI coaching agents | → Creator (User), Conversations, Ratings, FreeTrials, KnowledgeSources |
| `Conversation` | Chat sessions | → User, Agent, Messages |
| `Message` | Chat messages | → Conversation |
| `AgentRating` | 1-5 ratings with reviews | → User, Agent (unique per pair) |
| `FreeTrial` | Free message tracking | → Agent (unique per visitor+agent) |
| `Category` | Coach categories | Standalone |
| `IntegrationConnection` | OAuth connections (Notion, Google) | → User, KnowledgeSources |
| `KnowledgeSource` | RAG knowledge source | → Agent, Connection, Documents |
| `KnowledgeDocument` | Individual documents | → Source, Chunks |
| `KnowledgeChunk` | Text chunks with pgvector embeddings | → Document |

**Strengths:**
- Proper column mapping (`@map("snake_case")`) for clean SQL while using camelCase in code
- Indexes on all foreign keys and frequent query columns
- Cascade deletes throughout
- Unique constraints where appropriate (email, refresh token, user+agent rating, visitor+agent trial)
- The `Unsupported("vector(1536)")` for pgvector embeddings is correctly used

**Issues:**
1. **No `updatedAt` on Messages** — Can't track if messages were edited (though they shouldn't be in a chat app).
2. **`context` field is `Json?` with default `"{}"` (string, not object)** — This is a Prisma default issue. The actual default should be `{}` not `"{}"`. Prisma handles this correctly at runtime, but it's worth noting.
3. **`tokenCount` on Message is nullable and never populated** — Dead field.
4. **No index on `Message.createdAt`** — Would help conversation loading performance at scale.
5. **`avatarUrl` on Agent stores a single character** (like "P" for Productivity Pro) — The field name suggests a URL but it's used as an avatar letter/emoji. Naming is misleading.

### 6.2 Supabase Schema — ⛔ Should Be Removed

The file `backend/supabase/schema.sql` contains:
- A completely different schema structure (e.g., `personal_context` vs `context`, `is_creator` boolean vs `subscriptionTier` enum)
- Supabase-specific features (RLS policies, auth.uid())
- A separate `subscriptions` table that doesn't exist in Prisma
- A `webhook_events` table for idempotency that Prisma doesn't have
- A `agent_usage_daily` analytics table

This is clearly from an earlier architecture (Supabase-first) before switching to Prisma. **It should be deleted** to avoid confusion.

### 6.3 Seed Data — ✅ Good

4 sample coaches with realistic system prompts, personality configs, and conversation starters. Demo user with premium subscription for testing.

---

## 7. Features — Implemented vs Stubbed

### ✅ Fully Implemented

| Feature | Backend | Mobile | Web |
|---------|---------|--------|-----|
| User registration/login | ✅ | ✅ | ✅ |
| JWT auth with refresh | ✅ | ✅ | ⚠️ (no refresh) |
| Browse/search coaches | ✅ | ✅ | N/A |
| Coach detail pages | ✅ | ✅ | N/A |
| Chat with streaming | ✅ | ✅ | N/A |
| Conversation history | ✅ | ✅ | N/A |
| Free trial (1 msg/coach) | ✅ | ✅ | N/A |
| Subscription gating | ✅ | ✅ | N/A |
| Personal context | ✅ | ✅ | N/A |
| Creator studio | ✅ | ✅ | ✅ |
| Agent CRUD | ✅ | ✅ | ✅ |
| Multi-LLM support | ✅ | N/A | ✅ (model selector) |
| Notion public page extraction | ✅ | N/A | N/A |
| File upload extraction (PDF/DOCX) | ✅ | N/A | N/A |
| OAuth integrations (Notion/Google) | ✅ | N/A | ✅ |
| RAG knowledge pipeline | ✅ | N/A | ✅ (management UI) |
| Coach matching quiz | N/A | ✅ | N/A |
| RevenueCat integration | ✅ (webhooks) | ✅ (SDK) | N/A |

### ⚠️ Partially Implemented

| Feature | Status |
|---------|--------|
| **Agent ratings/reviews** | Schema exists, API endpoint not implemented (no POST route) |
| **Creator analytics** | `usageCount` tracked but no analytics dashboard |
| **Dark mode** | Design tokens defined, not wired up in components |
| **Agent deletion** | Backend route exists, no UI button for it |
| **Conversation deletion** | Works via long-press in history, not discoverable |

### ⛔ Stubbed / Not Implemented

| Feature | Notes |
|---------|-------|
| **Edit Profile** | Profile button exists, `onPress={() => {}}` |
| **Notifications** | Menu item exists, no backend or push setup |
| **Privacy & Security** | Menu item, no implementation |
| **Help & FAQ** | Menu item, no implementation |
| **Contact Us** | Menu item, no implementation |
| **Terms & Privacy** | Menu item, no page |
| **Email verification** | UI message shown but backend doesn't send emails |
| **Password reset** | No route, no UI |
| **Coach analytics dashboard** | No implementation |
| **Payment receipts** | No implementation |
| **Agent versioning** | No implementation |

---

## 8. UI/UX & Design System

### 8.1 Design System — ✅ Thorough

The design system is documented in `DESIGN.md` and implemented in `tailwind.config.js`:
- **Color palette:** Sage (primary), Lavender (secondary), Blush, Sky, Sand (accents)
- **Typography:** Inter font family with 7 defined sizes
- **Border radius:** Intentionally soft (22px cards, 20px buttons)
- **Shadows:** Wide, soft shadows (0 10px 28px rgba)
- **Glassmorphism:** blur(20px) with rgba(255,255,255,0.88) backgrounds

### 8.2 Mockup Folder

7 HTML mockup slides:
1. Cover slide
2. Design system specification
3. Home screen mockup
4. Explore screen mockup
5. Coach detail mockup
6. Chat screen mockup
7. Components library

These are static HTML presentations — likely used for pitching/design handoff.

### 8.3 UI Consistency Issues

1. **Color token drift:** Some screens use the old design system (`bg-primary-600`, `text-primary-700`) while others use the new pastel system (`bg-sage-600`, `text-sage-600`). Specifically:
   - `create.tsx` — Uses `bg-primary-600`, `text-primary-700`, `bg-primary-100`, `#4F46E5` (old indigo)
   - `history.tsx` — Uses `bg-primary-600`, `text-primary-700`, `bg-primary-100`, `#4F46E5`
   - `context.tsx` — Uses `bg-primary-600`, `text-primary-600`, `bg-primary-50`
   - `paywall.tsx` — Uses `bg-primary-600`, `text-primary-600`, `bg-secondary-500`
   - `coach/[id].tsx` — Uses `bg-primary-50`, `text-primary-600`, `text-primary-800`, `#2563EB` (old blue)

2. **The app name is inconsistent:** "Better Coaching" in README/package.json, "CoachCraft" in the welcome screen and auth screen. The bundle ID is `com.bettercoaching.app` but the splash logo text says "CoachCraft".

3. **Avatar handling is inconsistent:** Some places show emoji (coach detail uses `agent.avatar_url || '🤖'`), others use letter-in-gradient (CoachCard, chat). The seed data stores single letters ("P", "M", "C", "S") as `avatarUrl`.

### 8.4 Intended User Flow (from mockups + code)

```
Welcome Screen
  ├─> Create Account → Auth Screen → Home (tabs)
  ├─> Sign In → Auth Screen → Home (tabs)
  └─> Continue as Guest → Home (tabs)

Home (tabs)
  ├─> Continue section (recent conversations) → Chat
  ├─> Categories → Explore (filtered)
  ├─> Featured coaches → Coach Card → Chat
  └─> Find Your Coach → Quiz → Matched coaches

Explore
  ├─> Search coaches
  ├─> Filter by category
  └─> Coach Card → Chat

Chat
  ├─> Welcome view (first visit) with coach info
  ├─> Send message → SSE streaming response
  ├─> Coach info modal
  └─> Free trial enforcement → Paywall

Create (Premium only)
  ├─> New coach → Creator wizard (5 steps)
  └─> Edit existing coach

Profile
  ├─> Personal context
  ├─> Subscription management
  └─> Sign out
```

---

## 9. Deployment & Infrastructure

### 9.1 Docker Setup — ✅ Good

- Multi-stage Dockerfile (builder → production)
- Non-root user in container
- Health checks on both containers
- PostgreSQL with persistent volume
- Sensible port mapping (5433 external → 5432 internal to avoid conflicts)

**Issues:**
1. **No web app in Docker Compose** — Only backend + database. The Next.js app has no Dockerfile.
2. **No Redis** — The webhook idempotency is in-memory. Should add Redis for production.
3. **No reverse proxy** — No nginx/caddy for TLS termination, rate limiting, or static file serving.
4. **`CORS_ORIGIN: ${CORS_ORIGIN:-*}`** — Default CORS allows all origins in production.

### 9.2 Environment Variables

Well-documented with `.env.example` files for both backend and mobile. Production template at `.env.production.example`.

**Missing env vars that should be documented:**
- `ENCRYPTION_KEY` (used in encryption service but only in backend `.env.example`)
- `WEB_APP_URL` (used for OAuth redirects)
- `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET` (for OAuth)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (for OAuth)

### 9.3 What's Needed to Run

```bash
# Backend
cd backend && npm install && cp .env.example .env
# Edit .env with DATABASE_URL, JWT_SECRET, at least one AI API key
npx prisma generate && npx prisma db push && npm run db:seed && npm run dev

# Mobile
cd mobile && npm install && cp .env.example .env
# Edit .env with API URL
npm start

# Web
cd web && npm install
# Edit .env with NEXT_PUBLIC_API_URL
npm run dev
```

---

## 10. Security

### ✅ Good Practices
- Helmet for HTTP headers
- bcrypt with 12 rounds for passwords
- JWT with short expiry (15 min) + refresh rotation
- Passwords never returned in API responses (`sanitizeUser`)
- OAuth tokens encrypted at rest
- Input validation with Zod on auth routes
- Ownership checks on all mutation endpoints

### ⚠️ Security Concerns

| Issue | Severity | Location |
|-------|----------|----------|
| **No rate limiting** | 🔴 High | All endpoints — brute-force login, API abuse possible |
| **Default secrets in code** | 🔴 High | `auth.ts`, `encryption.ts` — app runs with insecure defaults if env vars missing |
| **CORS allows all origins by default** | 🟡 Medium | `index.ts` — `${CORS_ORIGIN:-*}` in docker-compose |
| **No CSRF protection** | 🟡 Medium | Web app uses Bearer tokens (not cookies) so less critical, but OAuth callbacks are vulnerable |
| **OAuth state is base64-encoded user ID** | 🟡 Medium | `integrations.ts` — state should include a random nonce, not just userId + timestamp |
| **CryptoJS instead of native crypto** | 🟡 Medium | `encryption.ts` — legacy library, passphrase-based encryption |
| **No input length limits on most fields** | 🟡 Medium | Agent system_prompt, greeting_message, description have no max length |
| **In-memory webhook dedup** | 🟡 Medium | `webhooks.ts` — lost on restart, doesn't scale |
| **No SQL injection via raw queries** | ✅ Safe | pgvector queries use parameterized queries correctly |

---

## 11. Gaps to Production

### Must-Have (P0)

1. **Add tests** — At minimum: auth service, subscription service, chat streaming, knowledge pipeline. Use Jest + Supertest.
2. **Add rate limiting** — Use `express-rate-limit`. Critical for login (5/min per IP), chat (20/min per user), general (100/min per IP).
3. **Fix default secrets** — Throw on startup if `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY` are not set. Remove all fallback defaults.
4. **Fix the Google API key env var** — Change `GOOGLE_AI_API_KEY` to `GOOGLE_API_KEY` (or vice versa, but be consistent).
5. **Add token refresh to web app** — The web portal will break when access tokens expire.
6. **Add request timeouts** — Both on the API side (LLM calls) and client side (fetch calls).
7. **Remove or archive `supabase/schema.sql`** — It's confusing and diverges from the actual schema.
8. **Fix the email verification UI lie** — Either implement email verification or remove the "check your email" message.

### Should-Have (P1)

9. **Add CI/CD** — GitHub Actions for: lint, typecheck, test, build, deploy.
10. **Add ESLint config** — The mobile `lint` script is literally `echo 'Lint check passed'`.
11. **Add request logging** — Use morgan or pino for structured access logs.
12. **Add error tracking** — Sentry or similar for runtime error monitoring.
13. **Implement the stubbed profile features** — Or remove them from the UI.
14. **Resolve naming inconsistency** — Pick "Better Coaching" or "CoachCraft" and use it everywhere.
15. **Add pagination** to all list endpoints (conversations, agents, messages).
16. **Add response caching** — Categories, supported models can be cached aggressively.
17. **Migrate UI to consistent design tokens** — Fix the 5+ screens still using old color system.
18. **Add password reset flow** — Registration without password reset is a support nightmare.

### Nice-to-Have (P2)

19. **Implement agent ratings** — The model exists, just needs a POST route and UI.
20. **Add real-time chat** — Replace SSE polling with WebSocket for lower latency.
21. **Add agent analytics** — Usage charts, conversation metrics for creators.
22. **Implement dark mode** — Tokens are defined, just needs conditional application.
23. **Add shared type package** — monorepo with `packages/types` shared between backend/mobile/web.
24. **Implement webhook idempotency in database** — Use the PostgreSQL table instead of in-memory Set.
25. **Add Redis** for session caching, rate limiting, and webhook dedup.
26. **Add image upload** for agent avatars (currently single-letter strings).

---

## 12. Prioritized Action Items

### Immediate (Before Demo/Launch)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | Fix `GOOGLE_AI_API_KEY` → `GOOGLE_API_KEY` env var mismatch | 5 min | Breaks Google Gemini |
| 2 | Move `dotenv.config()` before imports in `index.ts` | 5 min | Potential auth failures |
| 3 | Remove "Check Your Email" message from signup flow | 5 min | Misleading UX |
| 4 | Delete `supabase/schema.sql` | 1 min | Removes confusion |
| 5 | Decide on app name: "Better Coaching" vs "CoachCraft" | 15 min | Brand consistency |
| 6 | Fix default port consistency (3000 vs 3001 vs 3003) | 15 min | Developer experience |

### Sprint 1 (Security + Stability)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 7 | Add rate limiting with `express-rate-limit` | 2h | Security critical |
| 8 | Throw on missing JWT/encryption secrets | 30 min | Security critical |
| 9 | Add request timeouts (LLM: 60s, API: 30s) | 1h | Stability |
| 10 | Add token refresh to web app | 3h | Web portal usability |
| 11 | Add ESLint + Prettier config | 2h | Code quality |
| 12 | Add basic test suite (auth, chat, subscription) | 8h | Confidence |

### Sprint 2 (Polish + Features)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 13 | Migrate remaining screens to new design tokens | 4h | Visual consistency |
| 14 | Implement stubbed profile features or remove buttons | 4h | UX quality |
| 15 | Add pagination to list endpoints | 3h | Scalability |
| 16 | Implement password reset flow | 6h | User support |
| 17 | Add agent ratings POST route + UI | 4h | User engagement |
| 18 | Add CI/CD pipeline | 4h | Developer velocity |
| 19 | Add structured logging | 2h | Observability |
| 20 | Add error tracking (Sentry) | 2h | Reliability |

---

## Summary

Better Coaching is an impressively complete hackathon project. The architecture is sound, the RAG pipeline is genuinely sophisticated, and the mobile app has real polish. The main gaps are the typical "hackathon debt": no tests, inconsistent naming, some stubbed features, and security hardening needed before any real users touch it. The fixes are all straightforward — nothing requires architectural changes.

**If I had to pick the top 3 actions:** fix the security defaults (items 7-8), add basic tests (item 12), and clean up the UI inconsistencies (item 13). Everything else is incremental improvement on a solid foundation.
