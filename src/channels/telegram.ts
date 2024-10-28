import axios from 'axios';

export const sendMessage = async (token: string, channel: string | number, text: string) => {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await axios.post(url, { chat_id: channel, text, parse_mode: 'HTML' });

  if (!(response.data as { ok: boolean }).ok) {
    throw new Error(`failed to send message: ${JSON.stringify(response.data)}`);
  }
};
