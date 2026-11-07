# REST API Reference

All routes use the `/api` prefix.

## Finance data and analysis

### Authorization

When `DATABASE_URL` is set, all finance reads, assistant queries, and agent runs require
`x-finance-api-key` with either the configured viewer or admin key. Record-ingestion routes
require the admin key. Configure `FINANCE_VIEWER_API_KEY` and `FINANCE_ADMIN_API_KEY` as
independent random secrets of at least 32 characters. Without a configured database, the
read-only demo dashboard is available without a key; ingestion still requires an admin key
and a connected database.

These are shared role keys, not individual accounts or SSO. Use TLS and an identity-aware
gateway before exposing a deployment publicly. Do not put keys in frontend build variables.

### `GET /api/finance/overview`

Returns income, expenses, balances, budgets, invoices, monthly trend, forecast, agent insights,
and recent activity. `source` is `database` or `simulated`; the latter must not be treated as
live business data. Monetary values are integer USD cents.

### `GET /api/finance/agents`

Returns specialist names and descriptions.

### `GET /api/finance/activity`

Returns recent completed specialist runs, newest first. Demo activity is process-local; database
activity is persisted.

### `POST /api/finance/agents/:agentId/run`

Runs one read-only specialist against the current data snapshot. Valid IDs:
`financial-analyst`, `expense-management`, `cash-flow-management`, `budget-planning`,
`financial-reporting`.

### `POST /api/finance/assistant`

Routes a question to the relevant specialist(s) using rules and combines their evidence-backed
results. It is not a generative AI integration.

```json
{ "query": "What is my cash flow outlook?" }
```

Queries must contain 1–1000 characters.

### Ingestion routes (admin key and connected PostgreSQL required)

All monetary amounts use integer USD cents. Records are validated and inserted in a transaction
with a corresponding audit log entry. These routes record finance data only; they do not
initiate payments or transfers.

| Method | Route | Request fields |
|---|---|---|
| `POST` | `/api/finance/transactions` | `date`, `description`, `counterparty`, `type` (`income`/`expense`), `amountCents`; optional `category` |
| `POST` | `/api/finance/budgets` | `department`, `allocatedCents`, `spentCents`, `periodStart`, `periodEnd` |
| `POST` | `/api/finance/invoices` | `direction` (`receivable`/`payable`), `counterparty`, `dueDate`, `amountCents`, `status` |
| `POST` | `/api/finance/accounts` | `name`, `currency` (`USD`), `balanceCents` |

Example:

```http
POST /api/finance/transactions
x-finance-api-key: <admin-key>
Content-Type: application/json

{
  "date": "2026-11-07T09:00:00.000Z",
  "description": "Cloud hosting invoice",
  "counterparty": "Example Cloud",
  "type": "expense",
  "amountCents": 12500
}
```

If category is omitted, a deterministic description rule assigns one; otherwise unmatched
records are marked `Uncategorized`. A successful ingestion returns the record ID, resolved
category (for transactions), and `status: "recorded"`.

## Health and error handling

### `GET /api/health`

Returns runtime, memory, and database connectivity telemetry.

### `GET /api/health/error-demo`

Deliberately throws a `BadRequestException` to verify global error handling. Returns HTTP 400.

### Error envelope

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
