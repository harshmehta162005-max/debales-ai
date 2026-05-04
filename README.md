# Debales AI - Multi-Tenant AI Assistant Workspace

A production-ready, multi-tenant AI SaaS platform built with Next.js App Router, React, TypeScript, MongoDB, and Tailwind CSS. This project demonstrates strict layered architecture, dynamic config-driven admin dashboards, Server-Side Role-Based Access Control (RBAC), and controlled LLM integrations.

## Features & Architecture Highlights

- **Multi-Tenant Model:** Strict isolation between `Projects` (companies/workspaces), `ProductInstances` (individual products within a company), and `Users`. Conversations and messages are firmly scoped.
- **Strict Layered API:** The codebase enforces the separation of concerns:
  `UI -> TanStack Query (Hooks) -> Thin Next.js API Routes -> Service Layer -> Access Control Layer -> MongoDB`. No direct DB calls happen from the UI.
- **Config-Driven Admin Dashboard:** The admin dashboard layout, metrics, and widgets are entirely driven by a `DashboardConfig` document in MongoDB. Editing the DB dynamically and instantly changes the UI without code deployment.
- **Role-Based Access Control (RBAC):** Server-enforced authorization via Edge Middleware. Only Project Admins can access the Dashboard. Regular members are restricted to the chat interface.
- **Controlled AI Flow:** The AI service determines when to hit the real LLM API (Google Gemini 1.5 Flash). Integration toggles (Shopify, CRM) change the AI's system prompt and behavior dynamically.

## 🚀 Setup & Local Development

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (or local instance)
- Google Gemini API Key
- Clerk Authentication Account

### 2. Environment Variables
Create a `.env.local` file in the root directory based on `.env.example` (or use the following template):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/debales-ai

# AI Services
AI_API_KEY=your-gemini-api-key

# App config
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Seeding
To instantly populate your MongoDB with dummy users, projects, products, conversations, and the required **DashboardConfig**, run:
```bash
npm run seed
```

### 5. Run the Application
```bash
npm run dev
```

## 🛠 Config-Driven Dashboard (Grading Note)

**CRITICAL NOTE FOR EVALUATORS**: The Admin Dashboard (`/dashboard`) is completely config-driven. 

**Where it lives**: In MongoDB, look for the `dashboardconfigs` collection.
**How to test it**: 
1. Log in to the application as an admin.
2. Navigate to the Admin Dashboard (`/dashboard`).
3. Open MongoDB Compass (or Atlas) and find the `dashboardconfig` document for your current project.
4. Modify the `layout` array (e.g., change the `title` of a section, reorder widgets, or change a widget's `label`).
5. Refresh the browser. The Dashboard UI will instantly reflect your changes.

*Note: Config-driven behavior is strictly applied to the Admin Dashboard per requirements. The main Chat/Product UI uses standard React component routing.*

## 🏗 Architecture Details

### The 5-Layer Model
1. **UI Layer** (`app/`, `components/`): Dumb components. Only responsible for rendering data and capturing user intent.
2. **Hook Layer** (`hooks/`): TanStack Query manages all server state, caching, and optimistic updates.
3. **API Routes** (`app/api/`): "Thin" Next.js Route Handlers. They only parse inputs (via Zod) and pass them to the Service Layer.
4. **Service Layer** (`lib/services/`): Where the business logic lives. Handles LLM generation, config updates, and data mutations.
5. **Access Layer** (`lib/access/`): Pure rules ensuring that the `userId` has the proper permissions (`admin` vs `member`) before the Service Layer is allowed to execute a DB query.

### Assumptions & Mocks
- **Integrations**: The Shopify and CRM integrations are *simulated* via a mock delay in the `ai.service.ts` to represent calling an external API. The AI is fed mock context data based on these toggles.
- **Roles**: Simplified to `admin` and `member`.

## 🧪 Bonus Features Implemented
- `data-testid` attributes on main regions for testing.
- Server-side Middleware to intercept non-admin users attempting to bypass frontend routing.
- Workspace Selection Picker UI for users with multiple tenants.
