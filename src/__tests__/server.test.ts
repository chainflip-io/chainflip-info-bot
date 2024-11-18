import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createServer } from '../server.js';
import { Pulse } from '../utils/pulse.js';

describe(createServer, () => {
  let pulse: Pulse;
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    pulse = new Pulse();
    server = createServer([], pulse);
  });

  it('returns 200 when the pulse returns healthy', async () => {
    vi.spyOn(pulse, 'check').mockReturnValueOnce('healthy');
    const res = await server.inject({ path: '/health' });
    expect(JSON.parse(res.body)).toEqual({ status: 'healthy' });
    expect(res.statusCode).toBe(200);
  });

  it('returns 200 when the pulse returns dying', async () => {
    vi.spyOn(pulse, 'check').mockReturnValueOnce('dying');
    const res = await server.inject({ path: '/health' });
    expect(JSON.parse(res.body)).toEqual({ status: 'dying' });
    expect(res.statusCode).toBe(200);
  });

  it('returns 500 when the pulse returns dead', async () => {
    vi.spyOn(pulse, 'check').mockReturnValueOnce('dead');
    const res = await server.inject({ path: '/health' });
    expect(JSON.parse(res.body)).toEqual({ status: 'dead' });
    expect(res.statusCode).toBe(500);
  });

  it('redirects from root to the admin queues', async () => {
    const res = await server.inject({ path: '/' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/admin/queues');
  });
});
