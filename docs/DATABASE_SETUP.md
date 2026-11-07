# PostgreSQL and Prisma Setup

## Configure credentials

Copy `backend/.env.example` to `backend/.env`, replace `CHANGE_ME`, and set independent,
random `FINANCE_VIEWER_API_KEY` and `FINANCE_ADMIN_API_KEY` values (at least 32 characters).
The viewer role can read/compute; the admin role can also ingest records. Do not commit `.env`.

For Docker Compose, create a root `.env` file containing a private `POSTGRES_PASSWORD`. Compose
requires this value and does not provide a committed default password. Use the same password
in the backend `DATABASE_URL`.

```text
postgresql://postgres:<password>@localhost:5432/autonomous_finance_dev?schema=public
```

For a managed PostgreSQL provider, use its PostgreSQL connection URL as `DATABASE_URL` and
include the TLS options required by that provider (commonly `sslmode=require`; combine it with
other query parameters using `&`). URL-encode reserved characters in credentials. Prisma reads
the URL from the datasource's `env("DATABASE_URL")` setting; no provider-specific hostname is
hardcoded in the schema.

## Initialize the database

```bash
docker compose up -d
npm run prisma:validate
npm run prisma:status
npm run prisma:generate
npm run prisma:migrate
```

The migration creates the health/audit tables and the financial transactions, budgets, invoices,
accounts, and agent-run tables. The migration is required before using protected ingestion APIs.
`prisma:status` checks the configured database and reports migration state without applying
changes.

## Data behavior

To run the backend and dashboard without a working database, set
`FINANCE_DATA_MODE=simulated` in `backend/.env` and restart NestJS. This explicitly skips Prisma
connection attempts; finance reads and specialist analyses use the labeled demo dataset, and
`/api/health` reports runtime `status: "ok"` with database `status: "unconfigured"`. Database
ingestion endpoints remain unavailable in this mode. Change the setting back to `database` to
resume normal PostgreSQL connection checks.

The dashboard uses simulated sample data when no database is available or the connected database
contains no finance records. Responses identify this with `source: "simulated"`. Once records
are ingested, the source is `database`. No sample records are silently written to PostgreSQL.

Amounts are USD integer cents. Ingest transactions, budgets, invoices, and account balances via
the admin-only `/api/finance/*` routes described in [API_REFERENCE.md](./API_REFERENCE.md).
Ingestion and its audit record commit atomically.

## Runtime resilience

The health endpoint continues to report connectivity when PostgreSQL is unavailable. Read-only
finance analysis falls back to visibly labeled simulated data; ingestion returns a service
unavailable error unless the database is connected. A connected but unmigrated database surfaces
its query error rather than hiding it behind demo data.
