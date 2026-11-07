# Business Autonomous Finance — Architecture

## Current implementation

The original NestJS/React health-check foundation remains intact. A finance module is now
mounted alongside it and exposes validated financial records, calculations, agent execution,
and orchestration APIs.

```text
React finance dashboard
    | typed /api/finance requests
    v
NestJS FinanceController
    | viewer/admin key authorization when PostgreSQL is configured
    v
FinanceService
    |-- snapshot loader: PostgreSQL records or explicitly labeled demo data
    |-- input/output validation and execution/error logging
    |-- specialist calculations (read-only snapshot capability)
    `-- rules-based assistant intent routing and result composition
    |
    v
Prisma/PostgreSQL: transactions, budgets, invoices, accounts, agent runs, audit logs
```

## Financial data and provenance

Money is stored and calculated as integer USD cents. The relational schema includes
`FinancialTransaction`, `FinancialBudget`, `FinancialInvoice`, `FinancialAccount`, and
`AgentRun`, in addition to the pre-existing health and audit models. `POST /api/finance/*`
ingestion writes data and an audit log entry in a database transaction.

When no database is configured/available, or a connected database has no finance records, the
API supplies a deterministic sample ledger and labels the response `source: "simulated"`.
Once financial records exist, the source is `database`. The sample is not imported into the
database and must not be used as business reporting data.

Database values are read on each API request; the dashboard refreshes on demand. No automatic
bank synchronization or scheduled polling is configured.

No bank, accounting-provider, or LLM credentials are present. There is no live external data
integration or generative AI call. The assistant is an explicitly labeled rules-based
dispatcher; specialist outputs are deterministic calculations with evidence.

## Agent responsibilities

| Specialist | Operation |
|---|---|
| Financial Analyst | Computes period revenue, expenses, net income, and revenue change. |
| Expense Management | Applies description-based categories when ingesting and summarizes expense categories and high-value items. |
| Cash Flow Management | Projects cash from the recent monthly net trend and highlights overdue receivables. |
| Budget Planning | Computes utilization and flags budgets at/above 80% or over limit. |
| Financial Reporting | Produces current-month and latest three-month KPIs with source figures. |
| Finance Assistant | Routes queries to one or more specialists and combines their evidence-backed results. |

Agent routines operate only on a validated, deep-frozen snapshot and do not call database,
network, filesystem, or payment operations. They run in the same backend process, so this is not
an OS-level process/container sandbox or a boundary for executing untrusted code. No dynamic
agent code or external LLM executes. There are no tools for sending money, changing balances, or
making payments. Human review remains necessary before acting on recommendations.

## Authorization, validation, and hooks

- If `DATABASE_URL` is configured, finance reads and analysis require `FINANCE_VIEWER_API_KEY`
  or `FINANCE_ADMIN_API_KEY`. Ingestion requires the admin key.
- Keys are compared in constant time and must be at least 32 characters. The browser keeps an
  entered viewer key only in memory. Configure HTTPS and a trusted identity gateway for
  production; these shared keys are a small deployment RBAC boundary, not individual user SSO.
- Ingestion validates dates, identifiers/text lengths, directions, statuses, and positive
  integer-cent amounts. SQL uses Prisma's parameterized raw-query tags.
- Before agent execution, input snapshots are validated and deep-frozen. Results are checked
  before being returned or recorded. Failures are logged and surfaced instead of converted to
  successful responses.
- Each completed run is retained in process memory for demo mode and in `agent_runs` for a
  connected database. Each ingestion is atomically paired with an `audit_logs` record.

## APIs

See [API_REFERENCE.md](./API_REFERENCE.md) for routes, authorization, payloads, and response
provenance. Health routes remain unchanged under `/api/health`.
