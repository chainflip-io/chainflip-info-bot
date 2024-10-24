import axios, { AxiosError } from 'axios';
import { logger } from '../server.js';
import env from '../env.js';

export const sendMessage = async (content: string) => {
  try {
    await axios.post(env.DISCORD_WEBHOOK_URL, JSON.stringify({ content }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return { sent: true };
  } catch (e) {
    logger.error('error sending message to discord', e);
    if (e instanceof AxiosError) {
      return {
        sent: false,
        error: {
          message: e.message,
          cause: e.cause,
        },
      };
    }
    throw e;
  }
};
