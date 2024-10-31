/* eslint-disable @typescript-eslint/unbound-method */
import axios from 'axios';
import { renderToStaticMarkup } from 'react-dom/server';
import { vi, describe, it, expect } from 'vitest';
import { sendMessage } from '../telegram.js';

describe('sendMessage', () => {
  it('sends a message to the channel', async () => {
    const postMock = vi.mocked(axios.post);

    postMock.mockResolvedValue({ data: { ok: true } });

    await sendMessage(
      { token: '1234', channelId: '5678' },
      renderToStaticMarkup(
        <>
          hello <strong>bold</strong>
        </>,
      ),
    );

    expect(postMock.mock.lastCall).toMatchInlineSnapshot(`
      [
        "https://api.telegram.org/bot1234/sendMessage",
        {
          "chat_id": "5678",
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
        { token: '1234', channelId: '5678' },
        renderToStaticMarkup(
          <>
            hello <strong>bold</strong>
          </>,
        ),
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: failed to send message: {"ok":false,"description":"some other stuff here"}]`,
    );
  });
});
