import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import type { HealthCheckResponse } from './dto/health-response.dto.js';

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async getHealth(): Promise<HealthCheckResponse> {
    const memoryUsage = process.memoryUsage();
    const dbHealth = await this.prismaService.checkHealth();
    const env = this.configService.get<string>('nodeEnv') || 'development';
    const simulatedMode =
      this.configService.get<string>('financeDataMode') === 'simulated';

    const overallStatus: 'ok' | 'degraded' | 'error' =
      dbHealth.status === 'connected' || simulatedMode ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      service: 'autonomous-business-finance-backend',
      version: '0.1.0',
      environment: env,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      memory: {
        heapUsedMB: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMB: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        rssMB: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
      },
      database: dbHealth,
    };
  }
}
