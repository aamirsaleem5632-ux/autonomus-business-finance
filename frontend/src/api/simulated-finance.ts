import type {
  FinanceAgent,
  FinanceAgentActivity,
  FinanceAgentId,
  FinanceAssistantResponse,
  FinanceInsight,
  FinanceOverview,
} from '../types/finance';

const agentDirectory: FinanceAgent[] = [
  {
    id: 'financial-analyst',
    name: 'Financial Analyst',
    operation: 'Calculates revenue, expenses, margin, and period-over-period changes.',
  },
  {
    id: 'expense-management',
    name: 'Expense Management Agent',
    operation: 'Categorizes expense descriptions and flags high-value spending.',
  },
  {
    id: 'cash-flow-management',
    name: 'Cash Flow Management Agent',
    operation: 'Projects cash using recent actual monthly net cash flow and open invoices.',
  },
  {
    id: 'budget-planning',
    name: 'Budget Planning Agent',
    operation: 'Calculates budget utilization and flags departments near or over limits.',
  },
  {
    id: 'financial-reporting',
    name: 'Financial Reporting Agent',
    operation: 'Builds current-period KPIs and explains their underlying figures.',
  },
];

const insightsByAgent: Record<FinanceAgentId, FinanceInsight> = {
  'financial-analyst': {
    title: 'Positive monthly operating result',
    summary: 'Simulated monthly revenue exceeds expenses by $63,160.',
    severity: 'info',
    evidence: ['Revenue: $184,500', 'Expenses: $121,340', 'Net income: $63,160'],
    recommendation: 'Review the monthly trend and protect the recurring revenue base.',
  },
  'expense-management': {
    title: 'Payroll is the largest expense category',
    summary: 'Payroll accounts for $64,000 of simulated monthly spending.',
    severity: 'info',
    evidence: ['Payroll: $64,000', 'Total expenses: $121,340'],
    recommendation: 'Compare staffing costs with the approved operating plan.',
  },
  'cash-flow-management': {
    title: 'Positive short-term cash outlook',
    summary: 'The simulated forecast projects cash increasing to $348,560 next month.',
    severity: 'info',
    evidence: ['Available cash: $285,400', 'Monthly net income: $63,160'],
    recommendation: 'Review upcoming receivables and payables before making commitments.',
  },
  'budget-planning': {
    title: 'People budget is close to its limit',
    summary: 'Simulated People spending has used about 98% of its allocation.',
    severity: 'warning',
    evidence: ['People budget: $65,000', 'People spending: $64,000'],
    recommendation: 'Review remaining planned People expenses before approving new spend.',
  },
  'financial-reporting': {
    title: 'Monthly finance summary',
    summary: 'The simulated month closed with $63,160 net income and $285,400 available cash.',
    severity: 'info',
    evidence: ['Revenue: $184,500', 'Expenses: $121,340', 'Available cash: $285,400'],
    recommendation: 'Compare these figures with finalized accounting records before reporting.',
  },
};

function agentName(agentId: FinanceAgentId): string {
  return agentDirectory.find((agent) => agent.id === agentId)!.name;
}

function createActivity(agentId: FinanceAgentId): FinanceAgentActivity {
  return {
    id: `simulated-${agentId}`,
    agentId,
    agentName: agentName(agentId),
    status: 'completed',
    completedAt: new Date().toISOString(),
    durationMs: 1,
    insights: [insightsByAgent[agentId]],
  };
}

function monthLabel(offset: number): string {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + offset);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

function dateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function getSimulatedFinanceAgents(): FinanceAgent[] {
  return agentDirectory.map((agent) => ({ ...agent }));
}

export function getSimulatedFinanceOverview(): FinanceOverview {
  const transactions: FinanceOverview['transactions'] = [
    {
      id: 'simulated-tx-1',
      date: dateOffset(-1),
      description: 'Enterprise subscription renewals',
      counterparty: 'Northstar Software',
      type: 'income',
      category: 'Subscriptions',
      amountCents: 9_200_000,
    },
    {
      id: 'simulated-tx-2',
      date: dateOffset(-3),
      description: 'Monthly payroll',
      counterparty: 'Payroll',
      type: 'expense',
      category: 'Payroll',
      amountCents: 6_400_000,
    },
    {
      id: 'simulated-tx-3',
      date: dateOffset(-5),
      description: 'Annual platform contract',
      counterparty: 'Cloud Platform',
      type: 'income',
      category: 'Services',
      amountCents: 4_500_000,
    },
    {
      id: 'simulated-tx-4',
      date: dateOffset(-7),
      description: 'Cloud infrastructure',
      counterparty: 'Cloud Platform',
      type: 'expense',
      category: 'Infrastructure',
      amountCents: 874_000,
    },
    {
      id: 'simulated-tx-5',
      date: dateOffset(-9),
      description: 'Professional services',
      counterparty: 'Acme Consulting',
      type: 'income',
      category: 'Services',
      amountCents: 2_750_000,
    },
    {
      id: 'simulated-tx-6',
      date: dateOffset(-12),
      description: 'Digital campaign',
      counterparty: 'Bright Ads',
      type: 'expense',
      category: 'Marketing',
      amountCents: 1_560_000,
    },
    {
      id: 'simulated-tx-7',
      date: dateOffset(-16),
      description: 'Office lease',
      counterparty: 'Main Street Properties',
      type: 'expense',
      category: 'Facilities',
      amountCents: 1_800_000,
    },
    {
      id: 'simulated-tx-8',
      date: dateOffset(-20),
      description: 'Implementation milestone',
      counterparty: 'Contoso Group',
      type: 'income',
      category: 'Services',
      amountCents: 2_000_000,
    },
    {
      id: 'simulated-tx-9',
      date: dateOffset(-24),
      description: 'Team collaboration tools',
      counterparty: 'Work Tools Inc.',
      type: 'expense',
      category: 'Software',
      amountCents: 420_000,
    },
    {
      id: 'simulated-tx-10',
      date: dateOffset(-28),
      description: 'Customer workshop travel',
      counterparty: 'Regional Air',
      type: 'expense',
      category: 'Travel',
      amountCents: 1_080_000,
    },
  ];

  const activity = agentDirectory.map((agent) => createActivity(agent.id));
  const netIncomeCents = 6_316_000;

  return {
    source: 'simulated',
    asOf: new Date().toISOString(),
    currency: 'USD',
    metrics: {
      cashBalanceCents: 28_540_000,
      revenueCents: 18_450_000,
      expensesCents: 12_134_000,
      netIncomeCents,
      receivablesCents: 4_400_000,
      payablesCents: 3_074_000,
    },
    transactions,
    budgets: [
      { id: 'simulated-budget-1', department: 'People', allocatedCents: 6_500_000, spentCents: 6_400_000 },
      { id: 'simulated-budget-2', department: 'Operations', allocatedCents: 5_000_000, spentCents: 2_674_000 },
      { id: 'simulated-budget-3', department: 'Marketing', allocatedCents: 2_200_000, spentCents: 1_560_000 },
      { id: 'simulated-budget-4', department: 'Engineering', allocatedCents: 2_500_000, spentCents: 1_500_000 },
    ],
    receivables: [
      { id: 'simulated-ar-1', counterparty: 'Northstar Software', dueDate: dateOffset(12), amountCents: 2_400_000, status: 'open' },
      { id: 'simulated-ar-2', counterparty: 'Contoso Group', dueDate: dateOffset(-4), amountCents: 1_250_000, status: 'overdue' },
      { id: 'simulated-ar-3', counterparty: 'Acme Consulting', dueDate: dateOffset(20), amountCents: 750_000, status: 'open' },
    ],
    payables: [
      { id: 'simulated-ap-1', counterparty: 'Main Street Properties', dueDate: dateOffset(8), amountCents: 1_800_000, status: 'open' },
      { id: 'simulated-ap-2', counterparty: 'Cloud Platform', dueDate: dateOffset(15), amountCents: 874_000, status: 'open' },
      { id: 'simulated-ap-3', counterparty: 'Bright Ads', dueDate: dateOffset(-2), amountCents: 400_000, status: 'overdue' },
    ],
    monthlyTrend: [
      { month: monthLabel(-11), revenueCents: 15_800_000, expensesCents: 11_700_000 },
      { month: monthLabel(-10), revenueCents: 16_100_000, expensesCents: 11_850_000 },
      { month: monthLabel(-9), revenueCents: 16_450_000, expensesCents: 12_050_000 },
      { month: monthLabel(-8), revenueCents: 16_000_000, expensesCents: 11_800_000 },
      { month: monthLabel(-7), revenueCents: 16_700_000, expensesCents: 12_150_000 },
      { month: monthLabel(-6), revenueCents: 16_900_000, expensesCents: 12_300_000 },
      { month: monthLabel(-5), revenueCents: 16_200_000, expensesCents: 11_900_000 },
      { month: monthLabel(-4), revenueCents: 17_400_000, expensesCents: 12_100_000 },
      { month: monthLabel(-3), revenueCents: 16_900_000, expensesCents: 12_500_000 },
      { month: monthLabel(-2), revenueCents: 18_100_000, expensesCents: 12_200_000 },
      { month: monthLabel(-1), revenueCents: 17_800_000, expensesCents: 12_700_000 },
      { month: monthLabel(0), revenueCents: 18_450_000, expensesCents: 12_134_000 },
    ],
    forecast: [1, 2, 3].map((offset) => ({
      month: monthLabel(offset),
      projectedCashCents: 28_540_000 + netIncomeCents * offset,
    })),
    insights: agentDirectory.map((agent) => insightsByAgent[agent.id]),
    activity,
  };
}

export function runSimulatedFinanceAgent(agentId: string): FinanceAgentActivity {
  const agent = agentDirectory.find((candidate) => candidate.id === agentId);
  if (!agent) {
    throw new Error(`Unsupported finance agent: ${agentId}`);
  }
  return createActivity(agent.id);
}

export function askSimulatedFinanceAssistant(query: string): FinanceAssistantResponse {
  const normalizedQuery = query.toLowerCase();
  let delegatedTo: FinanceAgentId[];

  if (/cash|liquid|forecast|runway/.test(normalizedQuery)) {
    delegatedTo = ['cash-flow-management'];
  } else if (/budget|department|allocation/.test(normalizedQuery)) {
    delegatedTo = ['budget-planning'];
  } else if (/expense|spend|transaction|cost/.test(normalizedQuery)) {
    delegatedTo = ['expense-management'];
  } else if (/report|summary|kpi/.test(normalizedQuery)) {
    delegatedTo = ['financial-reporting'];
  } else {
    delegatedTo = ['financial-analyst'];
  }

  const results = delegatedTo.map((agentId) => {
    const activity = createActivity(agentId);
    return {
      agentId: activity.agentId,
      agentName: activity.agentName,
      status: activity.status,
      completedAt: activity.completedAt,
      durationMs: activity.durationMs,
      insights: activity.insights,
    };
  });
  return {
    mode: 'rules-based',
    answer: `Using local simulated finance data: ${results.map((result) => result.insights[0].summary).join(' ')}`,
    delegatedTo,
    results,
  };
}
