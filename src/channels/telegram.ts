import React from 'react';
import axios from 'axios';
import { renderToStaticMarkup } from 'react-dom/server';

export const sendMessage = async (
  token: string,
  channel: string | number,
  text: React.JSX.Element,
) => {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await axios.post(url, {
    chat_id: channel,
    text: renderToStaticMarkup(text),
    parse_mode: 'HTML',
  });

  if (!(response.data as { ok: boolean }).ok) {
    throw new Error(`failed to send message: ${JSON.stringify(response.data)}`);
  }
};
