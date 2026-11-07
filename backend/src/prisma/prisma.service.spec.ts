import { PrismaService } from './prisma.service.js';

describe('PrismaService simulated mode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not attempt a PostgreSQL connection when simulated mode is enabled', async () => {
    vi.stubEnv('FINANCE_DATA_MODE', 'simulated');
    const service = new PrismaService();
    const connect = vi.spyOn(service, '$connect');

    await service.onModuleInit();

    expect(connect).not.toHaveBeenCalled();
    await expect(service.checkHealth()).resolves.toEqual({
      status: 'unconfigured',
      details: 'Simulated finance mode enabled; database connection skipped.',
    });

    await service.onModuleDestroy();
    await service.$disconnect();
  });
});
