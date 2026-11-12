import axios, { isAxiosError } from 'axios';
import { UnrecoverableError } from 'bullmq';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import logger from '../utils/logger.js';

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
const buildAuthHeader = (token: TwitterConfig, url: string, method: 'POST' | 'GET'): string => {
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

const handleTwitterError = (error: unknown, context: string): never => {
  if (isAxiosError(error)) {
    logger.error(`twitter ${context} failed`, {
      status: error.response?.status,
      data: error.response?.data as unknown,
    });
    const status = error.response?.status;
    if (status === 429) {
      throw new UnrecoverableError('twitter rate limit hit');
    }
    // 4xx (bad request, auth, duplicate content, forbidden) will fail identically on
    // every retry. Each X API call is billed, so don't burn 4 more attempts on them.
    if (status !== undefined && status >= 400 && status < 500) {
      throw new UnrecoverableError(`twitter ${context} rejected with status ${status}`);
    }
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
    handleTwitterError(error, 'media upload');
  }

  const mediaId = response?.data.media_id_string;
  if (!mediaId) {
    throw new Error(`failed to upload media: ${JSON.stringify(response?.data)}`);
  }
  return mediaId;
};

// `media` is either a PNG to upload or a media_id from a previous upload. Passing
// the id lets callers reuse an upload across retries instead of paying for it again.
export const sendMessage = async (
  token: TwitterConfig,
  text: string,
  media?: Buffer | string,
  taggedUserIds: string[] = [],
) => {
  const url = `https://api.twitter.com/2/tweets`;

  const mediaId =
    typeof media === 'string' ? media : media ? await uploadMedia(token, media) : undefined;

  // Photo tags need media; accounts with photo tagging disabled are silently dropped by X.
  const payload = mediaId
    ? {
        text,
        media: {
          media_ids: [mediaId],
          ...(taggedUserIds.length && { tagged_user_ids: taggedUserIds }),
        },
      }
    : { text };

  const post = (body: typeof payload) =>
    axios.post<TwitterResponse>(url, body, {
      headers: {
        Authorization: buildAuthHeader(token, url, 'POST'),
        'User-Agent': 'v2CreateTweetJS',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

  let response;
  try {
    response = await post(payload);
  } catch (error) {
    // Photo tags are a nice-to-have. If X rejects the tweet (4xx other than rate limit)
    // while tags are attached, post once more without them rather than lose the post.
    const status = isAxiosError(error) ? error.response?.status : undefined;
    const retryUntagged =
      taggedUserIds.length > 0 &&
      status !== undefined &&
      status >= 400 &&
      status < 500 &&
      status !== 429;
    if (!retryUntagged || !mediaId) {
      handleTwitterError(error, 'tweet create');
    } else {
      logger.warn('twitter rejected tweet with photo tags, retrying without tags', {
        status,
        data: isAxiosError(error) ? (error.response?.data as unknown) : undefined,
      });
      try {
        response = await post({ text, media: { media_ids: [mediaId] } });
      } catch (retryError) {
        handleTwitterError(retryError, 'tweet create');
      }
    }
  }

  const formattedResponse = response?.data.data as { id: string; text: string };

  if (!formattedResponse?.id || !formattedResponse.text) {
    throw new Error(`failed to send message: ${JSON.stringify(response?.data)}`);
  }
};

// username (lowercase) -> user id, or null if X says it doesn't exist. Handles never
// change id, so one lookup per process is enough (each lookup is a billed call).
const userIdCache = new Map<string, string | null>();

export const clearUserIdCache = () => userIdCache.clear();

// Resolves handles to user ids in a single batched call. Best effort: on failure the
// post goes out without photo tags rather than failing.
export const lookupUserIds = async (token: TwitterConfig, handles: string[]): Promise<string[]> => {
  const missing = [...new Set(handles.map((h) => h.toLowerCase()))].filter(
    (h) => !userIdCache.has(h),
  );

  if (missing.length) {
    const url = `https://api.twitter.com/2/users/by?usernames=${missing.join(',')}`;
    try {
      const response = await axios.get<{ data?: { id: string; username: string }[] }>(url, {
        // Tags are optional: never let a slow lookup hold up the post.
        timeout: 5_000,
        headers: {
          Authorization: buildAuthHeader(token, url, 'GET'),
          'User-Agent': 'v2CreateTweetJS',
          Accept: 'application/json',
        },
      });
      for (const h of missing) userIdCache.set(h, null);
      for (const user of response.data.data ?? []) {
        userIdCache.set(user.username.toLowerCase(), user.id);
      }
    } catch (error) {
      logger.warn('twitter user lookup failed, posting without photo tags', {
        status: isAxiosError(error) ? error.response?.status : undefined,
      });
      return [];
    }
  }

  return handles.map((h) => userIdCache.get(h.toLowerCase())).filter((id): id is string => !!id);
};
