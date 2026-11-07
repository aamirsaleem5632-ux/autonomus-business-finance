export type FinanceAgentId =
  | 'financial-analyst'
  | 'expense-management'
  | 'cash-flow-management'
  | 'budget-planning'
  | 'financial-reporting';

export type InsightSeverity = 'info' | 'warning' | 'critical';

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  counterparty: string;
  type: 'income' | 'expense';
  category: string;
  amountCents: number;
}

export interface FinancialBudget {
  id: string;
  department: string;
  allocatedCents: number;
  spentCents: number;
}

export interface FinancialInvoice {
  id: string;
  counterparty: string;
  dueDate: string;
  amountCents: number;
  status: 'open' | 'overdue' | 'paid';
}

export interface MonthlyFinancialSummary {
  month: string;
  revenueCents: number;
  expensesCents: number;
}

export interface FinanceSnapshot {
  source: 'simulated' | 'database';
  asOf: string;
  currency: 'USD';
  openingCashCents: number;
  currentCashCents?: number;
  transactions: FinancialTransaction[];
  budgets: FinancialBudget[];
  receivables: FinancialInvoice[];
  payables: FinancialInvoice[];
  monthlyTrend: MonthlyFinancialSummary[];
}

export interface FinanceInsight {
  title: string;
  summary: string;
  severity: InsightSeverity;
  evidence: string[];
  recommendation: string;
}

export interface FinanceAgentResult {
  agentId: FinanceAgentId;
  agentName: string;
  status: 'completed' | 'failed';
  completedAt: string;
  durationMs: number;
  insights: FinanceInsight[];
}

export interface FinanceAgentActivity extends FinanceAgentResult {
  id: string;
}

export interface FinanceOverview {
  source: 'simulated' | 'database';
  asOf: string;
  currency: 'USD';
  metrics: {
    cashBalanceCents: number;
    revenueCents: number;
    expensesCents: number;
    netIncomeCents: number;
    receivablesCents: number;
    payablesCents: number;
  };
  transactions: FinancialTransaction[];
  budgets: FinancialBudget[];
  receivables: FinancialInvoice[];
  payables: FinancialInvoice[];
  monthlyTrend: MonthlyFinancialSummary[];
  forecast: Array<{
    month: string;
    projectedCashCents: number;
  }>;
  insights: FinanceInsight[];
  activity: FinanceAgentActivity[];
}

export interface FinanceAssistantRequest {
  query: string;
}

export interface TransactionIngestionRequest {
  date: string;
  description: string;
  counterparty: string;
  type: 'income' | 'expense';
  category?: string;
  amountCents: number;
}

export interface TransactionIngestionResponse {
  id: string;
  category: string;
  status: 'recorded';
}

export interface BudgetIngestionRequest {
  department: string;
  allocatedCents: number;
  spentCents: number;
  periodStart: string;
  periodEnd: string;
}

export interface InvoiceIngestionRequest {
  direction: 'receivable' | 'payable';
  counterparty: string;
  dueDate: string;
  amountCents: number;
  status: 'open' | 'overdue' | 'paid';
}

export interface AccountIngestionRequest {
  name: string;
  currency: string;
  balanceCents: number;
}

export interface FinanceAssistantResponse {
  mode: 'rules-based';
  answer: string;
  delegatedTo: FinanceAgentId[];
  results: FinanceAgentResult[];
}
