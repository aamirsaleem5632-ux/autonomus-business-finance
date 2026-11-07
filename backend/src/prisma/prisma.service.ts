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

  async onModuleInit(): Promise<void> {
    if (!process.env.DATABASE_URL) {
      this.logger.warn(
        'DATABASE_URL is not set. Database connection skipped.',
      );
      return;
    }

    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('PostgreSQL database connected via Prisma ORM.');
    } catch (error) {
      this.isConnected = false;
      this.logger.warn(
        `PostgreSQL database connection pending: ${(error as Error).message}`,
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
    if (!process.env.DATABASE_URL) {
      return {
        status: 'unconfigured',
        details: 'DATABASE_URL environment variable is missing',
      };
    }

    try {
      await this.$queryRaw`SELECT 1`;
      this.isConnected = true;
      return {
        status: 'connected',
        details: 'PostgreSQL database responsive',
      };
    } catch (error) {
      this.isConnected = false;
      return {
        status: 'disconnected',
        details: (error as Error).message,
      };
    }
  }
}
