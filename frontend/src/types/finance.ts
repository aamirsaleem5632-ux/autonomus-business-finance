export type FinanceAgentId =
  | 'financial-analyst'
  | 'expense-management'
  | 'cash-flow-management'
  | 'budget-planning'
  | 'financial-reporting';

export interface FinanceInsight {
  title: string;
  summary: string;
  severity: 'info' | 'warning' | 'critical';
  evidence: string[];
  recommendation: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  counterparty: string;
  type: 'income' | 'expense';
  category: string;
  amountCents: number;
}

export interface FinanceAgentActivity {
  id: string;
  agentId: FinanceAgentId;
  agentName: string;
  status: 'completed' | 'failed';
  completedAt: string;
  durationMs: number;
  insights: FinanceInsight[];
}

export interface FinanceAgent {
  id: FinanceAgentId;
  name: string;
  operation: string;
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
  budgets: Array<{
    id: string;
    department: string;
    allocatedCents: number;
    spentCents: number;
  }>;
  receivables: Array<{
    id: string;
    counterparty: string;
    dueDate: string;
    amountCents: number;
    status: 'open' | 'overdue' | 'paid';
  }>;
  payables: Array<{
    id: string;
    counterparty: string;
    dueDate: string;
    amountCents: number;
    status: 'open' | 'overdue' | 'paid';
  }>;
  monthlyTrend: Array<{
    month: string;
    revenueCents: number;
    expensesCents: number;
  }>;
  forecast: Array<{
    month: string;
    projectedCashCents: number;
  }>;
  insights: FinanceInsight[];
  activity: FinanceAgentActivity[];
}

export interface FinanceAssistantResponse {
  mode: 'rules-based';
  answer: string;
  delegatedTo: FinanceAgentId[];
  results: Array<Omit<FinanceAgentActivity, 'id'>>;
}
