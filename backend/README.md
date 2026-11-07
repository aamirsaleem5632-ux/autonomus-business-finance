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
│   ├── finance/                # Finance APIs, specialist analyses, assistant orchestration
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
# Replace CHANGE_ME and configure 32+ character viewer/admin API keys.

# Generate Prisma Client
npm run prisma:generate

# Validate datasource URL and schema
npm run prisma:validate

# Apply financial-domain schema
npm run prisma:migrate

# Start development server
npm run start:dev

# Run tests
npm run test
npm run test:e2e
```

Set `FINANCE_DATA_MODE=simulated` to skip PostgreSQL connection attempts and serve clearly labeled
demo data; `/api/health` then reports a healthy runtime and an intentionally unconfigured database.
Set it to `database` to use PostgreSQL connection checks. Ingestion requires a connected database.
Configured database reads require the viewer or admin API key; record ingestion requires the
admin key. The service records business data but never initiates payments.
