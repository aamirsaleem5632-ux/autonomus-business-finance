import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { HealthService } from './health.service.js';
import type { HealthCheckResponse } from './dto/health-response.dto.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getHealth(): Promise<HealthCheckResponse> {
    return this.healthService.getHealth();
  }

  @Get('error-demo')
  triggerErrorDemo(): never {
    throw new BadRequestException(
      'Demonstration of GlobalHttpExceptionFilter handling validation or client errors.',
    );
  }
}
