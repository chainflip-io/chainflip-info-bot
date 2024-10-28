import z from 'zod';

export default z
  .object({
    REDIS_URL: z.string(),
    HTTP_SERVER_PORT: z.string().transform((v) => parseInt(v, 10) || 8080),
    DISCORD_WEBHOOK_URL: z.string().optional(),
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    TELEGRAM_CHANNEL_ID: z.string().optional(),
    EXPLORER_GATEWAY_URL: z.string(),
    LP_GATEWAY_URL: z.string(),
  })
  .parse(process.env);
