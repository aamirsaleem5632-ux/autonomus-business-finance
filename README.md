# Autonomous Business Finance Platform

> A business finance operations dashboard with PostgreSQL-backed financial records, deterministic specialist analyses, and clearly labeled simulated data when no database is connected.

---

## 1. Overview

The **Business Autonomous Finance** project builds on its original application foundation with a financial dashboard, typed APIs, auditable record ingestion, and coordinated finance-analysis agents.

The current implementation delivers:
- A decoupled, strictly typed **React 19 + TypeScript + Vite + Tailwind CSS** frontend.
- A modular **Node.js + NestJS 12 + TypeScript** REST backend API.
- **PostgreSQL** relational database persistence configured with **Prisma ORM (v6)**.
- Income, expense, account-balance, budget, receivable, payable, and agent-run data models.
- Five deterministic finance specialists and a rules-based assistant that delegates analyses and presents evidence.
- Input-validated, role-keyed ingestion APIs with audit logging; no payment execution or money transfer functionality.
- Clearly labeled simulated dashboard data when the database contains no finance records or is not configured.

No bank-feed credentials or external LLM provider are configured in this repository. The assistant is explicitly rules-based rather than a simulated external AI integration.

---

## 2. Project Architecture & Structure

```
autonomous-business-finance/
├── backend/                             # NestJS 12 Application
│   ├── prisma/
│   │   ├── schema.prisma                # PostgreSQL data schema & models
│   │   └── migrations/                  # Finance domain and audit schema
│   ├── src/
│   │   ├── common/
│   │   │   ├── filters/                 # GlobalHttpExceptionFilter
│   │   │   └── interceptors/            # LoggingInterceptor & metrics
│   │   ├── config/                      # Dynamic configuration loader
│   │   ├── health/                      # Health check module & controller
│   │   ├── finance/                     # Data APIs, orchestration, deterministic agents
│   │   ├── prisma/                      # PrismaService & PrismaModule
│   │   ├── app.module.ts                # Root application module
│   │   └── main.ts                      # Server bootstrap & global prefix
│   ├── test/                            # Vitest E2E integration tests
│   ├── .env.example                     # Environment variable template
│   ├── eslint.config.mjs                # ESLint configuration
│   └── tsconfig.json                    # TypeScript configuration
├── frontend/                            # React 19 + Vite Application
│   ├── src/
│   │   ├── api/                         # Typed API client & finance/health queries
│   │   ├── components/                  # Dashboard, assistant, health components
│   │   ├── types/                       # Shared TypeScript interface definitions
│   │   ├── App.tsx                      # Finance command center
│   │   ├── index.css                    # Tailwind CSS v4 setup
│   │   └── main.tsx                     # React client bootstrap
│   ├── .env.example                     # Frontend environment template
│   ├── eslint.config.js                 # ESLint configuration
│   ├── vite.config.ts                   # Vite build & /api dev proxy
│   └── tsconfig.json                    # TypeScript configuration
├── docs/                                # Technical Architecture & Guides
│   ├── ARCHITECTURE.md                  # Tier & dataflow documentation
│   ├── DATABASE_SETUP.md                # PostgreSQL & Prisma guide
│   ├── API_REFERENCE.md                 # REST API endpoints & contracts
│   └── DEVELOPMENT_GUIDE.md             # Developer workflow & scripts
├── docker-compose.yml                   # Optional local PostgreSQL service
├── package.json                         # Root workspace orchestrator
├── README.md                            # Primary documentation
└── .gitignore                           # Git ignore rules
```

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | 19.x | Component-driven user interface |
| **Frontend** | TypeScript | 6.x | Strict static type safety |
| **Frontend** | Vite | 8.x | High-speed build tooling & dev proxy |
| **Frontend** | Tailwind CSS | 4.x | Industrial-grade responsive styling |
| **Backend** | NestJS | 12.x | Modular enterprise REST API framework |
| **Backend** | Node.js | >= 20.x | Server runtime environment |
| **Database** | PostgreSQL | 16.x | Relational ACID database |
| **ORM** | Prisma | 6.x | Type-safe query engine & schema migrations |
| **Tooling** | ESLint & Prettier | Latest | Code linting, formatting, quality gates |

---

## 4. Getting Started

### 4.1 Prerequisites
- **Node.js**: `v20.x` or higher (verified on Node `v24.x`)
- **npm**: `v10.x` or higher
- **Docker** *(optional)*: For running local PostgreSQL with one command

### 4.2 Clone & Environment Configuration

```bash
# 1. Clone repository
git clone <repo-url>
cd autonomous-business-finance

# 2. Setup backend environment file and replace CHANGE_ME
cp backend/.env.example backend/.env

# 3. Create a root .env file containing a private local database password
#    POSTGRES_PASSWORD=<your-local-password>
```

### 4.3 Database Initialization (Optional for Local PostgreSQL)

If you have Docker installed, configure `POSTGRES_PASSWORD` in the root `.env` file and start PostgreSQL:

```bash
docker compose up -d
```

Generate the Prisma Client:

```bash
npm run prisma:generate
npm run prisma:validate
npm run prisma:migrate
```

When a database URL is configured, set separate random `FINANCE_VIEWER_API_KEY` and `FINANCE_ADMIN_API_KEY` values (at least 32 characters) in `backend/.env`. Use the viewer key to read data and run analyses; the admin key also allows financial record ingestion. The dashboard prompts for the viewer key and keeps it in memory only.

---

## 5. Running the Application

### Option A: Run Both Services from Root
```bash
# Terminal 1: Start Backend (http://localhost:3000)
npm run dev:backend

# Terminal 2: Start Frontend (http://localhost:5173)
npm run dev:frontend
```

### Option B: Run Inside Respective Directories
```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev
```

---

## 6. Verification & Health Check

The finance dashboard is available at the frontend root. Without a configured/seeded database, it identifies its records as **simulated**. With a migrated database, use the protected ingestion endpoints in [API_REFERENCE.md](./docs/API_REFERENCE.md) to add your validated records. Ingestion records data only; the platform does not initiate payments or transfers.

### 6.1 Backend Health-Check Endpoint
```bash
curl -i http://localhost:3000/api/health
```

Expected JSON response:
```json
{
  "status": "degraded",
  "service": "autonomous-business-finance-backend",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-11-07T04:57:32.794Z",
  "uptimeSeconds": 16,
  "memory": {
    "heapUsedMB": 18.24,
    "heapTotalMB": 19.94,
    "rssMB": 69.52
  },
  "database": {
    "status": "connected",
    "details": "PostgreSQL database responsive"
  }
}
```

### 6.2 Error Handling Verification
```bash
curl -i http://localhost:3000/api/health/error-demo
```

Expected JSON response:
```json
{
  "statusCode": 400,
  "timestamp": "2026-11-07T04:58:11.671Z",
  "path": "/api/health/error-demo",
  "method": "GET",
  "message": "Demonstration of GlobalHttpExceptionFilter handling validation or client errors.",
  "error": "Bad Request"
}
```

---

## 7. Quality Gates (Build, Lint, Test)

Run the full verification suite across both backend and frontend:

```bash
# Lint both applications
npm run lint

# Build both applications
npm run build

# Run backend unit and E2E integration tests
npm run test
```

---

## 8. License

Proprietary enterprise software. All rights reserved.
