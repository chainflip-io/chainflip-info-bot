import z from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('production'),
  REDIS_URL: z.string(),
  HTTP_SERVER_PORT: z.string().transform((v) => parseInt(v, 10) || 8080),
  EXPLORER_GATEWAY_URL: z.string(),
  LP_GATEWAY_URL: z.string(),
  CONFIG: z.string().optional(),
});

export type RawEnv = z.input<typeof schema>;

export default schema.parse(process.env);
