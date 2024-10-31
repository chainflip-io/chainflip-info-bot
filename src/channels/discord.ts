import axios from 'axios';

export type DiscordConfig = { webhookUrl: string };

export const sendMessage = async ({ webhookUrl }: DiscordConfig, content: string) => {
  const response = await axios.post(webhookUrl, { content });

  if (response.status !== 204) {
    throw new Error(`Failed to send message to discord: ${JSON.stringify(response.data)}`);
  }
};
