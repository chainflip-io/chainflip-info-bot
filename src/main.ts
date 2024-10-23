import 'dotenv/config';
import { initialize } from './queues/initialize.js';

export const start = async () => {
  await initialize();
};

await start();
