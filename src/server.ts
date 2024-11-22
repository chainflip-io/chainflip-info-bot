import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { FastifyAdapter } from '@bull-board/fastify';
import fastify from 'fastify';
import { GraphQLClient } from 'graphql-request';
import env from './env.js';
import { type QueueMap } from './queues/initialize.js';
import logger from './utils/logger.js';

export const explorerClient = new GraphQLClient(env.EXPLORER_GATEWAY_URL);
export const lpClient = new GraphQLClient(env.LP_GATEWAY_URL);

export const createServer = (queues: QueueMap) => {
  const app = fastify({ loggerInstance: logger, disableRequestLogging: true });

  const serverAdapter = new FastifyAdapter();

  const board = env.NODE_ENV === 'production' ? 'PROD' : 'DEV';

  createBullBoard({
    queues: Object.values(queues).map((q) => new BullMQAdapter(q)),
    serverAdapter,
    options: {
      uiConfig: {
        boardTitle: `Info Bot [${board}]`,
      },
    },
  });

  const basePath = '/admin/queues';
  serverAdapter.setBasePath(basePath);
  app.register(serverAdapter.registerPlugin(), { prefix: basePath, basePath: '/' });

  app.get('/health', async (req, res) => {
    const jobs = await queues.scheduler.getDelayed();

    const someJobPastDue = jobs.some(
      (j) => Date.now() - env.HEALTH_CHECK_GRACE_PERIOD_MS > j.timestamp + j.delay,
    );

    if (someJobPastDue) {
      logger.alert('found jobs past due');
      res.code(500);
      return { status: 'stalled' };
    }

    logger.debug('health check ok');
    return { status: 'ok' };
  });

  app.get('/', (req, res) => res.redirect('/admin/queues', 302));

  return app;
};
