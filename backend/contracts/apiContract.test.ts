import { describe, it, expect } from 'vitest';
import { generateOpenAPISpec } from './openapiSpec';

describe('API OpenAPI Contract Tests', () => {
  it('should generate valid OpenAPI 3.0 document from Zod schemas', () => {
    const spec = generateOpenAPISpec();
    expect(spec.openapi).toBe('3.0.0');
    expect(spec.info.title).toContain('MediVoice AI');
    expect(spec.paths['/health']).toBeDefined();
    expect(spec.paths['/api/audit/log']).toBeDefined();
  });

  it('should validate Health route schema details', () => {
    const spec = generateOpenAPISpec();
    const healthPath = spec.paths['/health'];
    expect(healthPath.get).toBeDefined();
    expect(healthPath.get?.responses[200]).toBeDefined();
  });
});
