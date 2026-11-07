# Autonomous Business Finance Platform - Backend Service

NestJS 12 enterprise REST API backend service with PostgreSQL persistence via Prisma ORM.

## Architecture & Structure
```
backend/
├── prisma/
│   └── schema.prisma           # Prisma schema definition
├── src/
│   ├── common/
│   │   ├── filters/            # Global exception filters
│   │   └── interceptors/       # Telemetry & execution time logging
│   ├── config/                 # Dynamic configuration loader
│   ├── health/                 # Health check endpoint controller & service
│   ├── prisma/                 # Prisma client service wrapper & pool
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Bootstrap entrypoint & global prefix (/api)
├── test/                       # E2E integration tests
├── .env.example                # Safe environment variable template
├── eslint.config.mjs           # ESLint configuration
└── tsconfig.json               # TypeScript configuration
```

## Setup & Running
```bash
# Copy environment configuration
cp .env.example .env

# Generate Prisma Client
npm run prisma:generate

# Start development server
npm run start:dev

# Run tests
npm run test
npm run test:e2e
```
