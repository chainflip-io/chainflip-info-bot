import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { FastifyAdapter } from '@bull-board/fastify';
import { type Queue } from 'bullmq';
import fastify from 'fastify';
import { GraphQLClient } from 'graphql-request';
import env from './env.js';
import logger from './utils/logger.js';

const app = fastify({ loggerInstance: logger, disableRequestLogging: true });

export const explorerClient = new GraphQLClient(env.EXPLORER_GATEWAY_URL);
export const lpClient = new GraphQLClient(env.LP_GATEWAY_URL);

export const createServer = (queues: Queue[]) => {
  const serverAdapter = new FastifyAdapter();

  createBullBoard({
    queues: queues.map((q) => new BullMQAdapter(q)),
    serverAdapter,
  });

  const basePath = '/admin/queues';
  serverAdapter.setBasePath(basePath);
  app.register(serverAdapter.registerPlugin(), { prefix: basePath, basePath: '/' });

  app.get('/health', () => ({ status: 'ok' }));

  app.get('/', (req, res) => res.redirect('/admin/queues', 302));

  return app;
};
