import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const isVercel = process.env.VERCEL === '1';
const defaultUseInMemory = (isVercel && (!process.env.DB_HOST || process.env.DB_HOST === 'localhost'))
  ? 'true'
  : 'false';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default('*'),
  USE_IN_MEMORY_DB: z.string().default(defaultUseInMemory),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('logitrack_db'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  JWT_SECRET: z.string().default('logitrack-super-secret-key-change-in-production'),
  AUTH_ENABLED: z.string().default('false')
});

export const ENV = envSchema.parse(process.env);
export type EnvConfig = z.infer<typeof envSchema>;
