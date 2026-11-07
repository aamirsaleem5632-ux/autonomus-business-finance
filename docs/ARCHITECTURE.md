# Autonomous Business Finance Platform - System Architecture

## 1. High-Level Architecture Overview

The **Autonomous Business Finance Platform** is designed as an industrial-grade, highly reliable, decoupled web application. Phase 1 establishes the underlying architectural substrate, strict separation of concerns, and developer tooling.

```
+-------------------------------------------------------------------------+
|                              Client Browser                             |
|             React 19 + TypeScript + Vite 8 + Tailwind CSS               |
+-------------------------------------------------------------------------+
                                    |
                            HTTP/REST + JSON
                       (Vite Proxy in Dev: /api)
                                    |
                                    v
+-------------------------------------------------------------------------+
|                           Backend Service                               |
|                         NestJS 12 + Node.js                             |
|                                                                         |
|  +---------------------+  +---------------------+  +-----------------+  |
|  | Global Exception    |  | Logging Interceptor |  | Config Module   |  |
|  | Filter (/api error) |  | (Telemetry/Latency) |  | (.env loader)   |  |
|  +---------------------+  +---------------------+  +-----------------+  |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | Modules: HealthModule (/api/health), PrismaModule (Database Pool) |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
                                    |
                             Prisma ORM (v6)
                                    |
                                    v
+-------------------------------------------------------------------------+
|                          Data Persistence Tier                          |
|                       PostgreSQL 16 Relational DB                       |
+-------------------------------------------------------------------------+
```

---

## 2. Tier Breakdown

### 2.1 Frontend Tier (`frontend/`)
- **Framework**: React 19 with strict TypeScript typing.
- **Bundler & Dev Server**: Vite 8 with hot-module replacement and automated API reverse-proxying.
- **Styling**: Tailwind CSS with an industrial, high-contrast dark theme optimized for mission-critical financial interfaces.
- **API Communication**: Dedicated API abstraction client (`frontend/src/api/client.ts`) with typed error extraction and response mapping.
- **Telemetry UI**: Real-time health monitoring, network latency tracking, and error handling verification.

### 2.2 Backend Tier (`backend/`)
- **Framework**: NestJS 12 running on Node.js using ES Modules (`NodeNext`).
- **API Structure**: Standardized `/api` routing prefix with REST standards.
- **Error Handling**: `GlobalHttpExceptionFilter` ensuring all application exceptions produce consistent, auditable JSON error envelopes.
- **Telemetry**: `LoggingInterceptor` capturing HTTP method, path, response codes, and round-trip execution latency.
- **Configuration**: `@nestjs/config` enforcing dynamic runtime configuration without baked-in secrets.

### 2.3 Data Persistence Tier (`backend/prisma/`)
- **ORM**: Prisma ORM with type-safe client generation.
- **Database Engine**: PostgreSQL with connection pooling and schema isolation.
- **Connection Lifecycle**: `PrismaService` implements lifecycle hooks (`onModuleInit`, `onModuleDestroy`) with soft-degradation: if the database is offline at startup, the service continues to operate and reports degraded health telemetry instead of hard-crashing.

---

## 3. Communication Contract

All backend endpoints are scoped beneath `/api`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Comprehensive system telemetry: service name, version, uptime, memory, database status |
| `GET` | `/api/health/error-demo` | Deliberately throws an exception to demonstrate `GlobalHttpExceptionFilter` |

### Standard Health Response Envelope
```json
{
  "status": "ok",
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

### Standard Error Response Envelope
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
