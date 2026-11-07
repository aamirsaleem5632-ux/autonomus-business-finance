import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface DatabaseHealthStatus {
  status: 'connected' | 'disconnected' | 'unconfigured';
  details?: string;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;
  private lastHealthCheckAt = 0;
  private lastHealthStatus: DatabaseHealthStatus | undefined;
  private healthCheckInFlight: Promise<DatabaseHealthStatus> | undefined;

  async onModuleInit(): Promise<void> {
    if (this.isSimulatedDataMode()) {
      this.lastHealthStatus = {
        status: 'unconfigured',
        details: 'Simulated finance mode enabled; database connection skipped.',
      };
      this.lastHealthCheckAt = Date.now();
      this.logger.log(this.lastHealthStatus.details);
      return;
    }

    if (!process.env.DATABASE_URL) {
      this.logger.warn(
        'DATABASE_URL is not set. Database connection skipped.',
      );
      return;
    }

    try {
      await this.$connect();
      this.isConnected = true;
      this.lastHealthStatus = {
        status: 'connected',
        details: 'PostgreSQL database responsive',
      };
      this.lastHealthCheckAt = Date.now();
      this.logger.log('PostgreSQL database connected via Prisma ORM.');
    } catch (error) {
      this.isConnected = false;
      this.lastHealthStatus = {
        status: 'disconnected',
        details: 'PostgreSQL connection unavailable',
      };
      this.lastHealthCheckAt = Date.now();
      this.logger.warn(
        `PostgreSQL database connection pending: ${error instanceof Error ? error.name : 'Unknown error'}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.isConnected) {
      await this.$disconnect();
      this.logger.log('Disconnected from PostgreSQL database.');
    }
  }

  async checkHealth(): Promise<DatabaseHealthStatus> {
    if (this.isSimulatedDataMode()) {
      return {
        status: 'unconfigured',
        details: 'Simulated finance mode enabled; database connection skipped.',
      };
    }

    if (!process.env.DATABASE_URL) {
      return {
        status: 'unconfigured',
        details: 'DATABASE_URL environment variable is missing',
      };
    }

    if (Date.now() - this.lastHealthCheckAt < 2_000 && this.lastHealthStatus) {
      return this.lastHealthStatus;
    }

    this.healthCheckInFlight ??= this.checkDatabaseConnection();
    try {
      return await this.healthCheckInFlight;
    } finally {
      this.healthCheckInFlight = undefined;
    }
  }

  private async checkDatabaseConnection(): Promise<DatabaseHealthStatus> {
    try {
      await this.$queryRaw`SELECT 1`;
      this.isConnected = true;
      this.lastHealthStatus = {
        status: 'connected',
        details: 'PostgreSQL database responsive',
      };
    } catch {
      this.isConnected = false;
      this.lastHealthStatus = {
        status: 'disconnected',
        details: 'PostgreSQL connection unavailable',
      };
    }
    this.lastHealthCheckAt = Date.now();
    return this.lastHealthStatus;
  }

  private isSimulatedDataMode(): boolean {
    return process.env.FINANCE_DATA_MODE === 'simulated';
  }
}
