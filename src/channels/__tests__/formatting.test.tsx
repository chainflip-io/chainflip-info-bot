import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Bold, Link } from '../formatting.js';

describe('Bold', () => {
  it.each(['telegram', 'discord'] as const)('formats %s messages correctly', (channel) => {
    expect(renderToStaticMarkup(<Bold channel={channel}>hello</Bold>)).toMatchSnapshot(channel);
  });
});

describe('Link', () => {
  it.each(['telegram', 'discord'] as const)('formats %s messages correctly', (channel) => {
    expect(
      renderToStaticMarkup(
        <Link channel={channel} href="https://some-link">
          link-preview
        </Link>,
      ),
    ).toMatchSnapshot(channel);
  });
});
