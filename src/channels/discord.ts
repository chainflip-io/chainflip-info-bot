import axios from 'axios';
import env from '../env.js';

export const sendMessage = async (content: string) => {
  const response = await axios.post(
    env.DISCORD_WEBHOOK_URL,
    { content },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!(response.data as { ok: boolean }).ok) {
    throw new Error(`Failed to send message to discord: ${JSON.stringify(response.data)}`);
  }
};
