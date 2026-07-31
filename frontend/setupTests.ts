import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { beforeAll, afterEach, afterAll } from 'vitest';

export const handlers = [
  http.get('*/health/ping', () => {
    return HttpResponse.json({ status: 'awake', uptime: 100 });
  }),
  http.post('*/api/consultations', () => {
    return HttpResponse.json({ success: true, consultationId: 'consult-msw-123' });
  })
];

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
