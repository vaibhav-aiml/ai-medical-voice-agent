import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env before validation
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  // Required — server will not start without these
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),

  // Optional — server starts but features may be limited
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  OPENAI_API_KEY: z.string().optional(),
  ASSEMBLYAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  KEEP_AWAKE_URL: z.string().optional(),
  KEEP_AWAKE_INTERVAL: z.string().default('840000'), // 14 minutes in milliseconds
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    const missingVars: string[] = [];

    for (const [key, value] of Object.entries(formatted)) {
      if (key === '_errors') continue;
      const errors = (value as any)?._errors;
      if (errors && errors.length > 0) {
        missingVars.push(`  ❌ ${key}: ${errors.join(', ')}`);
      }
    }

    console.error('\n🚨 Environment variable validation failed:\n');
    console.error(missingVars.join('\n'));
    console.error('\nPlease check your .env file and ensure all required variables are set.\n');
    process.exit(1);
  }

  // Warn about optional vars that are missing
  const env = result.data;
  const optionalWarnings: string[] = [];

  if (!env.OPENAI_API_KEY) optionalWarnings.push('OPENAI_API_KEY — OpenAI fallback disabled');
  if (!env.ASSEMBLYAI_API_KEY) optionalWarnings.push('ASSEMBLYAI_API_KEY — Speech-to-text disabled');
  if (!env.STRIPE_SECRET_KEY) optionalWarnings.push('STRIPE_SECRET_KEY — Payments disabled');
  if (!env.REDIS_URL) optionalWarnings.push('REDIS_URL — Caching disabled');
  if (!env.TWILIO_ACCOUNT_SID) optionalWarnings.push('TWILIO_ACCOUNT_SID — SMS notifications disabled');
  if (!env.EMAIL_USER) optionalWarnings.push('EMAIL_USER — Email notifications disabled');

  if (optionalWarnings.length > 0) {
    console.warn('\n⚠️  Optional environment variables not configured:');
    optionalWarnings.forEach(w => console.warn(`  ⚠️  ${w}`));
    console.warn('');
  }

  return env;
}

export const env = validateEnv();
