import { describe, it, expect, vi } from 'vitest';

describe('Environment Validation', () => {
  it('should pass if all required environment variables are set', async () => {
    // Save current env
    const originalEnv = { ...process.env };
    
    // Set required env variables
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.CLERK_SECRET_KEY = 'sk_test_clerk';
    process.env.GROQ_API_KEY = 'gsk_test_groq';
    process.env.PORT = '3000';
    
    // Import env validation dynamically
    const { env } = await import('../src/config/env');
    
    expect(env.PORT).toBe('3000');
    expect(env.DATABASE_URL).toBe('postgresql://test:test@localhost:5432/test');
    
    // Restore env
    process.env = originalEnv;
  });
});
