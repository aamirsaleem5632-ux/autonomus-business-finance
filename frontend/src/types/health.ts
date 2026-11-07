export interface DatabaseHealthStatus {
  status: 'connected' | 'disconnected' | 'unconfigured';
  details?: string;
}

export interface MemoryStats {
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  memory: MemoryStats;
  database: DatabaseHealthStatus;
}

export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}
