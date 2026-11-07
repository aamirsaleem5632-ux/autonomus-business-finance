import { ForbiddenException } from '@nestjs/common';
import { FinanceController } from './finance.controller.js';
import type { FinanceService } from './finance.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('FinanceController authorization', () => {
  const service = {
    getOverview: vi.fn(),
    getAgentDirectory: vi.fn(),
    getActivity: vi.fn(),
    runAgent: vi.fn(),
    askAssistant: vi.fn(),
  } as unknown as FinanceService;

  beforeEach(() => {
    vi.stubEnv('FINANCE_DATA_MODE', 'database');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('requires a viewer or admin key when PostgreSQL is connected', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://db.example/finance');
    const prisma = {
      checkHealth: vi.fn().mockResolvedValue({ status: 'connected' }),
    } as unknown as PrismaService;
    const controller = new FinanceController(service, prisma);

    await expect(controller.getAgents()).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.checkHealth).toHaveBeenCalledOnce();
  });

  it('allows the configured viewer key for connected database reads', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://db.example/finance');
    vi.stubEnv('FINANCE_VIEWER_API_KEY', 'v'.repeat(32));
    const prisma = {
      checkHealth: vi.fn().mockResolvedValue({ status: 'connected' }),
    } as unknown as PrismaService;
    const controller = new FinanceController(service, prisma);

    await expect(controller.getAgents('v'.repeat(32))).resolves.toEqual(
      service.getAgentDirectory(),
    );
  });

  it('allows the simulated read-only fallback when the database is unavailable', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://db.example/finance');
    const prisma = {
      checkHealth: vi.fn().mockResolvedValue({ status: 'disconnected' }),
    } as unknown as PrismaService;
    const controller = new FinanceController(service, prisma);

    await expect(controller.getAgents()).resolves.toEqual(
      service.getAgentDirectory(),
    );
  });
});
