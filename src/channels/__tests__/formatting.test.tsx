import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { platforms } from '../../config.js';
import { Bold, Link } from '../formatting.js';

describe('Bold', () => {
  it.each(platforms)('formats %s messages correctly', (platform) => {
    expect(renderToStaticMarkup(<Bold platform={platform}>hello</Bold>)).toMatchSnapshot(platform);
  });
});

describe('Link', () => {
  it.each(platforms)('formats %s messages correctly', (platform) => {
    expect(
      renderToStaticMarkup(
        <Link platform={platform} href="https://some-link">
          link-preview
        </Link>,
      ),
    ).toMatchSnapshot(platform);
  });
});
