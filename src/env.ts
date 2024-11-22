import z from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('production'),
  REDIS_URL: z.string(),
  HTTP_SERVER_PORT: z.coerce.number().optional().default(8080),
  EXPLORER_GATEWAY_URL: z.string(),
  LP_GATEWAY_URL: z.string(),
  SWAP_MAX_AGE_IN_MINUTES: z.coerce.number().default(10),
  CONFIG: z.string().optional(),
  HEALTH_CHECK_GRACE_PERIOD_MS: z.coerce.number().default(10_000),
});

export type RawEnv = z.input<typeof schema>;

export default schema.parse(process.env);
