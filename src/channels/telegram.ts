import axios from 'axios';

export type TelegramConfig = {
  token: string;
  channelId: string | number;
};

export const sendMessage = async (
  { token, channelId }: TelegramConfig,
  text: string,
  disablePreview?: boolean,
) => {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await axios.post(url, {
    chat_id: channelId,
    text,
    parse_mode: 'HTML',
    ...(disablePreview && {
      link_preview_options: {
        is_disabled: true,
      },
    }),
  });

  if (!(response.data as { ok: boolean }).ok) {
    throw new Error(`failed to send message: ${JSON.stringify(response.data)}`);
  }
};
