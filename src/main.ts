import 'dotenv/config';
import { initialize } from './queues/initialize.js';
import { createServer } from './server.js';
import { handleExit } from './utils.js';

export const start = async () => {
  const queues = await initialize();

  const app = createServer(queues);

  const port = Number(process.env.HTTP_SERVER_PORT) || 8080;

  app.listen({ host: '0.0.0.0', port }, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
    // eslint-disable-next-line no-console
    console.log(`Visit the admin pages: http://127.0.0.1:${port}/admin/queues`);
  });

  handleExit(async () => {
    await app.close();
  });
};

await start();
