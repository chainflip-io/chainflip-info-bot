/* eslint-disable @typescript-eslint/unbound-method */
import axios from 'axios';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { sendMessage } from '../telegram.js';

vi.mock('axios', () => ({
  __esModule: true,
  default: {
    post: vi.fn(),
  },
}));

describe('sendMessage', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    process.env.TELEGRAM_BOT_TOKEN = '1234';
  });

  it('sends a message to the channel', async () => {
    const postMock = vi.mocked(axios.post);

    postMock.mockResolvedValue({ data: { ok: true } });

    await sendMessage(
      '1234',
      <>
        hello <strong>bold</strong>
      </>,
    );

    expect(postMock.mock.lastCall).toMatchInlineSnapshot(`
      [
        "https://api.telegram.org/bot1234/sendMessage",
        {
          "chat_id": "1234",
          "parse_mode": "HTML",
          "text": "hello <strong>bold</strong>",
        },
      ]
    `);
  });

  it('throws an error if the response is not ok', async () => {
    const postMock = vi.mocked(axios.post);

    postMock.mockResolvedValue({ data: { ok: false, description: 'some other stuff here' } });

    await expect(
      sendMessage(
        '1234',
        <>
          hello <strong>bold</strong>
        </>,
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: failed to send message: {"ok":false,"description":"some other stuff here"}]`);
  });
});
