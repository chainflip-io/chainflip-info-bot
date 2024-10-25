import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { FastifyAdapter } from '@bull-board/fastify';
import { type Queue } from 'bullmq';
import fastify from 'fastify';

const app = fastify({
  logger: true,
});

export const logger = app.log;

export const createServer = (queues: Queue[]) => {
  const serverAdapter = new FastifyAdapter();

  createBullBoard({
    queues: queues.map((q) => new BullMQAdapter(q)),
    serverAdapter,
  });

  const basePath = '/admin/queues';
  serverAdapter.setBasePath(basePath);
  app.register(serverAdapter.registerPlugin(), { prefix: basePath, basePath: '/' });

  app.get('/health', () => {
    return { status: 'ok' };
  });

  return app;
};
