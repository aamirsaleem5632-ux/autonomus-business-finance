export interface EnvironmentVariables {
  PORT: number;
  NODE_ENV: string;
  CORS_ORIGIN: string;
  DATABASE_URL: string;
}

export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  database: {
    url: process.env.DATABASE_URL || '',
  },
});
