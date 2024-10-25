import z from 'zod';

export default z
  .object({
    REDIS_URL: z.string(),
    HTTP_SERVER_PORT: z.string().transform((v) => parseInt(v, 10) || 8080),
    DISCORD_WEBHOOK_URL: z.string(),
    TELEGRAM_BOT_TOKEN: z.string(),
  })
  .parse(process.env);
