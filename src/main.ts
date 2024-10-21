/* eslint-disable no-console */
import { sleep } from '@chainflip/utils/async';

export const start = async () => {
  let exit = false as boolean;

  console.log('running');

  process.once('SIGINT', () => {
    console.log('SIGINT received');
    exit = true;
  });

  process.once('SIGTERM', () => {
    console.log('SIGTERM received');
    exit = true;
  });

  while (!exit) {
    await sleep(1000);
  }
};

await start();
