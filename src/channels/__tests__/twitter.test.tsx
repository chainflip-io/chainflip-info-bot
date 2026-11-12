/* eslint-disable @typescript-eslint/unbound-method */
import axios, { AxiosError } from 'axios';
import { vi, describe, it, expect } from 'vitest';
import { renderForPlatform } from '../formatting.js';
import { clearUserIdCache, lookupUserIds, sendMessage } from '../twitter.js';

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
          text: renderForPlatform(
            'twitter',
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
      renderForPlatform(
        'twitter',
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

  it('uploads media and attaches the media_id to the tweet', async () => {
    const postMock = vi.mocked(axios.post);

    postMock
      .mockResolvedValueOnce({ data: { media_id_string: '987654321' } })
      .mockResolvedValueOnce({ data: { data: { id: '1', text: 'with banner' } } });

    await sendMessage(config, 'with banner', Buffer.from('fake-png'));

    expect(postMock).toHaveBeenCalledTimes(2);

    // first call: v1.1 media upload
    expect(postMock.mock.calls[0]?.[0]).toBe('https://upload.twitter.com/1.1/media/upload.json');

    // second call: v2 tweet create with the minted media_id
    expect(postMock.mock.calls[1]?.[0]).toBe('https://api.twitter.com/2/tweets');
    expect(postMock.mock.calls[1]?.[1]).toMatchObject({
      text: 'with banner',
      media: { media_ids: ['987654321'] },
    });
  });

  it('throws an error if the response is not ok', async () => {
    const postMock = vi.mocked(axios.post);

    postMock.mockResolvedValue({
      data: { data: { ok: false, description: 'some other stuff here' } },
    });

    await expect(
      sendMessage(
        config,
        renderForPlatform(
          'twitter',
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

  it('does not retry other 4xx errors (e.g. duplicate content)', async () => {
    const error = new AxiosError();
    // @ts-expect-error -- mock
    error.response = { status: 403 };
    vi.mocked(axios.post).mockRejectedValueOnce(error);

    await expect(sendMessage(config, 'hello world')).rejects.toThrowErrorMatchingInlineSnapshot(
      `[UnrecoverableError: twitter tweet create rejected with status 403]`,
    );
  });

  it('accepts a pre-uploaded media_id without re-uploading', async () => {
    const postMock = vi
      .mocked(axios.post)
      .mockResolvedValueOnce({ data: { data: { id: '1', text: 'x' } } });

    await sendMessage(config, 'x', '42');

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(postMock.mock.calls[0]?.[1]).toMatchObject({ media: { media_ids: ['42'] } });
  });

  it('attaches photo tags to the media', async () => {
    const postMock = vi
      .mocked(axios.post)
      .mockResolvedValueOnce({ data: { data: { id: '1', text: 'x' } } });

    await sendMessage(config, 'x', '42', ['111', '222']);

    expect(postMock.mock.calls[0]?.[1]).toEqual({
      text: 'x',
      media: { media_ids: ['42'], tagged_user_ids: ['111', '222'] },
    });
  });
});

describe('sendMessage photo tag fallback', () => {
  const config = { consumerKey: 'a', consumerKeySecret: 'b', oauthKey: 'c', oauthKeySecret: 'd' };
  const rejection = (status: number) => {
    const error = new AxiosError();
    // @ts-expect-error -- mock
    error.response = { status, data: { detail: 'nope' } };
    return error;
  };

  it('re-posts without tags when X rejects a tagged tweet', async () => {
    const postMock = vi
      .mocked(axios.post)
      .mockRejectedValueOnce(rejection(400))
      .mockResolvedValueOnce({ data: { data: { id: '1', text: 'x' } } });

    await sendMessage(config, 'x', '42', ['111']);

    expect(postMock).toHaveBeenCalledTimes(2);
    expect(postMock.mock.calls[0]?.[1]).toEqual({
      text: 'x',
      media: { media_ids: ['42'], tagged_user_ids: ['111'] },
    });
    expect(postMock.mock.calls[1]?.[1]).toEqual({ text: 'x', media: { media_ids: ['42'] } });
  });

  it('does not re-post on a rate limit', async () => {
    const postMock = vi.mocked(axios.post).mockRejectedValueOnce(rejection(429));

    await expect(sendMessage(config, 'x', '42', ['111'])).rejects.toThrow('rate limit');
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  it('does not re-post an untagged tweet', async () => {
    const postMock = vi.mocked(axios.post).mockRejectedValueOnce(rejection(403));

    await expect(sendMessage(config, 'x', '42')).rejects.toThrow('403');
    expect(postMock).toHaveBeenCalledTimes(1);
  });
});

describe('lookupUserIds', () => {
  const config = {
    consumerKey: 'a',
    consumerKeySecret: 'b',
    oauthKey: 'c',
    oauthKeySecret: 'd',
  };

  it('batches lookups, caches results and skips unknown handles', async () => {
    clearUserIdCache();
    const getMock = vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        data: [
          { id: '1', username: 'BNBCHAIN' },
          { id: '2', username: 'tether' },
        ],
      },
    });

    expect(await lookupUserIds(config, ['tether', 'BNBCHAIN', 'gone'])).toEqual(['2', '1']);
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock.mock.calls[0]?.[0]).toBe(
      'https://api.twitter.com/2/users/by?usernames=tether,bnbchain,gone',
    );

    expect(await lookupUserIds(config, ['bnbchain', 'gone'])).toEqual(['1']);
    expect(getMock).toHaveBeenCalledTimes(1);
  });

  it('returns no tags when the lookup fails', async () => {
    clearUserIdCache();
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('boom'));
    expect(await lookupUserIds(config, ['solana'])).toEqual([]);
  });
});
