import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

const HealthResponseSchema = registry.register(
  'HealthResponse',
  z.object({
    status: z.string(),
    timestamp: z.string(),
    service: z.string(),
    uptime: z.number(),
  })
);

registry.registerPath({
  method: 'get',
  path: '/health',
  summary: 'Backend Service Health Check',
  responses: {
    200: {
      description: 'System health metrics',
      content: {
        'application/json': {
          schema: HealthResponseSchema,
        },
      },
    },
  },
});

const AuditLogRequestSchema = registry.register(
  'AuditLogRequest',
  z.object({
    action: z.string().min(1),
    message: z.string().optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
  })
);

registry.registerPath({
  method: 'post',
  path: '/api/audit/log',
  summary: 'Submit Audit Log Entry',
  request: {
    body: {
      content: {
        'application/json': {
          schema: AuditLogRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Audit log received and signed',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

export function generateOpenAPISpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'MediVoice AI Backend API Specs',
      version: '1.0.0',
      description: 'OpenAPI specification generated from Zod schemas',
    },
    servers: [{ url: 'http://localhost:3000' }],
  });
}
