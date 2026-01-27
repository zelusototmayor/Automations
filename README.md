# Better Coaching 🧠

A beautiful, minimal mobile app where users can discover, create, and share AI coaching agents.

Built for the [RevenueCat Shipyard 2026 Hackathon](https://revenuecat-shipyard-2026.devpost.com/).

## 🎯 What is Better Coaching?

Better Coaching democratizes access to coaching by making it easy for anyone to get personalized guidance from AI coaches, while empowering creators to build and monetize their own coaching agents.

### Key Features

- **Browse & Discover**: Find coaches across categories like productivity, wellness, career, and more
- **1 Free Message**: Try any coach with a free sample message before subscribing
- **Personal Context**: Add your values, goals, and challenges for personalized coaching
- **Creator Studio**: Build your own AI coaches with full prompt editing (premium)
- **Multi-Model Support**: Creators can choose Claude, GPT-4, or Gemini for their coaches

## 🏗 Project Structure

```
bettercoaching/
├── mobile/          # React Native + Expo app
│   ├── app/         # Expo Router screens
│   ├── src/
│   │   ├── components/
│   │   ├── services/  # API, Auth, RevenueCat
│   │   ├── stores/    # Zustand state management
│   │   └── types/
│   └── ...
├── backend/         # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   └── prisma/      # Database schema
├── docker-compose.yml
└── README.md
```

## 🛠 Tech Stack

### Mobile
- React Native + Expo
- Expo Router (file-based routing)
- NativeWind (Tailwind CSS)
- Zustand (state management)
- RevenueCat SDK (subscriptions)

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication (access + refresh tokens)
- Multi-LLM support (Claude, GPT-4, Gemini)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- At least one AI API key (Anthropic, OpenAI, or Google)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add:
# - DATABASE_URL (your PostgreSQL connection)
# - JWT_SECRET (generate with: openssl rand -hex 32)
# - JWT_REFRESH_SECRET (generate another one)
# - At least one AI API key

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data (optional)
npm run db:seed

# Start development server
npm run dev
```

### Mobile Setup

```bash
cd mobile

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your API URL

# Start Expo
npm start
```

Press `i` for iOS simulator or `a` for Android emulator.

## 🐳 Docker Deployment

```bash
# Copy production env template
cp .env.production.example .env

# Edit .env with production values:
# - DB_PASSWORD
# - JWT_SECRET (generate: openssl rand -hex 32)
# - JWT_REFRESH_SECRET (generate: openssl rand -hex 32)
# - AI API keys

# Start services
docker-compose up -d

# Run database migrations
docker-compose exec api npx prisma db push

# Seed database (optional)
docker-compose exec api npx prisma db seed
```

The API will be available at `http://localhost:3001`.

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Agents (Coaches)
- `GET /api/agents` - List published agents
- `GET /api/agents/featured` - Featured agents
- `GET /api/agents/categories` - Categories
- `GET /api/agents/mine` - User's created agents
- `POST /api/agents` - Create agent
- `PATCH /api/agents/:id` - Update agent
- `POST /api/agents/:id/publish` - Publish agent

### Chat
- `POST /api/chat/message` - Send message (SSE streaming)
- `GET /api/chat/conversations` - User's conversations
- `GET /api/chat/conversations/:id` - Conversation with messages

### Users
- `GET /api/users/me` - Current user profile
- `PATCH /api/users/me/context` - Update personal context

## 📱 App Screens

| Screen | Description |
|--------|-------------|
| **Home** | Featured coaches, categories, quick access |
| **Explore** | Search and filter all coaches |
| **Chat** | Streaming chat with coaches |
| **Create** | Creator studio for building coaches (premium) |
| **History** | Previous conversations |
| **Profile** | Settings, context, subscription |
| **Paywall** | Premium subscription flow |

## 💳 Monetization Model

- **Free tier**: Browse coaches, 1 free message per coach
- **Premium** ($9.99/month or $79.99/year):
  - Unlimited messaging with all coaches
  - Create and publish your own coaches
  - Personalized context injection
  - Priority response times

## 🧪 Testing

### Demo Account
After seeding, you can login with:
- **Email**: demo@bettercoaching.app
- **Password**: demo1234

### API Testing
```bash
# Health check
curl http://localhost:3001/health

# Get featured agents
curl http://localhost:3001/api/agents/featured

# Get categories
curl http://localhost:3001/api/agents/categories
```

## 📄 License

MIT License

---

Built with ❤️ for the [RevenueCat Shipyard: Creator Contest](https://revenuecat-shipyard-2026.devpost.com/)
