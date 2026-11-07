import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { BadRequestException } from '@nestjs/common';

describe('HealthController', () => {
  let controller: HealthController;

  const mockPrismaService = {
    checkHealth: vi.fn().mockResolvedValue({
      status: 'connected',
      details: 'PostgreSQL database responsive',
    }),
  };

  const mockConfigService = {
    get: vi.fn((key: string) =>
      key === 'nodeEnv' ? 'test' : 'database',
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health status', async () => {
    const health = await controller.getHealth();
    expect(health.status).toBe('ok');
    expect(health.service).toBe('autonomous-business-finance-backend');
    expect(health.database.status).toBe('connected');
  });

  it('reports a healthy runtime with explicit simulated finance mode', async () => {
    mockConfigService.get.mockImplementation((key: string) =>
      key === 'nodeEnv' ? 'test' : 'simulated',
    );
    mockPrismaService.checkHealth.mockResolvedValue({
      status: 'unconfigured',
      details: 'Simulated finance mode enabled; database connection skipped.',
    });

    const health = await controller.getHealth();

    expect(health.status).toBe('ok');
    expect(health.database.status).toBe('unconfigured');
    expect(health.database.details).toContain('Simulated finance mode enabled');
  });

  it('should throw BadRequestException on error-demo', () => {
    expect(() => controller.triggerErrorDemo()).toThrow(BadRequestException);
  });
});
