import { request } from './client';
import type { HealthResponse } from '../types/health';

/**
 * Fetches the backend system health check payload.
 * Routes to GET /api/health
 */
export async function getBackendHealth(): Promise<{ data: HealthResponse; latencyMs: number }> {
  const startTime = performance.now();
  const data = await request<HealthResponse>('/health');
  const latencyMs = Math.round(performance.now() - startTime);
  return { data, latencyMs };
}

/**
 * Intentionally calls the error-demo endpoint to verify global exception filter and client error handling.
 * Routes to GET /api/health/error-demo
 */
export async function testErrorHandling(): Promise<void> {
  await request('/health/error-demo');
}
