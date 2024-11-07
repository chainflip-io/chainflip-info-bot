import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { platforms } from '../../config.js';
import { Bold, Line, Link } from '../formatting.js';

describe('Bold', () => {
  it.each(platforms)('formats %s messages correctly', (platform) => {
    expect(renderToStaticMarkup(<Bold platform={platform}>hello</Bold>)).toMatchSnapshot(platform);
  });
});

describe('Link', () => {
  it.each(platforms.filter((p) => p !== 'twitter'))('formats %s messages correctly', (platform) => {
    expect(
      renderToStaticMarkup(
        <Link platform={platform} href="https://some-link">
          link-preview
        </Link>,
      ),
    ).toMatchSnapshot(platform);
  });

  it.each(['link', 'text'] as const)('links to the explorer correctly on twitter', (display) => {
    expect(
      renderToStaticMarkup(
        <Link platform={'twitter'} href="https://some-link" prefer={display}>
          link-preview
        </Link>,
      ),
    ).toMatchSnapshot();
  });
});

describe(Line, () => {
  it('renders a line break', () => {
    expect(renderToStaticMarkup(<Line>hello world</Line>)).toMatchInlineSnapshot(`
      "hello world
      "
    `);
  });
});
