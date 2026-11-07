CREATE TABLE "system_health_checks" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'ok',
  "notes" TEXT,
  CONSTRAINT "system_health_checks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "actor_id" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

CREATE TABLE "financial_transactions" (
  "id" TEXT NOT NULL,
  "occurred_at" TIMESTAMPTZ NOT NULL,
  "description" TEXT NOT NULL,
  "counterparty" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amount_cents" BIGINT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'manual',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "financial_transactions_type_check" CHECK ("type" IN ('income', 'expense')),
  CONSTRAINT "financial_transactions_amount_check" CHECK ("amount_cents" > 0)
);

CREATE INDEX "financial_transactions_occurred_at_idx"
  ON "financial_transactions"("occurred_at");
CREATE INDEX "financial_transactions_type_category_idx"
  ON "financial_transactions"("type", "category");

CREATE TABLE "financial_budgets" (
  "id" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "allocated_cents" BIGINT NOT NULL,
  "spent_cents" BIGINT NOT NULL DEFAULT 0,
  "period_start" TIMESTAMPTZ NOT NULL,
  "period_end" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "financial_budgets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "financial_budgets_amount_check"
    CHECK ("allocated_cents" >= 0 AND "spent_cents" >= 0),
  CONSTRAINT "financial_budgets_period_check" CHECK ("period_end" >= "period_start")
);

CREATE INDEX "financial_budgets_department_period_start_period_end_idx"
  ON "financial_budgets"("department", "period_start", "period_end");

CREATE TABLE "financial_invoices" (
  "id" TEXT NOT NULL,
  "direction" TEXT NOT NULL,
  "counterparty" TEXT NOT NULL,
  "due_date" TIMESTAMPTZ NOT NULL,
  "amount_cents" BIGINT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "financial_invoices_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "financial_invoices_direction_check"
    CHECK ("direction" IN ('receivable', 'payable')),
  CONSTRAINT "financial_invoices_status_check"
    CHECK ("status" IN ('open', 'overdue', 'paid')),
  CONSTRAINT "financial_invoices_amount_check" CHECK ("amount_cents" > 0)
);

CREATE INDEX "financial_invoices_direction_status_due_date_idx"
  ON "financial_invoices"("direction", "status", "due_date");

CREATE TABLE "financial_accounts" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "balance_cents" BIGINT NOT NULL,
  "included_in_cash" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_runs" (
  "id" TEXT NOT NULL,
  "agent_id" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "duration_ms" INTEGER NOT NULL,
  "result" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "agent_runs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "agent_runs_status_check" CHECK ("status" IN ('completed', 'failed'))
);

CREATE INDEX "agent_runs_agent_id_created_at_idx"
  ON "agent_runs"("agent_id", "created_at");
