import axios, { isAxiosError } from 'axios';
import { UnrecoverableError } from 'bullmq';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

export type TwitterConfig = {
  consumerKey: string;
  consumerKeySecret: string;
  oauthKey: string;
  oauthKeySecret: string;
};

interface TwitterResponse {
  data: {
    id: string;
    text: string;
  };
}

// OAuth 1.0a signer bound to a set of Twitter credentials. The signature for
// multipart media uploads covers only the method + URL (body params are
// excluded for multipart/form-data), so we never pass body data to authorize().
const buildAuthHeader = (token: TwitterConfig, url: string, method: 'POST'): string => {
  const { consumerKey, consumerKeySecret, oauthKey, oauthKeySecret } = token;

  const oauth = new OAuth({
    consumer: {
      key: consumerKey,
      secret: consumerKeySecret,
    },
    hash_function: (baseString, key) =>
      crypto.createHmac('sha1', key).update(baseString).digest('base64'),
  });

  return oauth.toHeader(oauth.authorize({ url, method }, { key: oauthKey, secret: oauthKeySecret }))
    .Authorization;
};

const rethrowRateLimit = (error: unknown): never => {
  if (isAxiosError(error) && error.response?.status === 429) {
    throw new UnrecoverableError('twitter rate limit hit');
  }
  throw error;
};

// Uploads a single image to the v1.1 media endpoint and returns its media_id.
// v1.1 upload + v2 tweet-create is the standard hybrid for OAuth 1.0a user-context
// bots: the v2 tweet endpoint accepts media_ids minted by the v1.1 uploader.
export const uploadMedia = async (token: TwitterConfig, image: Buffer): Promise<string> => {
  const url = 'https://upload.twitter.com/1.1/media/upload.json';

  const form = new FormData();
  form.append('media_data', image.toString('base64'));
  form.append('media_category', 'tweet_image');

  let response;
  try {
    response = await axios.post<{ media_id_string: string }>(url, form, {
      headers: {
        Authorization: buildAuthHeader(token, url, 'POST'),
        'User-Agent': 'v2CreateTweetJS',
        Accept: 'application/json',
      },
    });
  } catch (error) {
    rethrowRateLimit(error);
  }

  const mediaId = response?.data.media_id_string;
  if (!mediaId) {
    throw new Error(`failed to upload media: ${JSON.stringify(response?.data)}`);
  }
  return mediaId;
};

export const sendMessage = async (token: TwitterConfig, text: string, image?: Buffer) => {
  const url = `https://api.twitter.com/2/tweets`;

  const mediaId = image ? await uploadMedia(token, image) : undefined;

  const payload = mediaId ? { text, media: { media_ids: [mediaId] } } : { text };

  let response;
  try {
    response = await axios.post<TwitterResponse>(url, payload, {
      headers: {
        Authorization: buildAuthHeader(token, url, 'POST'),
        'User-Agent': 'v2CreateTweetJS',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  } catch (error) {
    rethrowRateLimit(error);
  }

  const formattedResponse = response?.data.data as { id: string; text: string };

  if (!formattedResponse?.id || !formattedResponse.text) {
    throw new Error(`failed to send message: ${JSON.stringify(response?.data)}`);
  }
};
