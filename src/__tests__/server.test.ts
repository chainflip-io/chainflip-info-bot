import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { createServer } from '../server.js';
import logger from '../utils/logger.js';

describe(createServer, () => {
  let getDelayed: Mock;
  let getJobCounts: Mock;
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    getDelayed = vi.fn();
    getJobCounts = vi.fn().mockResolvedValue({ wait: 0, active: 0, delayed: 2 });
    server = createServer({
      scheduler: {
        getDelayed,
        getJobCounts,
        // the bullboard library checks this to ensure that only bullmq queues are passed
        metaValues: { version: 'bullmq' },
      },
    } as any);
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

  it('logs the queue counts and the past due jobs', async () => {
    const crit = vi.spyOn(logger, 'crit').mockReturnValue(logger);
    vi.mocked(getDelayed).mockReturnValueOnce([
      { id: '1', delay: 15000, timestamp: Date.now() },
      { id: '2', delay: 15000, timestamp: Date.now() - 30_000 },
    ]);

    await server.inject({ path: '/health' });

    expect(crit).toHaveBeenCalledWith('found jobs past due', {
      counts: { wait: 0, active: 0, delayed: 2 },
      delayedCount: 2,
      pastDueCount: 1,
      pastDue: [{ id: '2', overdueMs: expect.any(Number) as number }],
    });
  });

  it('redirects from root to the admin queues', async () => {
    const res = await server.inject({ path: '/' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/admin/queues');
  });
});
