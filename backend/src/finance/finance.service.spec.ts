import { BadRequestException } from '@nestjs/common';
import { FinanceService } from './finance.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('FinanceService', () => {
  let service: FinanceService;

  beforeEach(() => {
    const prisma = {
      checkHealth: vi.fn().mockResolvedValue({ status: 'unconfigured' }),
    } as unknown as PrismaService;
    service = new FinanceService(prisma);
  });

  it('calculates the simulated monthly totals using integer cents', async () => {
    const overview = await service.getOverview();

    expect(overview.source).toBe('simulated');
    expect(overview.metrics).toMatchObject({
      cashBalanceCents: 28_540_000,
      revenueCents: 18_450_000,
      expensesCents: 12_134_000,
      netIncomeCents: 6_316_000,
      receivablesCents: 4_400_000,
      payablesCents: 3_074_000,
    });
    expect(overview.insights).toHaveLength(5);
    expect(overview.activity).toHaveLength(5);
    expect(Object.isFrozen(overview.transactions)).toBe(true);
    expect(Object.isFrozen(overview.transactions[0])).toBe(true);
    expect(overview.insights.find((item) => item.title === 'Expense review')?.severity).toBe(
      'warning',
    );
  });

  it('routes a cash query to the cash flow specialist and reports evidence', async () => {
    const response = await service.askAssistant('Will cash flow stay positive?');

    expect(response.mode).toBe('rules-based');
    expect(response.delegatedTo).toEqual(['cash-flow-management']);
    expect(response.results[0]?.insights[0]?.evidence).toContain(
      'Estimated current cash: $285,400.00',
    );
    expect(response.answer).toContain('trend-based projection');
  });

  it('rejects empty or oversized assistant queries', async () => {
    await expect(service.askAssistant(' ')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.askAssistant('a'.repeat(1001))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects unsupported agent names', async () => {
    await expect(service.runAgent('payment-executor')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects invalid financial records before attempting a database write', async () => {
    await expect(
      service.ingestTransaction({
        date: 'not-a-date',
        description: 'Malformed transaction',
        counterparty: 'Example',
        type: 'expense',
        amountCents: -1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('categorizes and atomically audits a valid transaction ingestion', async () => {
    const executeRaw = vi.fn().mockResolvedValue(1);
    const transaction = { $executeRaw: executeRaw };
    const prisma = {
      checkHealth: vi.fn().mockResolvedValue({ status: 'connected' }),
      $transaction: vi.fn(
        async (operation: (client: typeof transaction) => Promise<unknown>) =>
          operation(transaction),
      ),
    } as unknown as PrismaService;
    service = new FinanceService(prisma);

    const result = await service.ingestTransaction({
      date: '2026-11-07T09:00:00.000Z',
      description: 'Cloud hosting invoice',
      counterparty: 'Example Cloud',
      type: 'expense',
      amountCents: 12500,
    });

    expect(result).toMatchObject({ category: 'Infrastructure', status: 'recorded' });
    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(executeRaw).toHaveBeenCalledTimes(2);
  });
});
