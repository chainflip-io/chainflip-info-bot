import axios from 'axios';
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

export const sendMessage = async (token: TwitterConfig, text: string) => {
  const url = `https://api.twitter.com/2/tweets`;

  const { consumerKey, consumerKeySecret, oauthKey, oauthKeySecret } = token;

  const oauth = new OAuth({
    consumer: {
      key: consumerKey,
      secret: consumerKeySecret,
    },
    hash_function: (baseString, key) =>
      crypto.createHmac('sha1', key).update(baseString).digest('base64'),
  });

  const authHeader = oauth.toHeader(
    oauth.authorize(
      {
        url,
        method: 'POST',
      },
      { key: oauthKey, secret: oauthKeySecret },
    ),
  );

  const response = await axios.post<TwitterResponse>(
    url,
    { text },
    {
      headers: {
        Authorization: authHeader.Authorization,
        'User-Agent': 'v2CreateTweetJS',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );

  const formattedResponse = response.data.data as { id: string; text: string };

  if (!formattedResponse.id || !formattedResponse.text) {
    throw new Error(`failed to send message: ${JSON.stringify(response.data)}`);
  }
};
