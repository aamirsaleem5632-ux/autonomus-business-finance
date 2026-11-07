# PostgreSQL Database & Prisma ORM Setup Guide

This document outlines how the database layer is configured and how to connect local or cloud PostgreSQL instances to the platform.

---

## 1. PostgreSQL Connection Configuration

Database connectivity is managed exclusively through the `DATABASE_URL` environment variable. **Credentials are never hardcoded.**

### Connection String Format
```text
postgresql://[username]:[password]@[host]:[port]/[database_name]?schema=[schema_name]
```

### Example `.env` Configuration
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/autonomous_finance_dev?schema=public"
```

---

## 2. Setting Up Local PostgreSQL with Docker

For rapid local development, a pre-configured `docker-compose.yml` is provided in the repository root.

```bash
# Start PostgreSQL container in background
docker compose up -d

# Verify container is running and healthy
docker compose ps
```

Default container settings:
- **Host**: `localhost`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: `postgrespassword`
- **Database**: `autonomous_finance_dev`

---

## 3. Prisma Schema & Migrations

The schema definition is located at `backend/prisma/schema.prisma`.

### Initial Models
- **`SystemHealthCheck`**: Base readiness model for database ping telemetry.
- **`AuditLog`**: Base model for financial compliance and operation tracking.

### Essential Commands
```bash
# Generate the type-safe Prisma Client (run after modifying schema.prisma)
npm run prisma:generate

# Apply migrations to development database
npm run prisma:migrate

# Open Prisma Studio web GUI (inspect records)
npm run prisma:studio
```

---

## 4. Soft-Degradation Architecture

In Phase 1, `PrismaService` implements safe connection fallback:
- If PostgreSQL is not running when the NestJS server starts, the backend will **not crash**.
- It logs a non-fatal warning and exposes `database: { status: "disconnected" }` on `GET /api/health`.
- Once PostgreSQL is started, subsequent operations or queries re-establish connection cleanly.
