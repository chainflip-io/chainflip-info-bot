import { vi } from 'vitest';
import './graphql-request.js';

vi.mock('axios', async (importActual) => {
  const { AxiosError, isAxiosError } = await importActual<typeof import('axios')>();

  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
    AxiosError,
    isAxiosError,
  };
});
vi.mock('../env.js');
