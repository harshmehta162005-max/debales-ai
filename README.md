# Debales AI — Multi-Tenant AI Assistant Platform

A production-grade, multi-tenant SaaS application featuring a **config-driven admin dashboard**, **real AI chat powered by Google Gemini 1.5 Flash**, and deep integration with Shopify and CRM platforms.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.local.example .env.local
# Fill in your MONGODB_URI and AI_API_KEY

# 3. Seed the database with demo data
npm run seed

# 4. Start the dev server
npm run dev
# → http://localhost:3001

# 5. Login with a demo account
#    admin@acme.com  (Acme Corp project)
#    admin@beta.com  (Beta Startup project)
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Base URL (e.g., `http://localhost:3001`) |
| `AI_API_KEY` | ✅ | Google Gemini API key from [aistudio.google.com](https://aistudio.google.com/apikey) |
| `SESSION_SECRET` | ✅ | Secret for HMAC signing of session cookies (any strong string) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser / Next.js UI                  │
│  Landing Page → Login → Dashboard → Chat                │
│  TanStack Query hooks (useProjects, useMessages, etc.)  │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP (cookies)
┌───────────────────────────▼─────────────────────────────┐
│              API Route Handlers (app/api/*)              │
│  Thin layer — extract cookie session → delegate         │
│  getSessionUserId() → Zod.parse(body) → service call   │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│              Service Layer (lib/services/*)              │
│  All business logic, AI calls, DB writes                │
│  Every function calls Access Layer FIRST                │
└──────────────┬────────────────────────────┬─────────────┘
               │                            │
┌──────────────▼──────────┐    ┌────────────▼─────────────┐
│  Access Layer           │    │  Models (lib/models/*)   │
│  (lib/access/index.ts)  │    │  Mongoose + Zod schemas  │
│  Pure auth rules        │    │  Project, User, Message  │
│  canAccessProject()     │    │  DashboardConfig, etc.   │
│  requireAccess()        │    └──────────────────────────┘
└─────────────────────────┘
               │
┌──────────────▼──────────┐
│  Core Service           │
│  (lib/services/core)    │
│  Internal DB fetchers   │
│  Used ONLY by access    │
└─────────────────────────┘
               │
┌──────────────▼──────────┐
│  MongoDB (Atlas)        │
│  6 collections          │
└─────────────────────────┘
```

### Key Architecture Principles
1. **Strict layering**: UI → API Routes → Service Layer → Access Layer → Models. No layer skips.
2. **Access-first**: Every service function calls `requireAccess()` before any DB operation.
3. **Thin routes**: API handlers only parse auth, validate input (Zod), call one service function, return JSON.
4. **Cookie-based auth**: HMAC-signed HTTP-only cookies — no `localStorage`, no bearer tokens.

---

## Multi-Tenant Model

Each **Project** has `members: [{ userId, role }]`. Users can only access projects where they appear in the members array.

```
User (admin@acme.com)          User (admin@beta.com)
        │                               │
        ▼                               ▼
  Project: acme-corp              Project: beta-startup
  ├── ProductInstances (2)        ├── ProductInstances (2)
  ├── Conversations (N)           ├── Conversations (N)
  └── DashboardConfig             └── DashboardConfig
```

**Switch users**: Use the User menu → "Switch Demo User" to see how the platform shows completely different data per tenant.

---

## Config-Driven Dashboard

The entire dashboard layout is stored in MongoDB as a `DashboardConfig` document:

```json
{
  "projectId": "<ObjectId>",
  "layout": [
    {
      "id": "overview",
      "type": "section",
      "title": "Overview",
      "widgets": [
        { "type": "stat", "label": "Total Users", "valueKey": "total_conversations" },
        { "type": "chart", "label": "Activity", "valueKey": "revenue" },
        { "type": "list", "label": "Recent Chats", "valueKey": "recent_chats" },
        { "type": "table", "label": "Integration Status", "valueKey": "integrations" }
      ]
    }
  ]
}
```

**To test the config-driven behavior:**
1. Open MongoDB Compass → `debales-ai.dashboardconfigs`
2. Find the acme-corp document
3. Change a widget's `label` from `"Revenue"` to `"Weekly Revenue"`
4. Save and hard-refresh the dashboard → label updates instantly, no code change

---

## API Reference

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | DB health check |
| `POST` | `/api/auth/login` | Login (sets HTTP-only cookie) |
| `POST` | `/api/auth/logout` | Logout (clears cookie) |
| `GET` | `/api/auth/me` | Get current user from session |
| `GET` | `/api/projects` | List user's projects |
| `GET` | `/api/projects/:slug` | Get project by slug |
| `GET` | `/api/projects/:slug/conversations` | List conversations |
| `POST` | `/api/projects/:slug/conversations` | Create conversation |
| `GET` | `/api/projects/:slug/messages?conversationId=X` | Get messages |
| `POST` | `/api/projects/:slug/messages` | Send message (triggers AI) |
| `GET` | `/api/projects/:slug/product-instances` | List product instances |
| `PATCH` | `/api/projects/:slug/product-instances/:piId` | Toggle integrations |
| `GET` | `/api/projects/:slug/stats` | Real project statistics |
| `GET` | `/api/dashboard/config?projectSlug=X` | Get dashboard config |
| `PATCH` | `/api/dashboard/config?projectSlug=X` | Update dashboard config |

---

## Seeded Demo Data

After `npm run seed`:

| Entity | Count |
|--------|-------|
| Projects | 2 (acme-corp, beta-startup) |
| Users | 2 (admin@acme.com, admin@beta.com) |
| ProductInstances | 4 (2 per project) |
| DashboardConfigs | 2 (1 per project) |
| Conversations | 4 (2 per project) |
| Messages | 8 (2 per conversation) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | MongoDB with Mongoose |
| AI | Google Gemini 1.5 Flash |
| Styling | Tailwind CSS v4 + Custom CSS Design System |
| State | TanStack React Query v5 |
| Validation | Zod v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Auth | HMAC-signed HTTP-only cookies |

---

## Assumptions & Known Limitations

- **Auth is demo-grade**: Cookie auth is HMAC-signed (not JWT) — sufficient for demo, not production OAuth.
- **AI model**: Uses `gemini-1.5-flash` (free tier). Rate limits apply — if you hit limits, the service falls back gracefully.
- **Integration data**: Shopify and CRM integration steps use mock data from `ProductInstance.integrations.mockData`. Real APIs are not called.
- **Charts**: Weekly activity chart uses mock day-of-week data for visual demonstration. Real time-series from DB can be wired using the `stats` endpoint.
