import axios from 'axios';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

export type TwitterConfig = {
  consumerKey: string;
  consumerKeySecret: string;
  oathKey: string;
  oathKeySecret: string;
};

export const sendMessage = async (token: TwitterConfig, text: string) => {
  const url = `https://api.twitter.com/2/tweets`;

  const { consumerKey, consumerKeySecret, oathKey, oathKeySecret } = token;

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
      { key: oathKey, secret: oathKeySecret },
    ),
  );

  const response = await axios.post(
    url,
    { text },
    {
      headers: {
        Authorization: authHeader['Authorization'],
        'User-Agent': 'v2CreateTweetJS',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!response.data.id) {
    throw new Error(`failed to send message: ${JSON.stringify(response.data)}`);
  }
};
