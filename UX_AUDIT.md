# UX/Feature Audit & Monetization Strategy

**Better Coaching — AI Coaching Marketplace**
*RevenueCat Shipyard Hackathon Submission*
*Audit Date: 2025-07-23*

---

## 1. USER JOURNEY MAP

### 1A. First-Time User (No Account)

```
App Open
  → Video Splash (branded intro)
  → Welcome Screen (CoachCraft branding, 3 animated feature cards)
     ├─ "Create Account" → Auth Modal (email/password sign up)
     ├─ "Sign In" → Auth Modal (same screen, toggle mode)
     └─ "Continue as Guest" → Home Tab (browse-only mode)
```

**Guest Flow (after "Continue as guest"):**
```
Home Tab
  → Search bar (taps → Explore tab)
  → "Find your coach in 60 seconds" card (no conversations yet)
     ├─ "Get matched" → Quiz (5 questions → Top 3 matches)
     └─ "Browse categories" → Explore tab
  → Categories horizontal scroll
  → "Recommended for you" grid (featured coaches)
  → "Add your coach" footer → Explore

Explore Tab → Search + Category filters → Coach list (CoachCards)
  → Tap coach → Chat screen (Welcome view with coach detail)
     → Type message or tap suggestion → "Sign In Required" alert
        → "Sign In" → Auth Modal

Create Tab → AuthGate ("Sign In to Create")
History Tab → AuthGate ("Sign in to save conversations")
Profile Tab → AuthGate ("Sign in to personalize")
```

**Friction Points:**
- 🔴 Guest can browse but hitting ANY action (chat, create, history, profile) dead-ends into auth. This is frustrating—users want to try before committing.
- 🟡 Welcome screen says "CoachCraft" but the project/repo is "Better Coaching" — brand confusion.
- 🟢 Video splash is delightful but adds ~2-3s before the user can do anything.

**Delightful Moments:**
- ✨ Animated welcome screen with staggered feature reveal is polished.
- ✨ "Find your coach in 60 seconds" quiz is a strong hook for new users.
- ✨ Horizontal "Continue" section intelligently shows when conversations exist vs. the quiz card when fresh.

---

### 1B. New Registered User (Free Tier)

```
Auth Screen (register email + password)
  → Alert: "Check Your Email" (email verification mentioned but likely not enforced)
  → After sign in: back to previous screen
  → hasSeenWelcome = true → lands on Home (tabs)

Home Tab (now authenticated)
  → Same as guest, but now can initiate chats
  → Tap coach card → Chat screen (Welcome View)
     → See coach detail (avatar, tagline, about, tags, stats)
     → "Free Preview Available" banner (for premium coaches)
     → Suggestions bar: "Try asking:" with speech bubble starters
     → Send first message → Works! Streaming response
     → Send second message to same premium coach → 403 "Free Trial Used"
        → Alert: "Subscribe" → Paywall

Profile Tab (authenticated free)
  → Profile header (name, email, initial avatar)
  → "Upgrade to Premium" gradient card → Paywall
  → Personal Context → Context screen (name, about, values, goals, challenges)
  → Edit Profile (placeholder — no-op)
  → Notifications (placeholder — no-op)
  → Subscription → Paywall
  → Privacy & Security (placeholder — no-op)
  → Help & FAQ (placeholder — no-op)
  → Contact Us (placeholder — no-op)
  → Terms & Privacy (placeholder — no-op)
  → Sign Out

History Tab → Shows conversations (if any), long-press to delete
Create Tab → PremiumGate ("Upgrade to Premium" button → Paywall)
```

**Friction Points:**
- 🔴 1 free message per premium coach is extremely restrictive. User barely gets to experience the value before hitting a wall. The coach responds with a greeting-style message and the user can't follow up. This kills conversion.
- 🔴 Free coaches (tier=FREE) exist in the schema but only 1 seed coach ("Productivity Pro") is FREE. The other 3 are PREMIUM. New users effectively get 1 free coach + 1 sample message on each premium coach. Not enough value to convert.
- 🟡 Sign-up asks for email confirmation but there's no enforcement visible in the code — the alert says "Check Your Email" but the flow continues. Either enforce it or don't mention it.
- 🟡 6 out of 9 Profile menu items are no-ops (do nothing on press). This feels unfinished to users.
- 🟢 Context screen is nice but not surfaced during onboarding — user has to discover it in Profile settings. Missed opportunity for personalization.

**Delightful Moments:**
- ✨ Free preview banner for premium coaches clearly communicates the trial.
- ✨ Conversation starters as speech bubbles reduce "blank page" anxiety.
- ✨ Streaming responses feel real-time and responsive.

---

### 1C. Premium Subscriber

```
Paywall Screen
  → Hero with crown emoji, "Unlock Your Full Potential"
  → Feature list (Unlimited sessions, Create coaches, Context, Early access)
  → Package cards (Monthly/Annual with radio selection)
  → "BEST VALUE" badge on annual
  → "Start Free Trial" CTA (7-day trial)
  → "Restore Purchases" link
  → RevenueCat purchase flow (native iOS/Android)
  → Success: "Welcome to Premium!" alert → back to previous screen

Premium Experience:
  → All coaches: unlimited messaging ✓
  → Create tab: unlocked → Creator Studio
  → Personal Context: injected into all coach conversations ✓
  → Chat: no trial limits, continuous conversations ✓
  → Profile: "Premium Member" badge, renewal date shown
```

**Friction Points:**
- 🟡 After purchasing, user is just sent "back" — no guided moment showing them what's now unlocked. They should be directed to either their first premium chat or the Creator Studio.
- 🟡 The paywall copy mentions "Early Access" as a feature but there's no implementation for this.
- 🟢 No indication of which coaches are premium vs free until you tap into them. The coach card shows "€9.99/mo" price badge on the default variant, but the grid variant on the home screen just says "Try 1 message free" — inconsistent.

**Delightful Moments:**
- ✨ Streaming SSE-based chat works across Anthropic/OpenAI/Google — impressive multi-provider support.
- ✨ User context is seamlessly injected into system prompts, making every coach personalized.

---

### 1D. Creator (Makes Coaches)

```
Create Tab (Premium user)
  → Creator Studio header + "+ New" button
  → List of created coaches (Published/Draft badges, usage stats)
  → Tap existing coach → Edit Coach screen
  → Tap "+ New" → New Coach wizard (5 steps)

Step 1: Identity
  → Avatar (letter picker: A-X — no emoji, no image upload)
  → Coach Name (required, 30 chars)
  → Tagline (required, 100 chars)
  → Description (optional, 500 chars)
  → Category (required, from 7 predefined)
  → Tags (up to 5, with suggestions per category)

Step 2: Personality
  → Coaching Approach (Socratic/Direct/Supportive/Custom)
  → Tone slider (formal ↔ casual, 0-100)
  → Response Style (Concise/Balanced/Detailed)
  → Personality Traits chips

Step 3: Expertise
  → Areas of expertise (free text)
  → Boundaries (what not to do)
  → Example topics

Step 4: Model & Settings
  → Provider selector (Anthropic/OpenAI/Google)
  → Model selector (fetched from API, with recommended flags)
  → Temperature slider
  → System Prompt (auto-generated or manual edit)
  → Greeting Message
  → Conversation Starters (add/remove)
  → Example Conversations (user/assistant pairs)

Step 5: Preview & Test
  → Preview card showing how coach will look
  → [Test conversation would go here]

Bottom: Save Draft / Publish
  → Publish confirmation → Coach goes live
```

**Friction Points:**
- 🔴 Avatar selection is letters A-X only. No emoji, no image upload, no AI-generated avatar. This is the most visible part of a coach and it looks extremely bare. The seed coaches have real avatar images (from `avatars.ts` utility), but user-created coaches only get letters.
- 🔴 No way to test the coach before publishing. Step 5 is "Preview & Test" but there's no test chat interface — just a visual preview. Creators are publishing blind.
- 🟡 System prompt auto-generation is basic. The `generateSystemPrompt()` function creates a reasonable but generic prompt. Competitors let you iterate on personality through conversation testing.
- 🟡 Knowledge Base feature (Notion/Google Docs/file upload) exists in the backend (routes, pipeline, RAG with embeddings) but has NO mobile UI. The web dashboard at `/agents/[id]/knowledge` presumably exposes it, but creators on mobile can't use this differentiating feature.
- 🟡 No analytics for creators. No dashboard showing how many people used their coach, ratings, popular questions, etc. The `usageCount` and `ratingAvg` exist in the schema but aren't surfaced to creators beyond a basic number.
- 🟢 No way to delete a coach from the mobile app (DELETE endpoint exists in API but no UI trigger).

---

## 2. UX ISSUES (Prioritized)

### 🔴 Critical Issues

| # | Screen | Issue | Should Be | Effort |
|---|--------|-------|-----------|--------|
| C1 | Chat | **1 free message is too restrictive.** User sends one message, gets one response, then hard wall. They can't even have a meaningful exchange to judge value. | Allow 3-5 free messages per coach, or unlimited free messages on FREE-tier coaches. This is the #1 conversion killer. | 2h (change `canSendMessage` logic + update `FreeTrial` model to count messages) |
| C2 | Creator | **Avatar is letters only.** Creator coaches look amateurish compared to seed coaches which have real images. First impression of marketplace quality dies here. | Add image upload (camera/gallery) + at minimum emoji picker. Ideally, generate avatars with AI based on coach description. | 4-8h (image upload), 2h (emoji), 8h (AI gen) |
| C3 | Creator | **No way to test coach before publishing.** Creator fills 5 steps, publishes, and hopes for the best. | Add a "Test Chat" button on Step 5 that opens a preview chat with the draft coach (using the same LLM pipeline). | 4-6h |
| C4 | Brand | **App shows "CoachCraft" on welcome screen** but the project is "Better Coaching" everywhere else (README, repo name, hackathon submission). Judges will notice the inconsistency. | Pick one name and use it everywhere. "Better Coaching" aligns with Simon's "Better Creating" brand. | 1h |
| C5 | Auth | **Sign-up mentions email verification but doesn't enforce it.** The alert says "Check Your Email" but there's no email sent and the code doesn't verify. Feels broken. | Either implement email verification (proper) or remove the misleading alert and just sign in directly after registration. | 1h (remove alert) or 8h (implement verification) |

### 🟡 Important Issues

| # | Screen | Issue | Should Be | Effort |
|---|--------|-------|-----------|--------|
| I1 | Profile | **6 menu items are non-functional** (Edit Profile, Notifications, Privacy, Help, Contact, Terms). Tapping them does nothing. | Either implement them or remove/grey them out with "Coming soon" labels. Dead taps feel broken. | 2h (add "Coming soon" toasts + disable appearance) |
| I2 | Home | **"Recommended for you" is not personalized.** It shows the same featured coaches sorted by rating for everyone. The quiz results don't persist or influence recommendations. | Store quiz answers, use category preferences to filter/sort recommendations. Eventually use conversation history for real personalization. | 4h (basic), 16h (ML-based) |
| I3 | Paywall | **Post-purchase experience is empty.** After buying premium, user gets an alert and goes "back." No celebration, no guided tour. | Show a premium welcome screen: "You're Premium! Here's what's new" → highlight Create tab, unlimited chats, context feature. Deep-link to first premium action. | 4h |
| I4 | Onboarding | **No onboarding flow.** New user lands on Home with no guidance on what to do. The quiz exists but isn't part of the main flow. | After registration, auto-launch the quiz or a brief 3-screen onboarding (set context, pick first coach, start chatting). | 6h |
| I5 | Chat | **No greeting message displayed.** The greeting_message is defined for every coach but never shown in the chat view. When a user starts a new conversation, they see the Welcome View (coach detail) and then jump straight to chat with no initial message from the coach. The `startNewConversation` method in the store exists but isn't called. | Display the coach's greeting message as the first "assistant" message when the conversation starts. | 2h |
| I6 | Explore | **Search only matches name, tagline, and exact tag.** No fuzzy search, no description search, no popularity weighting. A user searching "stress" won't find "Mindful Guide" unless "stress" is in the tags. | Add full-text search across name + tagline + description + tags with ranking. PostgreSQL `to_tsvector` is perfect for this. | 4h |
| I7 | Chat | **No markdown rendering in messages.** Coach responses with bullet points, headers, or bold text render as raw text. | Add a markdown renderer (react-native-markdown-display or similar). | 3h |
| I8 | Creator | **Knowledge Base has no mobile UI.** Backend has full Notion/Google Docs/file upload RAG pipeline but creators on mobile can't access it. This is a huge differentiator being hidden. | Even a simple "Add Knowledge" step in the creator wizard that shows a Notion URL input + file upload would surface this feature. | 8-12h |
| I9 | Home | **Category emojis are empty strings** in the seed data. Categories show as blank boxes. | Add actual emojis to seed data: productivity=⚡, career=🚀, wellness=🧘, etc. | 15min |

### 🟢 Nice-to-Fix

| # | Screen | Issue | Should Be | Effort |
|---|--------|-------|-----------|--------|
| N1 | General | **No haptic feedback** on button presses. App feels flat compared to native iOS apps. | Add `Haptics.impactAsync()` on key interactions (send message, navigate, purchase). | 1h |
| N2 | Chat | **No typing indicator animation.** The "Thinking ●●●" is static text. | Animate the dots (pulsing or sequential) for a polished feel. | 1h |
| N3 | Chat | **No message timestamps.** Users can't tell when messages were sent. | Show timestamps (time for today, date for older) below messages. | 1h |
| N4 | Coach Cards | **Rating data is fake/seeded.** Real users see "4.8 ★ (42 reviews)" which are hardcoded seed values. There's no UI for users to leave ratings. | Add post-session rating prompt (1-5 stars + optional review). The `AgentRating` model already exists. | 4h |
| N5 | Explore | **No pagination.** FlatList loads all agents at once. Fine for 4 coaches, but won't scale. | Add infinite scroll with `offset`/`limit` params (API already supports them). | 2h |
| N6 | Creator | **Model name shows raw IDs.** Creator sees "claude-sonnet-4-5-20250929" instead of a friendly name. | Map model IDs to display names (the `SUPPORTED_MODELS` config already has `name` fields — just use them). | 1h |
| N7 | Profile | **No way to change password or delete account.** | Add password change + account deletion (GDPR). | 4h each |
| N8 | General | **No dark mode** despite the design spec having dark mode tokens defined. | Implement dark mode toggle using the defined tokens. | 8h |
| N9 | General | **No loading skeletons** on initial load. The `Skeleton` component exists but isn't used. | Replace ActivityIndicators with skeleton placeholders on Home, Explore. | 2h |
| N10 | Home | **"Add your coach" footer** links to Explore, not Create. Confusing label — it sounds like you're creating a coach. | Either link to Create tab or rename to "Discover more coaches." | 15min |

---

## 3. FEATURE GAPS

### Onboarding
- ❌ **No onboarding wizard.** App opens, user lands on Home, figures it out themselves. Competitors guide you through picking interests, trying a sample conversation, setting goals.
- ❌ **Quiz results don't persist.** The "Find your coach in 60 seconds" quiz is stateless — results aren't saved, don't influence recommendations, and can't be revisited.
- ❌ **Context setup not prompted.** The personal context feature (values, goals, challenges) is powerful but buried in Profile → Personal Context. Should be part of onboarding.

### Coach Discovery
- ❌ **No "For You" algorithm.** Every user sees the same coaches in the same order. No learning from behavior, quiz answers, or conversation history.
- ❌ **No coach comparison.** Can't compare two coaches side-by-side before choosing.
- ❌ **No "Similar coaches" section** on coach detail page.
- ❌ **No reviews/testimonials.** Rating numbers exist but no actual review text is displayed. The `AgentRating` model has a `review` field but there's no UI to write or read reviews.

### Chat Experience
- ❌ **No conversation memory across sessions.** The LLM gets full conversation history from the DB, but there's no summarization or long-term memory. A coach can't reference "what we discussed last week."
- ❌ **No voice input/output.** Simon's audience (creators on the go) would love voice-to-text input and TTS responses. This is a major differentiator opportunity.
- ❌ **No goal tracking or session summaries.** After a coaching session, there's no recap, no action items, no progress tracking. This is core to what makes coaching valuable.
- ❌ **No scheduled check-ins or reminders.** A coaching app should nudge you back: "Time for your weekly review with Productivity Pro."
- ❌ **No export/share conversation.** Can't share an insightful coaching conversation.

### Creator Tools
- ❌ **No analytics dashboard.** Creators can't see session counts, popular topics, user satisfaction, or revenue sharing data.
- ❌ **No knowledge base on mobile.** The RAG pipeline (Notion, Google Docs, file upload, embeddings) is fully built in the backend but invisible to mobile creators.
- ❌ **No coach cloning/templates.** Can't duplicate an existing coach to make variations.
- ❌ **No revenue sharing model.** Creators have no financial incentive to create quality coaches. The "creator economy" part of the pitch has no economic mechanism.

### Social/Sharing Features
- ❌ **No share coach link.** Can't share a coach with friends via URL/deep link.
- ❌ **No user profiles for creators.** Creator's name appears on coach cards but isn't tappable — no creator profile page.
- ❌ **No featured creator spotlights.** No editorial curation of best coaches or creators.
- ❌ **No community/social features.** No way to see what coaches are trending, most popular, recently added.

### Retention Mechanics
- ❌ **No push notifications.** The `BellIcon` exists in Profile but notifications aren't implemented.
- ❌ **No streaks or engagement gamification.** Daily coaching streaks would drive retention.
- ❌ **No session history insights.** "You've had 12 sessions this month, focusing on productivity."
- ❌ **No coach "follow" or "favorite" feature.** Can't bookmark coaches for later.

---

## 4. COMPETITIVE ANALYSIS

### The Landscape

| Feature | Better Coaching | Character.ai | Poe | ChatGPT Custom GPTs | Replika |
|---------|----------------|--------------|-----|---------------------|---------|
| **Focus** | AI coaching marketplace | AI character roleplay | Multi-model chat | Custom GPT store | AI companion |
| **Free tier** | 1 msg/coach | ~80 msgs/day | Limited msgs | Free with limits | Limited free |
| **Monetization** | Platform subscription | $9.99/mo | $19.99/mo | $20/mo (ChatGPT+) | $19.99/mo |
| **Creator tools** | 5-step wizard | Simple description | Prompt-based | GPT Builder | No creators |
| **Knowledge base** | RAG pipeline (backend only) | No | No | File upload + RAG | No |
| **Personalization** | User context injection | Memory system | No | Memory + instructions | Deep personality |
| **Multi-model** | Claude + GPT + Gemini | Proprietary | Multiple LLMs | GPT only | Proprietary |
| **Voice** | No | No | No | Yes (native) | Yes |
| **Mobile native** | React Native | Native | React Native | Wrapper | Native |

### Better Coaching's Differentiators
1. **Coaching-specific framing.** Not a chatbot, not a companion — positioned as professional coaching. This matters for Simon's productivity/design audience who want results, not entertainment.
2. **User context system.** The personal context (values, goals, challenges) injected into every conversation is more structured than competitors' memory systems. This is genuinely useful for coaching.
3. **Multi-model choice for creators.** Creators can pick Claude, GPT, or Gemini based on their coaching style. No competitor offers this.
4. **Knowledge base/RAG pipeline.** The backend supports Notion pages, Google Docs, and file uploads as knowledge sources with vector embeddings. This is a serious differentiator — coaches can be grounded in real methodology/content. **But it's invisible on mobile.**
5. **RevenueCat-native monetization.** Built for the hackathon's focus — the subscription infrastructure is clean and functional.

### What's Missing vs. Competitors
1. **Scale of content.** Character.ai has millions of characters. Better Coaching has 4 seed coaches. The marketplace is empty without content.
2. **Chat quality features.** No markdown, no voice, no images, no typing indicators. ChatGPT's chat experience is the gold standard and this falls short.
3. **Retention mechanics.** Character.ai keeps users with deep personality/memory. Replika uses emotional connection. Better Coaching has no retention hook beyond the coaching value itself.
4. **Discovery.** No algorithm, no trending, no editorial curation. With 4 coaches, this isn't a problem yet — but the framework for scale isn't there.
5. **Social proof.** Fake/seeded ratings with no real review system. Users have no way to judge coach quality beyond trying it.

---

## 5. MONETIZATION STRATEGY

### Current State
- **Model:** Platform subscription via RevenueCat
- **Tiers:** FREE (1 msg/coach) → PREMIUM (unlimited + create)
- **Pricing:** $9.99/month or $79.99/year (from README)
- **Free trial:** 7 days
- **Schema also has:** CREATOR tier (unused), token tracking on messages (unused)

### Proposed Pricing

#### Tier 1: Free (Discovery)
| What's included | Details |
|-----------------|---------|
| Browse all coaches | Unlimited browsing, search, categories |
| Coach quiz | "Find your match" personalization |
| 5 messages per coach | Enough for a meaningful first session |
| 1 active conversation | Can only have 1 ongoing chat |
| Basic personal context | Name + goals only |

**Rationale:** 5 messages (not 1!) lets users experience a real coaching exchange. The "1 active conversation" limit creates natural upgrade pressure without feeling punitive.

#### Tier 2: Premium — $7.99/month or $49.99/year
| What's included | Details |
|-----------------|---------|
| Unlimited messaging | All coaches, no limits |
| Unlimited conversations | Multiple coaches simultaneously |
| Full personal context | Values, challenges, additional info |
| Session summaries | AI-generated recaps after each session |
| Priority responses | Faster model inference |
| Coaching history & insights | Track progress over time |

**Rationale:** $7.99/month (not $9.99) hits the "impulse buy" threshold for Simon's audience — design/productivity professionals who already spend on tools. The annual plan at $49.99 (~$4.17/month) is a strong value prop with 48% savings. This is below Character.ai ($9.99) and well below Poe ($19.99) — defensible for a focused coaching app.

#### Tier 3: Creator — $14.99/month or $99.99/year
| What's included | Details |
|-----------------|---------|
| Everything in Premium | All consumer features |
| Creator Studio | Build unlimited coaches |
| Knowledge Base | Upload docs, connect Notion |
| Analytics dashboard | Usage stats, ratings, popular topics |
| Custom model selection | Choose Claude/GPT/Gemini |
| Revenue sharing (future) | Earn from your coaches' usage |

**Rationale:** Creators are the supply side of the marketplace. The Creator tier needs to feel premium and exclusive. $14.99/month is reasonable for a professional tool — comparable to a Notion or Figma subscription.

### What the Hackathon Judges Want to See

RevenueCat's Shipyard hackathon specifically evaluates:

1. **RevenueCat integration depth.** ✅ The app has proper SDK setup, webhook handling, entitlement checking, purchase flow, and restore purchases. This is solid.

2. **Monetization sophistication.** The current binary free/premium split is basic. Judges want to see:
   - **Pricing psychology:** Free trial, annual discount, "BEST VALUE" badge ✅
   - **Paywall design:** Feature comparison, clear value proposition ✅
   - **Conversion funnel awareness:** Where do free users hit walls? Currently at 1 message — too aggressive.
   - **Metrics thinking:** Show you know CAC, LTV, conversion rate, churn. Add a slide about projected metrics.

3. **Creator economy angle.** The hackathon is "Creator Contest" — they want to see how CREATORS monetize through your platform. Currently, creators get nothing. The revenue sharing model should at least be articulated (even if not implemented): "Creators earn 70% of revenue from users who subscribe specifically for their coach."

4. **Scalability of the model.** Can this grow? The marketplace structure with categories, search, ratings, and creator tools suggests yes. But the empty marketplace (4 seed coaches) is a problem for the demo.

### Revenue Projections (Realistic)

| Metric | Month 1 | Month 3 | Month 6 | Year 1 |
|--------|---------|---------|---------|--------|
| Downloads (organic + launch) | 500 | 1,500 | 5,000 | 15,000 |
| Free users | 400 | 1,050 | 3,000 | 8,000 |
| Trial starts (15% of free) | 60 | 158 | 450 | 1,200 |
| Premium subscribers (40% convert) | 24 | 63 | 180 | 480 |
| Creator subscribers (5% of premium) | 1 | 3 | 9 | 24 |
| **Monthly revenue** | **$205** | **$540** | **$1,540** | **$4,090** |
| **Annual run rate** | **$2,460** | **$6,480** | **$18,480** | **$49,080** |

*Assumptions: $7.99/month premium, $14.99/month creator, 8% monthly churn, organic growth from Simon's audience (~20K Twitter/YouTube following).*

**Honest assessment:** This is a niche coaching app, not the next Character.ai. Year 1 revenue of ~$50K is realistic if Simon promotes it to his existing audience. The real upside is if the creator marketplace takes off — each quality creator brings their own audience.

### Alternative Monetization Models Considered

| Model | Pros | Cons | Verdict |
|-------|------|------|---------|
| **Per-coach subscription** | Aligns creator incentives; users pay for what they use | Complex UX; users resist multiple subscriptions | ❌ Too complex for launch |
| **Credits/tokens** | Usage-based feels fair; maps to LLM costs | Anxiety-inducing ("am I wasting credits?"); hard to price | ❌ Wrong for coaching (trust needs unlimited feel) |
| **Platform subscription** (chosen) | Simple; Netflix model works; predictable revenue | Creators have no direct revenue incentive | ✅ Best for hackathon + launch |
| **Freemium + tips** | Low friction; voluntary pay | Unpredictable revenue; low conversion | ❌ Too risky |
| **Hybrid: Platform sub + creator tips** | Best of both; creators earn directly | Implementation complexity | ⭐ Best long-term (V2) |

---

## 6. RECOMMENDED PRIORITIES (This Week — Before Feb 12)

### 🏆 DO THESE (High Impact, Necessary to Win)

| Priority | Task | Impact | Effort | Why |
|----------|------|--------|--------|-----|
| **P1** | Fix brand consistency → "Better Coaching" everywhere | Critical | 1h | Judges will notice "CoachCraft" vs "Better Coaching" instantly. Pick the hackathon name. |
| **P2** | Increase free trial to 5 messages per coach | Critical | 2h | 1 message kills conversion. 5 messages lets users experience real coaching value. This is the single highest-impact change for the demo. |
| **P3** | Add 6-8 more seed coaches across all categories | Critical | 3h | An "AI coaching marketplace" with 4 coaches looks like a demo, not a product. Add Learning, Finance, Relationships coaches. Make at least 2-3 FREE tier. |
| **P4** | Fix empty category emojis | Quick win | 15min | Categories currently show blank — add ⚡🚀🧘✨💬💰📚 |
| **P5** | Add coach greeting message to chat | High | 2h | Currently the coach's greeting is invisible. Display it as the first message — it immediately makes the coach feel alive. |
| **P6** | Remove or fix email verification alert | Medium | 30min | The "Check Your Email" alert during signup is misleading. Just remove it and sign in directly. |
| **P7** | Surface Knowledge Base for demo | High | 4h | The RAG pipeline is a killer differentiator but invisible on mobile. At minimum, add a "Knowledge" section in the creator wizard showing a Notion URL input. For the demo video, show this working. |
| **P8** | Disable no-op menu items | Quick win | 1h | Grey out Edit Profile, Notifications, Privacy, Help, Contact, Terms with "Coming soon" overlay. Dead taps look broken. |

### ⚡ DO IF TIME ALLOWS (Polish that Wins)

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| **P9** | Add markdown rendering in chat | Medium | 3h |
| **P10** | Add post-purchase celebration screen | Medium | 3h |
| **P11** | Basic onboarding (context setup after signup) | Medium | 4h |
| **P12** | Add rating prompt after 5+ messages with a coach | Medium | 3h |
| **P13** | Add haptic feedback on key interactions | Polish | 1h |
| **P14** | Animate typing indicator dots | Polish | 1h |

### ❌ DO NOT SPEND TIME ON

- Dark mode (8h, no demo impact)
- Push notifications (complex, no demo impact)
- Image upload for avatars (nice but not demo-critical)
- Full analytics dashboard (backend complexity)
- Pagination (only matters at scale)
- Voice input/output (would be amazing but too much scope)

### 📹 Demo Strategy

The hackathon demo video should show this flow:
1. **Cold open:** "What if everyone had access to a personal coach?" (Simon's Better Creating brand)
2. **Browse:** Show the marketplace with 10+ coaches, beautiful cards, quiz matching
3. **Free trial:** Experience a real coaching conversation (5 messages) that's actually helpful
4. **Hit the wall:** "Want more? Upgrade to Premium" — show the paywall with RevenueCat
5. **Premium unlock:** Show unlimited chatting, personal context being used
6. **Creator flow:** Build a coach in 5 steps, connect knowledge base, publish
7. **RevenueCat dashboard:** Show real subscription data, webhook events, entitlement management
8. **Close:** Revenue projections, creator economy vision

**The money shot for judges:** Show the RevenueCat dashboard with actual subscription events flowing through. This is a RevenueCat hackathon — they want to see their product being used well.

---

*Audit performed by analyzing all mobile screens, backend routes, services, stores, types, seed data, Prisma schema, and design spec. No code was run — this is a static analysis of the full codebase.*
