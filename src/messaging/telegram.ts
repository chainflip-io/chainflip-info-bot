import { renderToStaticMarkup } from 'react-dom/server';
import axios from 'axios';
import React from 'react';
import env from '../env.js';

export const sendMessage = async (channel: string | number, text: React.JSX.Element) => {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await axios.post(url, {
    chat_id: channel,
    text: renderToStaticMarkup(text),
    parse_mode: 'HTML',
  });

  if (!(response.data as { ok: boolean }).ok) {
    throw new Error(`failed to send message: ${JSON.stringify(response.data)}`);
  }
};
