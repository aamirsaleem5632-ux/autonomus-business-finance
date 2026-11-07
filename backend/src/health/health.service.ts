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

    // In phase 1, database connectivity is prepared; if disconnected in local dev without running postgres,
    // status is reported as degraded rather than completely offline so the service remains operational.
    const overallStatus: 'ok' | 'degraded' | 'error' =
      dbHealth.status === 'connected'
        ? 'ok'
        : dbHealth.status === 'unconfigured'
          ? 'degraded'
          : 'degraded';

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
