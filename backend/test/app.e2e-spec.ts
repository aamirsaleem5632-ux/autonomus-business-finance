import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { GlobalHttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';

describe('Health and API System (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/health (GET) should return system health status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body).toBeDefined();
    expect(['ok', 'degraded']).toContain(response.body.status);
    expect(response.body.service).toBe('autonomous-business-finance-backend');
    expect(response.body.version).toBe('0.1.0');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.database).toBeDefined();
    expect(response.body.memory).toBeDefined();
  });

  it('/api/health/error-demo (GET) should demonstrate global exception filter', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/error-demo')
      .expect(400);

    expect(response.body).toBeDefined();
    expect(response.body.statusCode).toBe(400);
    expect(response.body.path).toBe('/api/health/error-demo');
    expect(response.body.method).toBe('GET');
    expect(response.body.message).toContain('GlobalHttpExceptionFilter');
  });
});
