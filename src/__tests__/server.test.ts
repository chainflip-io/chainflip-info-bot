import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { createServer } from '../server.js';

describe(createServer, () => {
  let getDelayed: Mock;
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    getDelayed = vi.fn();
    server = createServer({ scheduler: { getDelayed } } as any);
  });

  it('returns 200 when no jobs are scheduled', async () => {
    vi.mocked(getDelayed).mockReturnValueOnce([]);
    const res = await server.inject({ path: '/health' });
    expect(JSON.parse(res.body)).toEqual({ status: 'ok' });
    expect(res.statusCode).toBe(200);
  });

  it('returns 200 when no jobs are past due', async () => {
    vi.mocked(getDelayed).mockReturnValueOnce([{ delay: 15000, timestamp: Date.now() }]);
    const res = await server.inject({ path: '/health' });
    expect(JSON.parse(res.body)).toEqual({ status: 'ok' });
    expect(res.statusCode).toBe(200);
  });

  it('returns 200 when at least one job is past due within the grace period', async () => {
    vi.mocked(getDelayed).mockReturnValueOnce([
      { delay: 15000, timestamp: Date.now() },
      { delay: 15000, timestamp: Date.now() - 20_000 },
    ]);
    const res = await server.inject({ path: '/health' });
    expect(JSON.parse(res.body)).toEqual({ status: 'ok' });
    expect(res.statusCode).toBe(200);
  });

  it('returns 500 when at least one job is past due', async () => {
    vi.mocked(getDelayed).mockReturnValueOnce([
      { delay: 15000, timestamp: Date.now() },
      { delay: 15000, timestamp: Date.now() - 30_000 },
    ]);
    const res = await server.inject({ path: '/health' });
    expect(JSON.parse(res.body)).toEqual({ status: 'stalled' });
    expect(res.statusCode).toBe(500);
  });

  it('redirects from root to the admin queues', async () => {
    const res = await server.inject({ path: '/' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/admin/queues');
  });
});
