import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { FastifyAdapter } from '@bull-board/fastify';
import { unreachable } from '@chainflip/utils/assertion';
import { type Queue } from 'bullmq';
import fastify from 'fastify';
import { GraphQLClient } from 'graphql-request';
import env from './env.js';
import logger from './utils/logger.js';
import { type Pulse } from './utils/pulse.js';

export const explorerClient = new GraphQLClient(env.EXPLORER_GATEWAY_URL);
export const lpClient = new GraphQLClient(env.LP_GATEWAY_URL);

export const createServer = (queues: Queue[], pulse: Pulse) => {
  const app = fastify({ loggerInstance: logger, disableRequestLogging: true });

  const serverAdapter = new FastifyAdapter();

  const board = env.NODE_ENV === 'production' ? 'PROD' : 'DEV';

  createBullBoard({
    queues: queues.map((q) => new BullMQAdapter(q)),
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

  app.get('/health', (req, res) => {
    const status = pulse.check();
    switch (status) {
      case 'healthy':
        logger.info('worker is happy and healthy');
        return { status };
      case 'dying':
        logger.warn('worker has not been active');
        return { status };
      case 'dead':
        logger.fatal('worker has stopped processing delayed jobs');
        return res.code(500).send({ status });
      default:
        return unreachable(status);
    }
  });

  app.get('/', (req, res) => res.redirect('/admin/queues', 302));

  return app;
};
