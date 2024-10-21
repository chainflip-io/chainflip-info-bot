import { sleep } from '@chainflip/utils/async';

export const start = async () => {
  let exit = false;

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
    sleep(1000);
  }
};

await start();
