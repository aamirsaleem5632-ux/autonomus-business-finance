import type { FinanceSnapshot } from './finance.types.js';

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function monthLabel(monthOffset: number): string {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + monthOffset);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

export function createDemoFinanceSnapshot(): FinanceSnapshot {
  return {
    source: 'simulated',
    asOf: new Date().toISOString(),
    currency: 'USD',
    openingCashCents: 22_224_000,
    transactions: [
      {
        id: 'demo-tx-1',
        date: daysAgo(1),
        description: 'Enterprise subscription renewals',
        counterparty: 'Northstar Software',
        type: 'income',
        category: 'Subscriptions',
        amountCents: 9_200_000,
      },
      {
        id: 'demo-tx-2',
        date: daysAgo(3),
        description: 'Monthly payroll',
        counterparty: 'Payroll',
        type: 'expense',
        category: 'Payroll',
        amountCents: 6_400_000,
      },
      {
        id: 'demo-tx-3',
        date: daysAgo(5),
        description: 'Annual platform contract',
        counterparty: 'Cloud Platform',
        type: 'income',
        category: 'Services',
        amountCents: 4_500_000,
      },
      {
        id: 'demo-tx-4',
        date: daysAgo(7),
        description: 'Cloud infrastructure',
        counterparty: 'Cloud Platform',
        type: 'expense',
        category: 'Infrastructure',
        amountCents: 874_000,
      },
      {
        id: 'demo-tx-5',
        date: daysAgo(9),
        description: 'Professional services',
        counterparty: 'Acme Consulting',
        type: 'income',
        category: 'Services',
        amountCents: 2_750_000,
      },
      {
        id: 'demo-tx-6',
        date: daysAgo(12),
        description: 'Digital campaign',
        counterparty: 'Bright Ads',
        type: 'expense',
        category: 'Marketing',
        amountCents: 1_560_000,
      },
      {
        id: 'demo-tx-7',
        date: daysAgo(16),
        description: 'Office lease',
        counterparty: 'Main Street Properties',
        type: 'expense',
        category: 'Facilities',
        amountCents: 1_800_000,
      },
      {
        id: 'demo-tx-8',
        date: daysAgo(20),
        description: 'Implementation milestone',
        counterparty: 'Contoso Group',
        type: 'income',
        category: 'Services',
        amountCents: 2_000_000,
      },
      {
        id: 'demo-tx-9',
        date: daysAgo(24),
        description: 'Team collaboration tools',
        counterparty: 'Work Tools Inc.',
        type: 'expense',
        category: 'Software',
        amountCents: 420_000,
      },
      {
        id: 'demo-tx-10',
        date: daysAgo(28),
        description: 'Customer workshop travel',
        counterparty: 'Regional Air',
        type: 'expense',
        category: 'Travel',
        amountCents: 1_080_000,
      },
    ],
    budgets: [
      {
        id: 'demo-budget-1',
        department: 'People',
        allocatedCents: 6_500_000,
        spentCents: 6_400_000,
      },
      {
        id: 'demo-budget-2',
        department: 'Operations',
        allocatedCents: 5_000_000,
        spentCents: 2_674_000,
      },
      {
        id: 'demo-budget-3',
        department: 'Marketing',
        allocatedCents: 2_200_000,
        spentCents: 1_560_000,
      },
      {
        id: 'demo-budget-4',
        department: 'Engineering',
        allocatedCents: 2_500_000,
        spentCents: 1_500_000,
      },
    ],
    receivables: [
      {
        id: 'demo-ar-1',
        counterparty: 'Northstar Software',
        dueDate: daysAgo(-12),
        amountCents: 2_400_000,
        status: 'open',
      },
      {
        id: 'demo-ar-2',
        counterparty: 'Contoso Group',
        dueDate: daysAgo(4),
        amountCents: 1_250_000,
        status: 'overdue',
      },
      {
        id: 'demo-ar-3',
        counterparty: 'Acme Consulting',
        dueDate: daysAgo(-20),
        amountCents: 750_000,
        status: 'open',
      },
    ],
    payables: [
      {
        id: 'demo-ap-1',
        counterparty: 'Main Street Properties',
        dueDate: daysAgo(-8),
        amountCents: 1_800_000,
        status: 'open',
      },
      {
        id: 'demo-ap-2',
        counterparty: 'Cloud Platform',
        dueDate: daysAgo(-15),
        amountCents: 874_000,
        status: 'open',
      },
      {
        id: 'demo-ap-3',
        counterparty: 'Bright Ads',
        dueDate: daysAgo(2),
        amountCents: 400_000,
        status: 'overdue',
      },
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
  };
}
