/* eslint-disable @typescript-eslint/unbound-method */
import axios, { AxiosError } from 'axios';
import { renderToStaticMarkup } from 'react-dom/server';
import { vi, describe, it, expect } from 'vitest';
import { sendMessage } from '../twitter.js';

describe('sendMessage', () => {
  const config = {
    consumerKey: 'consumer_key',
    consumerKeySecret: 'consumer_key_secret',
    oauthKey: 'oauth_key',
    oauthKeySecret: 'oauth_key_secret',
  };

  it('sends a message to the channel', async () => {
    const postMock = vi.mocked(axios.post);

    postMock.mockResolvedValue({
      data: {
        data: {
          text: renderToStaticMarkup(
            <>
              hello twitter<strong>bold</strong>
            </>,
          ),
          id: '1853357330332549327',
          edit_history_tweet_ids: ['1853357330332549327'],
        },
      },
    });

    await sendMessage(
      config,
      renderToStaticMarkup(
        <>
          hello twitter<strong>bold</strong>
        </>,
      ),
    );

    expect(postMock).toHaveBeenCalledTimes(1);

    expect(postMock.mock.lastCall).toMatchObject([
      'https://api.twitter.com/2/tweets',
      {
        text: 'hello twitter<strong>bold</strong>',
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: expect.stringMatching(
            /OAuth oauth_consumer_key="consumer_key", oauth_nonce=".+?", oauth_signature=".+?", oauth_signature_method="PLAINTEXT", oauth_timestamp="\d+", oauth_token="oauth_key", oauth_version="1\.0"/,
          ) as string,
          'Content-Type': 'application/json',
          'User-Agent': 'v2CreateTweetJS',
        },
      },
    ]);
  });

  it('throws an error if the response is not ok', async () => {
    const postMock = vi.mocked(axios.post);

    postMock.mockResolvedValue({
      data: { data: { ok: false, description: 'some other stuff here' } },
    });

    await expect(
      sendMessage(
        config,
        renderToStaticMarkup(
          <>
            hello twitter<strong>bold</strong>
          </>,
        ),
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: failed to send message: {"data":{"ok":false,"description":"some other stuff here"}}]`,
    );
  });

  it('throws an unrecoverable error for 429 errors', async () => {
    const postMock = vi.mocked(axios.post);

    const error = new AxiosError();
    // @ts-expect-error -- mock
    error.response = { status: 429 };
    postMock.mockRejectedValueOnce(error);

    await expect(sendMessage(config, 'hello world')).rejects.toThrowErrorMatchingInlineSnapshot(
      `[UnrecoverableError: twitter rate limit hit]`,
    );
  });
});
