import axios from 'axios';

export const sendMessage = async (webhookUrl: string, content: string) => {
  const response = await axios.post(webhookUrl, { content });

  if (response.status !== 204) {
    throw new Error(`Failed to send message to discord: ${JSON.stringify(response.data)}`);
  }
};
