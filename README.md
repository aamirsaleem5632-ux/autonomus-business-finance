# Autonomous Business Finance Platform

> Industrial-grade, browser-based autonomous business finance platform architecture and development foundation (Phase 1).

---

## 1. Overview

The **Autonomous Business Finance Platform** is engineered to provide an enterprise-grade substrate for high-assurance financial operations, data persistence, and automated execution workflows.

This repository contains the completed **Phase 1: Architecture & Development Environment Initialization**. It delivers:
- A decoupled, strictly typed **React 19 + TypeScript + Vite + Tailwind CSS** frontend.
- A modular **Node.js + NestJS 12 + TypeScript** REST backend API.
- **PostgreSQL** relational database persistence configured with **Prisma ORM (v6)**.
- Unified **ESLint & Prettier** code quality enforcement across all workspaces.
- Standardized `/api` routing prefix with global error normalization (`GlobalHttpExceptionFilter`).
- Centralized environment variable management with zero hardcoded credentials.

---

## 2. Project Architecture & Structure

```
autonomous-business-finance/
├── backend/                             # NestJS 12 Application
│   ├── prisma/
│   │   └── schema.prisma                # PostgreSQL data schema & models
│   ├── src/
│   │   ├── common/
│   │   │   ├── filters/                 # GlobalHttpExceptionFilter
│   │   │   └── interceptors/            # LoggingInterceptor & metrics
│   │   ├── config/                      # Dynamic configuration loader
│   │   ├── health/                      # Health check module & controller
│   │   ├── prisma/                      # PrismaService & PrismaModule
│   │   ├── app.module.ts                # Root application module
│   │   └── main.ts                      # Server bootstrap & global prefix
│   ├── test/                            # Vitest E2E integration tests
│   ├── .env.example                     # Environment variable template
│   ├── eslint.config.mjs                # ESLint configuration
│   └── tsconfig.json                    # TypeScript configuration
├── frontend/                            # React 19 + Vite Application
│   ├── src/
│   │   ├── api/                         # Typed API client & health queries
│   │   ├── components/                  # UI components (Navbar, HealthCard, etc.)
│   │   ├── types/                       # Shared TypeScript interface definitions
│   │   ├── App.tsx                      # Main dashboard page
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

# 2. Setup backend environment file
cp backend/.env.example backend/.env

# 3. Setup frontend environment file
cp frontend/.env.example frontend/.env
```

### 4.3 Database Initialization (Optional for Local PostgreSQL)

If you have Docker installed, start a local PostgreSQL container:

```bash
docker compose up -d
```

Generate the Prisma Client:

```bash
npm run prisma:generate
```

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
