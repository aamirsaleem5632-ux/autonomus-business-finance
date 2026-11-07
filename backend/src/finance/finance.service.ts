import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { createDemoFinanceSnapshot } from './demo-finance-data.js';
import type {
  FinanceAgentActivity,
  FinanceAgentId,
  FinanceAgentResult,
  FinanceAssistantResponse,
  FinanceInsight,
  FinanceOverview,
  FinanceSnapshot,
  InsightSeverity,
  AccountIngestionRequest,
  BudgetIngestionRequest,
  InvoiceIngestionRequest,
  TransactionIngestionRequest,
  TransactionIngestionResponse,
} from './finance.types.js';

const AGENT_NAMES: Record<FinanceAgentId, string> = {
  'financial-analyst': 'Financial Analyst',
  'expense-management': 'Expense Management Agent',
  'cash-flow-management': 'Cash Flow Management Agent',
  'budget-planning': 'Budget Planning Agent',
  'financial-reporting': 'Financial Reporting Agent',
};

const AGENT_IDS: FinanceAgentId[] = [
  'financial-analyst',
  'expense-management',
  'cash-flow-management',
  'budget-planning',
  'financial-reporting',
];

interface DbTransaction {
  id: string;
  occurredAt: Date;
  description: string;
  counterparty: string;
  type: 'income' | 'expense';
  category: string;
  amountCents: bigint;
}

interface DbBudget {
  id: string;
  department: string;
  allocatedCents: bigint;
  spentCents: bigint;
}

interface DbInvoice {
  id: string;
  counterparty: string;
  dueDate: Date;
  amountCents: bigint;
  status: 'open' | 'overdue' | 'paid';
}

interface DbMonth {
  month: string;
  revenueCents: bigint;
  expensesCents: bigint;
}

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);
  private readonly activity: FinanceAgentActivity[] = [];

  constructor(private readonly prisma: PrismaService) {}

  getAgentDirectory(): Array<{ id: FinanceAgentId; name: string; operation: string }> {
    return [
      {
        id: 'financial-analyst',
        name: AGENT_NAMES['financial-analyst'],
        operation: 'Calculates revenue, expenses, margin, and period-over-period changes.',
      },
      {
        id: 'expense-management',
        name: AGENT_NAMES['expense-management'],
        operation: 'Categorizes expense descriptions and flags high-value spending.',
      },
      {
        id: 'cash-flow-management',
        name: AGENT_NAMES['cash-flow-management'],
        operation: 'Projects cash using recent actual monthly net cash flow and open invoices.',
      },
      {
        id: 'budget-planning',
        name: AGENT_NAMES['budget-planning'],
        operation: 'Calculates budget utilization and flags departments near or over limits.',
      },
      {
        id: 'financial-reporting',
        name: AGENT_NAMES['financial-reporting'],
        operation: 'Builds current-period KPIs and explains their underlying figures.',
      },
    ];
  }

  async getActivity(): Promise<FinanceAgentActivity[]> {
    if (this.isSimulatedDataMode()) {
      return [...this.activity];
    }
    if ((await this.prisma.checkHealth()).status === 'connected') {
      const records = await this.prisma.$queryRaw<
        Array<{
          id: string;
          agentId: FinanceAgentId;
          status: 'completed' | 'failed';
          durationMs: number;
          result: FinanceAgentResult;
          createdAt: Date;
        }>
      >`SELECT id, agent_id AS "agentId", status, duration_ms AS "durationMs", result, created_at AS "createdAt"
        FROM agent_runs ORDER BY created_at DESC LIMIT 50`;
      return records.map((record) => ({
        id: record.id,
        ...record.result,
        agentId: record.agentId,
        status: record.status,
        durationMs: record.durationMs,
        completedAt: record.createdAt.toISOString(),
      }));
    }
    return [...this.activity];
  }

  async getOverview(): Promise<FinanceOverview> {
    const snapshot = await this.getSnapshot();
    const results = await this.executeAgents(AGENT_IDS, snapshot);
    const revenueCents = sumBy(
      snapshot.transactions.filter((transaction) => transaction.type === 'income'),
      (transaction) => transaction.amountCents,
    );
    const expensesCents = sumBy(
      snapshot.transactions.filter((transaction) => transaction.type === 'expense'),
      (transaction) => transaction.amountCents,
    );
    const receivablesCents = sumBy(
      snapshot.receivables.filter((invoice) => invoice.status !== 'paid'),
      (invoice) => invoice.amountCents,
    );
    const payablesCents = sumBy(
      snapshot.payables.filter((invoice) => invoice.status !== 'paid'),
      (invoice) => invoice.amountCents,
    );
    const netIncomeCents = revenueCents - expensesCents;
    const averageMonthlyNetCents = Math.round(
      sumBy(
        snapshot.monthlyTrend.slice(0, -1),
        (month) => month.revenueCents - month.expensesCents,
      ) / Math.max(snapshot.monthlyTrend.length - 1, 1),
    );
    const latestMonth = snapshot.monthlyTrend.at(-1);
    const currentCashCents =
      snapshot.currentCashCents ?? snapshot.openingCashCents + netIncomeCents;
    const forecast = [1, 2, 3].map((monthOffset) => ({
      month: monthLabel(monthOffset),
      projectedCashCents: currentCashCents + averageMonthlyNetCents * monthOffset,
    }));

    return {
      source: snapshot.source,
      asOf: snapshot.asOf,
      currency: snapshot.currency,
      metrics: {
        cashBalanceCents:
          currentCashCents,
        revenueCents: latestMonth?.revenueCents ?? revenueCents,
        expensesCents: latestMonth?.expensesCents ?? expensesCents,
        netIncomeCents: latestMonth
          ? latestMonth.revenueCents - latestMonth.expensesCents
          : netIncomeCents,
        receivablesCents,
        payablesCents,
      },
      transactions: snapshot.transactions,
      budgets: snapshot.budgets,
      receivables: snapshot.receivables,
      payables: snapshot.payables,
      monthlyTrend: snapshot.monthlyTrend,
      forecast,
      insights: results.flatMap((result) => result.insights),
      activity: (await this.getActivity()).slice(0, 10),
    };
  }

  async askAssistant(query: unknown): Promise<FinanceAssistantResponse> {
    if (typeof query !== 'string' || query.trim().length === 0 || query.length > 1000) {
      throw new BadRequestException(
        'query must be a non-empty string of at most 1000 characters',
      );
    }

    const agentIds = this.routeQuery(query);
    const results = await this.executeAgents(agentIds, await this.getSnapshot());
    const answer = results
      .flatMap((result) =>
        result.insights.map(
          (insight) => `${insight.title}: ${insight.summary} ${insight.recommendation}`,
        ),
      )
      .join(' ');

    return {
      mode: 'rules-based',
      answer,
      delegatedTo: agentIds,
      results,
    };
  }

  async runAgent(agentId: string): Promise<FinanceAgentResult> {
    if (!AGENT_IDS.includes(agentId as FinanceAgentId)) {
      throw new BadRequestException(`Unknown finance agent: ${agentId}`);
    }
    const [result] = await this.executeAgents(
      [agentId as FinanceAgentId],
      await this.getSnapshot(),
    );
    return result;
  }

  async ingestTransaction(
    input: unknown,
  ): Promise<TransactionIngestionResponse> {
    const transaction = validateTransactionInput(input);
    if ((await this.prisma.checkHealth()).status !== 'connected') {
      throw new ServiceUnavailableException(
        'Transaction ingestion requires a connected PostgreSQL database.',
      );
    }

    const id = randomUUID();
    const category =
      transaction.category?.trim() ||
      categorizeTransaction(transaction.description, transaction.type);
    await this.prisma.$transaction(async (database) => {
      await database.$executeRaw`
        INSERT INTO financial_transactions
          (id, occurred_at, description, counterparty, type, category, amount_cents, source, created_at)
        VALUES
          (${id}, ${new Date(transaction.date)}::timestamptz, ${transaction.description.trim()},
           ${transaction.counterparty.trim()}, ${transaction.type}, ${category},
           ${transaction.amountCents}, 'api', NOW())
      `;
      await database.$executeRaw`
        INSERT INTO audit_logs (id, action, actor_id, entity, entity_id, metadata, created_at)
        VALUES (
          ${randomUUID()},
          'financial_transaction.ingested',
          'finance-api-key:admin',
          'financial_transaction',
          ${id},
          ${JSON.stringify({ source: 'api', category })}::jsonb,
          NOW()
        )
      `;
    });

    return { id, category, status: 'recorded' };
  }

  async ingestBudget(input: unknown): Promise<{ id: string; status: 'recorded' }> {
    const budget = validateBudgetInput(input);
    await this.requireDatabase();
    const id = randomUUID();
    await this.prisma.$transaction(async (database) => {
      await database.$executeRaw`
        INSERT INTO financial_budgets
          (id, department, allocated_cents, spent_cents, period_start, period_end)
        VALUES (
          ${id}, ${budget.department.trim()}, ${budget.allocatedCents},
          ${budget.spentCents}, ${new Date(budget.periodStart)}::timestamptz,
          ${new Date(budget.periodEnd)}::timestamptz
        )
      `;
      await this.auditIngestion(database, 'financial_budget.ingested', id);
    });
    return { id, status: 'recorded' };
  }

  async ingestInvoice(input: unknown): Promise<{ id: string; status: 'recorded' }> {
    const invoice = validateInvoiceInput(input);
    await this.requireDatabase();
    const id = randomUUID();
    await this.prisma.$transaction(async (database) => {
      await database.$executeRaw`
        INSERT INTO financial_invoices
          (id, direction, counterparty, due_date, amount_cents, status)
        VALUES (
          ${id}, ${invoice.direction}, ${invoice.counterparty.trim()},
          ${new Date(invoice.dueDate)}::timestamptz, ${invoice.amountCents},
          ${invoice.status}
        )
      `;
      await this.auditIngestion(database, 'financial_invoice.ingested', id);
    });
    return { id, status: 'recorded' };
  }

  async ingestAccount(input: unknown): Promise<{ id: string; status: 'recorded' }> {
    const account = validateAccountInput(input);
    await this.requireDatabase();
    const id = randomUUID();
    await this.prisma.$transaction(async (database) => {
      await database.$executeRaw`
        INSERT INTO financial_accounts
          (id, name, currency, balance_cents, included_in_cash, created_at, updated_at)
        VALUES (
          ${id}, ${account.name.trim()}, ${account.currency.toUpperCase()},
          ${account.balanceCents}, TRUE, NOW(), NOW()
        )
      `;
      await this.auditIngestion(database, 'financial_account.ingested', id);
    });
    return { id, status: 'recorded' };
  }

  private async requireDatabase(): Promise<void> {
    if ((await this.prisma.checkHealth()).status !== 'connected') {
      throw new ServiceUnavailableException(
        'Financial data ingestion requires a connected PostgreSQL database.',
      );
    }
  }

  private async auditIngestion(
    database: Prisma.TransactionClient,
    action: string,
    entityId: string,
  ): Promise<void> {
    await database.$executeRaw`
      INSERT INTO audit_logs (id, action, actor_id, entity, entity_id, metadata, created_at)
      VALUES (
        ${randomUUID()},
        ${action},
        'finance-api-key:admin',
        ${action.split('.')[0]},
        ${entityId},
        ${JSON.stringify({ source: 'api' })}::jsonb,
        NOW()
      )
    `;
  }

  private routeQuery(query: string): FinanceAgentId[] {
    const text = query.toLowerCase();
    const selected = new Set<FinanceAgentId>();
    if (/cash|cash flow|liquid|runway|forecast/.test(text)) {
      selected.add('cash-flow-management');
    }
    if (/budget|department|allocation|spend limit/.test(text)) {
      selected.add('budget-planning');
    }
    if (/expense|transaction|vendor|unusual|categor/.test(text)) {
      selected.add('expense-management');
    }
    if (/report|month|quarter|kpi|performance/.test(text)) {
      selected.add('financial-reporting');
    }
    if (/revenue|profit|margin|trend|financial/.test(text)) {
      selected.add('financial-analyst');
    }
    if (selected.size === 0) {
      AGENT_IDS.forEach((id) => selected.add(id));
    }
    return [...selected];
  }

  private async executeAgents(
    agentIds: FinanceAgentId[],
    snapshot: FinanceSnapshot,
  ): Promise<FinanceAgentResult[]> {
    validateSnapshot(snapshot);
    deepFreeze(snapshot);
    const results: FinanceAgentResult[] = [];
    for (const agentId of agentIds) {
      const startedAt = performance.now();
      try {
        const insights = this.analyze(agentId, snapshot);
        const result: FinanceAgentResult = {
          agentId,
          agentName: AGENT_NAMES[agentId],
          status: 'completed',
          completedAt: new Date().toISOString(),
          durationMs: Math.round(performance.now() - startedAt),
          insights,
        };
        validateAgentResult(result);
        const activity: FinanceAgentActivity = { id: randomUUID(), ...result };
        this.activity.unshift(activity);
        this.activity.splice(100);
        if (snapshot.source === 'database') {
          await this.persistAgentRun(activity);
        }
        results.push(result);
      } catch (error) {
        const failedActivity: FinanceAgentActivity = {
          id: randomUUID(),
          agentId,
          agentName: AGENT_NAMES[agentId],
          status: 'failed',
          completedAt: new Date().toISOString(),
          durationMs: Math.round(performance.now() - startedAt),
          insights: [],
        };
        this.activity.unshift(failedActivity);
        this.activity.splice(100);
        try {
          if (
            snapshot.source === 'database' &&
            (await this.prisma.checkHealth()).status === 'connected'
          ) {
            await this.persistAgentRun(failedActivity);
          }
        } catch (loggingError) {
          this.logger.error(
            `${AGENT_NAMES[agentId]} failure could not be persisted`,
            loggingError instanceof Error ? loggingError.stack : String(loggingError),
          );
        }
        this.logger.error(
          `${AGENT_NAMES[agentId]} failed`,
          error instanceof Error ? error.stack : String(error),
        );
        throw error;
      }
    }
    return results;
  }

  private async persistAgentRun(activity: FinanceAgentActivity): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO agent_runs (id, agent_id, status, duration_ms, result, created_at)
      VALUES (
        ${activity.id},
        ${activity.agentId},
        ${activity.status},
        ${activity.durationMs},
        ${JSON.stringify(activity)}::jsonb,
        ${activity.completedAt}::timestamptz
      )
    `;
  }

  private async getSnapshot(): Promise<FinanceSnapshot> {
    if (this.isSimulatedDataMode()) {
      return createDemoFinanceSnapshot();
    }

    if ((await this.prisma.checkHealth()).status !== 'connected') {
      return createDemoFinanceSnapshot();
    }

    const [transactions, budgets, receivables, payables, monthlyTrend, accounts] =
      await Promise.all([
        this.prisma.$queryRaw<DbTransaction[]>`
          SELECT id, occurred_at AS "occurredAt", description, counterparty, type, category,
                 amount_cents AS "amountCents"
          FROM financial_transactions
          ORDER BY occurred_at DESC
          LIMIT 100
        `,
        this.prisma.$queryRaw<DbBudget[]>`
          SELECT id, department, allocated_cents AS "allocatedCents", spent_cents AS "spentCents"
          FROM financial_budgets
          WHERE period_start <= CURRENT_DATE AND period_end >= CURRENT_DATE
          ORDER BY department
        `,
        this.prisma.$queryRaw<DbInvoice[]>`
          SELECT id, counterparty, due_date AS "dueDate", amount_cents AS "amountCents", status
          FROM financial_invoices
          WHERE direction = 'receivable'
          ORDER BY due_date
        `,
        this.prisma.$queryRaw<DbInvoice[]>`
          SELECT id, counterparty, due_date AS "dueDate", amount_cents AS "amountCents", status
          FROM financial_invoices
          WHERE direction = 'payable'
          ORDER BY due_date
        `,
        this.prisma.$queryRaw<DbMonth[]>`
          SELECT to_char(date_trunc('month', occurred_at), 'Mon YYYY') AS month,
                 COALESCE(SUM(amount_cents) FILTER (WHERE type = 'income'), 0)::bigint AS "revenueCents",
                 COALESCE(SUM(amount_cents) FILTER (WHERE type = 'expense'), 0)::bigint AS "expensesCents"
          FROM financial_transactions
          WHERE occurred_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
          GROUP BY date_trunc('month', occurred_at)
          ORDER BY date_trunc('month', occurred_at)
        `,
        this.prisma.$queryRaw<
          Array<{ balanceCents: bigint; accountCount: number }>
        >`
          SELECT COALESCE(SUM(balance_cents), 0)::bigint AS "balanceCents",
                 COUNT(*)::int AS "accountCount"
          FROM financial_accounts WHERE included_in_cash = true AND currency = 'USD'
        `,
      ]);

    if (
      transactions.length === 0 &&
      budgets.length === 0 &&
      receivables.length === 0 &&
      payables.length === 0 &&
      accounts[0]?.accountCount === 0
    ) {
      return createDemoFinanceSnapshot();
    }

    return {
      source: 'database',
      asOf: new Date().toISOString(),
      currency: 'USD',
      openingCashCents: Number(accounts[0]?.balanceCents ?? 0n),
      currentCashCents: Number(accounts[0]?.balanceCents ?? 0n),
      transactions: transactions.map((transaction) => ({
        ...transaction,
        date: transaction.occurredAt.toISOString(),
        amountCents: Number(transaction.amountCents),
      })),
      budgets: budgets.map((budget) => ({
        ...budget,
        allocatedCents: Number(budget.allocatedCents),
        spentCents: Number(budget.spentCents),
      })),
      receivables: receivables.map((invoice) => ({
        ...invoice,
        dueDate: invoice.dueDate.toISOString(),
        status: effectiveInvoiceStatus(invoice.status, invoice.dueDate),
        amountCents: Number(invoice.amountCents),
      })),
      payables: payables.map((invoice) => ({
        ...invoice,
        dueDate: invoice.dueDate.toISOString(),
        status: effectiveInvoiceStatus(invoice.status, invoice.dueDate),
        amountCents: Number(invoice.amountCents),
      })),
      monthlyTrend: monthlyTrend.map((month) => ({
        ...month,
        revenueCents: Number(month.revenueCents),
        expensesCents: Number(month.expensesCents),
      })),
    };
  }

  private analyze(agentId: FinanceAgentId, data: FinanceSnapshot): FinanceInsight[] {
    switch (agentId) {
      case 'financial-analyst':
        return this.analyzePerformance(data);
      case 'expense-management':
        return this.analyzeExpenses(data);
      case 'cash-flow-management':
        return this.analyzeCashFlow(data);
      case 'budget-planning':
        return this.analyzeBudgets(data);
      case 'financial-reporting':
        return this.createReport(data);
    }
  }

  private isSimulatedDataMode(): boolean {
    return process.env.FINANCE_DATA_MODE === 'simulated';
  }

  private analyzePerformance(data: FinanceSnapshot): FinanceInsight[] {
    const current = data.monthlyTrend.at(-1);
    const previous = data.monthlyTrend.at(-2);
    if (!current) {
      return [emptyDataInsight()];
    }
    const net = current.revenueCents - current.expensesCents;
    const revenueChange = previous
      ? percentageChange(current.revenueCents, previous.revenueCents)
      : null;
    return [
      insight(
        'Monthly operating performance',
        `Revenue is ${formatMoney(current.revenueCents)} and expenses are ${formatMoney(current.expensesCents)}, leaving ${formatMoney(net)} net income.`,
        'info',
        [
          `Revenue: ${formatMoney(current.revenueCents)}`,
          `Expenses: ${formatMoney(current.expensesCents)}`,
          `Net income: ${formatMoney(net)}`,
          ...(revenueChange === null ? [] : [`Revenue change: ${revenueChange}% versus prior month`]),
        ],
        'Review recurring costs alongside revenue changes before adjusting operating plans.',
      ),
    ];
  }

  private analyzeExpenses(data: FinanceSnapshot): FinanceInsight[] {
    const expenses = data.transactions.filter((transaction) => transaction.type === 'expense');
    const categories = new Map<string, number>();
    for (const transaction of expenses) {
      const categorized = categorizeTransaction(transaction.description, transaction.type);
      const category = transaction.category || categorized;
      categories.set(
        category,
        (categories.get(category) ?? 0) + transaction.amountCents,
      );
    }
    const highestCategory = [...categories.entries()].sort((a, b) => b[1] - a[1])[0];
    const largestExpense = [...expenses].sort(
      (a, b) => b.amountCents - a.amountCents,
    )[0];
    if (!largestExpense) {
      return [emptyDataInsight()];
    }
    const average = sumBy(expenses, (transaction) => transaction.amountCents) / expenses.length;
    const variance =
      sumBy(expenses, (transaction) => (transaction.amountCents - average) ** 2) /
      expenses.length;
    const outlierThreshold = average + 2 * Math.sqrt(variance);
    const outliers = expenses.filter(
      (transaction) => transaction.amountCents > outlierThreshold,
    );
    return [
      insight(
        'Expense review',
        `${highestCategory?.[0] ?? 'No category'} is the largest expense category at ${formatMoney(highestCategory?.[1] ?? 0)}. ${outliers.length ? `${outliers.length} expense(s) exceed two standard deviations from this period's average.` : 'No statistical outlier was detected in this period.'}`,
        outliers.length ? 'warning' : 'info',
        [
          `Analyzed ${expenses.length} expense transactions`,
          `Applied description-based category rules to ${expenses.filter((transaction) => !transaction.category).length} uncategorized expense(s)`,
          `Largest category: ${highestCategory?.[0] ?? 'None'} (${formatMoney(highestCategory?.[1] ?? 0)})`,
          `Largest expense: ${largestExpense.description} (${formatMoney(largestExpense.amountCents)})`,
          `Outlier comparison threshold: ${formatMoney(Math.round(outlierThreshold))}`,
          ...outliers.map(
            (transaction) =>
              `Review outlier: ${transaction.description} (${formatMoney(transaction.amountCents)})`,
          ),
        ],
        'The outlier rule is a simple same-period statistical screen, not seasonality-adjusted fraud detection; verify flagged items against invoices and expected recurring costs.',
      ),
    ];
  }

  private analyzeCashFlow(data: FinanceSnapshot): FinanceInsight[] {
    const monthlyNet = data.monthlyTrend.map(
      (month) => month.revenueCents - month.expensesCents,
    );
    const averageNetCents = Math.round(
      sum(monthlyNet.slice(0, -1)) / Math.max(monthlyNet.length - 1, 1),
    );
    const currentNet =
      (data.monthlyTrend.at(-1)?.revenueCents ?? 0) -
      (data.monthlyTrend.at(-1)?.expensesCents ?? 0);
    const cashBalance =
      data.currentCashCents ?? data.openingCashCents + currentNet;
    const forecastCash = cashBalance + averageNetCents * 3;
    const overdueReceivables = data.receivables.filter(
      (invoice) => invoice.status === 'overdue',
    );
    const overdueCents = sumBy(overdueReceivables, (invoice) => invoice.amountCents);
    const dueWithinThirtyDays = (date: string) => {
      const daysUntilDue = (Date.parse(date) - Date.now()) / 86_400_000;
      return daysUntilDue >= 0 && daysUntilDue <= 30;
    };
    const upcomingReceivables = sumBy(
      data.receivables.filter(
        (invoice) => invoice.status === 'open' && dueWithinThirtyDays(invoice.dueDate),
      ),
      (invoice) => invoice.amountCents,
    );
    const upcomingPayables = sumBy(
      data.payables.filter(
        (invoice) => invoice.status === 'open' && dueWithinThirtyDays(invoice.dueDate),
      ),
      (invoice) => invoice.amountCents,
    );
    const severity: InsightSeverity =
      forecastCash < 0 ? 'critical' : overdueCents > 0 ? 'warning' : 'info';
    return [
      insight(
        'Cash position and 3-month outlook',
        `Estimated cash is ${formatMoney(cashBalance)}. A simple trend-based projection is ${formatMoney(forecastCash)} in three months; it is not a guarantee.`,
        severity,
        [
          `Estimated current cash: ${formatMoney(cashBalance)}`,
          `Average monthly net from prior reported months: ${formatMoney(averageNetCents)}`,
          `Overdue receivables: ${formatMoney(overdueCents)}`,
          `Open receivables due within 30 days: ${formatMoney(upcomingReceivables)}`,
          `Open payables due within 30 days: ${formatMoney(upcomingPayables)}`,
        ],
        overdueCents > 0
          ? `Follow up on ${overdueReceivables.length} overdue receivable(s), totaling ${formatMoney(overdueCents)}.`
          : 'Continue monitoring collections and compare realized cash flow with this basic projection.',
      ),
    ];
  }

  private analyzeBudgets(data: FinanceSnapshot): FinanceInsight[] {
    const budgets = data.budgets
      .map((budget) => ({
        ...budget,
        utilization: budget.allocatedCents
          ? Math.round((budget.spentCents / budget.allocatedCents) * 100)
          : 0,
      }))
      .sort((a, b) => b.utilization - a.utilization);
    const atRisk = budgets.filter((budget) => budget.utilization >= 80);
    const overBudget = budgets.filter((budget) => budget.spentCents > budget.allocatedCents);
    const top = budgets[0];
    return [
      insight(
        overBudget.length ? 'Budget limit exceeded' : 'Budget utilization',
        overBudget.length
          ? `${overBudget.map((budget) => budget.department).join(', ')} is over the assigned budget.`
          : top
            ? `${top.department} has the highest budget utilization at ${top.utilization}%.`
            : 'No budget allocations are available.',
        overBudget.length ? 'critical' : atRisk.length ? 'warning' : 'info',
        budgets.map(
          (budget) =>
            `${budget.department}: ${budget.utilization}% used (${formatMoney(budget.spentCents)} of ${formatMoney(budget.allocatedCents)})`,
        ),
        atRisk.length
          ? `Review remaining commitments for ${atRisk.map((budget) => budget.department).join(', ')} before approving additional spend.`
          : 'Keep planned spending within each department allocation.',
      ),
    ];
  }

  private createReport(data: FinanceSnapshot): FinanceInsight[] {
    const latest = data.monthlyTrend.at(-1);
    if (!latest) {
      return [emptyDataInsight()];
    }
    const net = latest.revenueCents - latest.expensesCents;
    const margin =
      latest.revenueCents > 0
        ? Math.round((net / latest.revenueCents) * 1000) / 10
        : 0;
    const receivables = sumBy(
      data.receivables.filter((invoice) => invoice.status !== 'paid'),
      (invoice) => invoice.amountCents,
    );
    const payables = sumBy(
      data.payables.filter((invoice) => invoice.status !== 'paid'),
      (invoice) => invoice.amountCents,
    );
    const quarter = data.monthlyTrend.slice(-3);
    const year = data.monthlyTrend.slice(-12);
    const quarterRevenue = sumBy(quarter, (month) => month.revenueCents);
    const quarterExpenses = sumBy(quarter, (month) => month.expensesCents);
    const yearRevenue = sumBy(year, (month) => month.revenueCents);
    const yearExpenses = sumBy(year, (month) => month.expensesCents);
    return [
      insight(
        'Monthly financial report',
        `This month generated ${formatMoney(latest.revenueCents)} revenue and ${formatMoney(net)} net income, for a ${margin}% net margin. The latest ${quarter.length}-month summary is ${formatMoney(quarterRevenue)} revenue and ${formatMoney(quarterRevenue - quarterExpenses)} net income; the rolling ${year.length}-month summary is ${formatMoney(yearRevenue)} revenue and ${formatMoney(yearRevenue - yearExpenses)} net income.`,
        'info',
        [
          `Period revenue: ${formatMoney(latest.revenueCents)}`,
          `Period expenses: ${formatMoney(latest.expensesCents)}`,
          `Net margin: ${margin}%`,
          `Open receivables: ${formatMoney(receivables)}`,
          `Open payables: ${formatMoney(payables)}`,
          `Latest ${quarter.length}-month revenue: ${formatMoney(quarterRevenue)}`,
          `Latest ${quarter.length}-month expenses: ${formatMoney(quarterExpenses)}`,
          `Rolling ${year.length}-month revenue: ${formatMoney(yearRevenue)}`,
          `Rolling ${year.length}-month expenses: ${formatMoney(yearExpenses)}`,
        ],
        'Reconcile the period with source statements before using these figures for external reporting.',
      ),
    ];
  }
}

function validateTransactionInput(input: unknown): TransactionIngestionRequest {
  if (!isTransactionInput(input)) {
    throw new BadRequestException(
      'Transaction requires a valid date, description, counterparty, type, positive integer amountCents, and optional category.',
    );
  }
  return input;
}

function isTransactionInput(input: unknown): input is TransactionIngestionRequest {
  if (!isRecord(input)) return false;
  return (
    isValidDate(input.date) &&
    isTrimmedString(input.description, 200) &&
    isTrimmedString(input.counterparty, 120) &&
    (input.type === 'income' || input.type === 'expense') &&
    isPositiveInteger(input.amountCents) &&
    (input.category === undefined ||
      (typeof input.category === 'string' && input.category.length <= 80))
  );
}

function validateBudgetInput(input: unknown): BudgetIngestionRequest {
  if (!isBudgetInput(input)) {
    throw new BadRequestException(
      'Budget requires a department, non-negative integer amounts, and a valid period.',
    );
  }
  return input;
}

function validateInvoiceInput(input: unknown): InvoiceIngestionRequest {
  if (!isInvoiceInput(input)) {
    throw new BadRequestException(
      'Invoice requires a valid direction, counterparty, due date, positive integer amount, and status.',
    );
  }
  return input;
}

function validateAccountInput(input: unknown): AccountIngestionRequest {
  if (!isAccountInput(input)) {
    throw new BadRequestException(
      'Account requires a name, USD currency, and integer balanceCents.',
    );
  }
  return input;
}

function isBudgetInput(input: unknown): input is BudgetIngestionRequest {
  if (!isRecord(input)) return false;
  return (
    isTrimmedString(input.department, 100) &&
    isNonNegativeInteger(input.allocatedCents) &&
    isNonNegativeInteger(input.spentCents) &&
    isValidDate(input.periodStart) &&
    isValidDate(input.periodEnd) &&
    Date.parse(input.periodEnd) >= Date.parse(input.periodStart)
  );
}

function isInvoiceInput(input: unknown): input is InvoiceIngestionRequest {
  if (!isRecord(input)) return false;
  return (
    (input.direction === 'receivable' || input.direction === 'payable') &&
    isTrimmedString(input.counterparty, 120) &&
    isValidDate(input.dueDate) &&
    isPositiveInteger(input.amountCents) &&
    (input.status === 'open' ||
      input.status === 'overdue' ||
      input.status === 'paid')
  );
}

function isAccountInput(input: unknown): input is AccountIngestionRequest {
  if (!isRecord(input)) return false;
  return (
    isTrimmedString(input.name, 100) &&
    typeof input.currency === 'string' &&
    /^[A-Za-z]{3}$/.test(input.currency) &&
    input.currency.toUpperCase() === 'USD' &&
    Number.isSafeInteger(input.balanceCents)
  );
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isTrimmedString(value: unknown, maximumLength: number): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= maximumLength
  );
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function categorizeTransaction(
  description: string,
  type: 'income' | 'expense',
): string {
  const text = description.toLowerCase();
  if (type === 'income') {
    if (/consult|professional service|contractor|implementation|milestone/.test(text)) {
      return 'Services';
    }
    return 'Revenue';
  }
  if (/payroll|salary|wage|benefits/.test(text)) return 'Payroll';
  if (/cloud|hosting|infrastructure/.test(text)) return 'Infrastructure';
  if (/advertis|campaign|marketing/.test(text)) return 'Marketing';
  if (/rent|lease|office|utilities/.test(text)) return 'Facilities';
  if (/travel|airfare|hotel|mileage/.test(text)) return 'Travel';
  if (/software|subscription|saas|license|collaboration/.test(text)) return 'Software';
  if (/consult|professional service|contractor/.test(text)) return 'Professional Services';
  return 'Uncategorized';
}

function insight(
  title: string,
  summary: string,
  severity: InsightSeverity,
  evidence: string[],
  recommendation: string,
): FinanceInsight {
  return { title, summary, severity, evidence, recommendation };
}

function emptyDataInsight(): FinanceInsight {
  return insight(
    'Insufficient financial data',
    'There is not enough financial history to calculate this analysis.',
    'warning',
    ['No matching financial records were available.'],
    'Add validated financial records before relying on this analysis.',
  );
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function sumBy<T>(items: T[], getValue: (item: T) => number): number {
  return items.reduce((total, item) => total + getValue(item), 0);
}

function percentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

function formatMoney(amountCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

function monthLabel(monthOffset: number): string {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + monthOffset);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

function effectiveInvoiceStatus(
  status: 'open' | 'overdue' | 'paid',
  dueDate: Date,
): 'open' | 'overdue' | 'paid' {
  return status === 'open' && dueDate.getTime() < Date.now() ? 'overdue' : status;
}

function validateSnapshot(snapshot: FinanceSnapshot): void {
  if (
    !snapshot ||
    (snapshot.source !== 'simulated' && snapshot.source !== 'database') ||
    snapshot.currency !== 'USD' ||
    !Number.isSafeInteger(snapshot.openingCashCents) ||
    (snapshot.currentCashCents !== undefined &&
      !Number.isSafeInteger(snapshot.currentCashCents)) ||
    !Number.isFinite(Date.parse(snapshot.asOf)) ||
    !Array.isArray(snapshot.transactions) ||
    !Array.isArray(snapshot.budgets) ||
    !Array.isArray(snapshot.receivables) ||
    !Array.isArray(snapshot.payables) ||
    !Array.isArray(snapshot.monthlyTrend)
  ) {
    throw new Error('Finance agent input failed snapshot validation.');
  }

  const validTransactions = snapshot.transactions.every(
    (transaction) =>
      Number.isSafeInteger(transaction.amountCents) &&
      transaction.amountCents > 0 &&
      (transaction.type === 'income' || transaction.type === 'expense') &&
      Number.isFinite(Date.parse(transaction.date)),
  );
  const validBudgets = snapshot.budgets.every(
    (budget) =>
      Number.isSafeInteger(budget.allocatedCents) &&
      budget.allocatedCents >= 0 &&
      Number.isSafeInteger(budget.spentCents) &&
      budget.spentCents >= 0,
  );
  const validInvoices = [...snapshot.receivables, ...snapshot.payables].every(
    (invoice) =>
      Number.isSafeInteger(invoice.amountCents) &&
      invoice.amountCents > 0 &&
      Number.isFinite(Date.parse(invoice.dueDate)) &&
      ['open', 'overdue', 'paid'].includes(invoice.status),
  );
  const validTrend = snapshot.monthlyTrend.every(
    (month) =>
      Number.isSafeInteger(month.revenueCents) &&
      month.revenueCents >= 0 &&
      Number.isSafeInteger(month.expensesCents) &&
      month.expensesCents >= 0,
  );

  if (!validTransactions || !validBudgets || !validInvoices || !validTrend) {
    throw new Error('Finance agent input contains invalid financial values.');
  }
}

function validateAgentResult(result: FinanceAgentResult): void {
  if (
    !AGENT_IDS.includes(result.agentId) ||
    result.status !== 'completed' ||
    !Number.isSafeInteger(result.durationMs) ||
    result.durationMs < 0 ||
    !Number.isFinite(Date.parse(result.completedAt)) ||
    !Array.isArray(result.insights) ||
    !result.insights.every(
      (item) =>
        typeof item.title === 'string' &&
        typeof item.summary === 'string' &&
        typeof item.recommendation === 'string' &&
        ['info', 'warning', 'critical'].includes(item.severity) &&
        Array.isArray(item.evidence) &&
        item.evidence.every((evidence) => typeof evidence === 'string'),
    )
  ) {
    throw new Error(`Finance agent ${result.agentId} returned an invalid result.`);
  }
}

function deepFreeze(value: unknown): void {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) {
    return;
  }
  Object.values(value).forEach(deepFreeze);
  Object.freeze(value);
}
