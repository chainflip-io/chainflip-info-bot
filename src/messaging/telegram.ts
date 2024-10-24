import { renderToStaticMarkup } from 'react-dom/server';
import assert from 'assert';
import axios from 'axios';
import React from 'react';

export const sendMessage = async (channel: string | number, text: React.JSX.Element) => {
  assert(process.env.TELEGRAM_BOT_TOKEN, 'missing TELEGRAM_BOT_TOKEN');

  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await axios.post(url, {
    chat_id: channel,
    text: renderToStaticMarkup(text),
    parse_mode: 'HTML',
  });

  if (!(response.data as { ok: boolean }).ok) {
    throw new Error(`failed to send message: ${JSON.stringify(response.data)}`);
  }
};
