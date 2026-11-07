import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import { FinanceService } from './finance.service.js';
import { requireFinanceRole } from './finance-auth.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  FinanceAgentActivity,
  FinanceAgentResult,
  FinanceAssistantResponse,
  FinanceOverview,
} from './finance.types.js';

@Controller('finance')
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('overview')
  async getOverview(
    @Headers('x-finance-api-key') apiKey?: string,
  ): Promise<FinanceOverview> {
    await this.authorizeRead(apiKey);
    return this.financeService.getOverview();
  }

  @Get('agents')
  async getAgents(
    @Headers('x-finance-api-key') apiKey?: string,
  ): Promise<ReturnType<FinanceService['getAgentDirectory']>> {
    await this.authorizeRead(apiKey);
    return this.financeService.getAgentDirectory();
  }

  @Get('activity')
  async getActivity(
    @Headers('x-finance-api-key') apiKey?: string,
  ): Promise<FinanceAgentActivity[]> {
    await this.authorizeRead(apiKey);
    return this.financeService.getActivity();
  }

  @Post('agents/:agentId/run')
  async runAgent(
    @Param('agentId') agentId: string,
    @Headers('x-finance-api-key') apiKey?: string,
  ): Promise<FinanceAgentResult> {
    await this.authorizeRead(apiKey);
    return this.financeService.runAgent(agentId);
  }

  @Post('assistant')
  async askAssistant(
    @Body() body: { query?: unknown },
    @Headers('x-finance-api-key') apiKey?: string,
  ): Promise<FinanceAssistantResponse> {
    await this.authorizeRead(apiKey);
    return this.financeService.askAssistant(body?.query);
  }

  @Post('transactions')
  ingestTransaction(
    @Body() body: unknown,
    @Headers('x-finance-api-key') apiKey?: string,
  ) {
    requireFinanceRole(apiKey, 'admin');
    return this.financeService.ingestTransaction(body);
  }

  @Post('budgets')
  ingestBudget(
    @Body() body: unknown,
    @Headers('x-finance-api-key') apiKey?: string,
  ) {
    requireFinanceRole(apiKey, 'admin');
    return this.financeService.ingestBudget(body);
  }

  @Post('invoices')
  ingestInvoice(
    @Body() body: unknown,
    @Headers('x-finance-api-key') apiKey?: string,
  ) {
    requireFinanceRole(apiKey, 'admin');
    return this.financeService.ingestInvoice(body);
  }

  @Post('accounts')
  ingestAccount(
    @Body() body: unknown,
    @Headers('x-finance-api-key') apiKey?: string,
  ) {
    requireFinanceRole(apiKey, 'admin');
    return this.financeService.ingestAccount(body);
  }

  private async authorizeRead(apiKey: string | undefined): Promise<void> {
    if (process.env.FINANCE_DATA_MODE === 'simulated') {
      return;
    }
    if (
      process.env.DATABASE_URL &&
      (await this.prisma.checkHealth()).status === 'connected'
    ) {
      requireFinanceRole(apiKey, 'viewer');
    }
  }
}
