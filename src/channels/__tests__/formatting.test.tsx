import { describe, expect, it } from 'vitest';
import { platforms } from '../../config.js';
import { Bold, Line, Link, renderForPlatform } from '../formatting.js';

describe('Bold', () => {
  it.each(platforms)('formats %s messages correctly', (platform) => {
    expect(renderForPlatform(platform, <Bold>hello</Bold>)).toMatchSnapshot(platform);
  });
});

describe('Link', () => {
  it.each(platforms.filter((p) => p !== 'twitter'))('formats %s messages correctly', (platform) => {
    expect(
      renderForPlatform(platform, <Link href="https://some-link">link-preview</Link>),
    ).toMatchSnapshot(platform);
  });

  it.each(['link', 'text'] as const)('links to the explorer correctly on twitter', (display) => {
    expect(
      renderForPlatform(
        'twitter',
        <Link href="https://some-link" prefer={display}>
          link-preview
        </Link>,
      ),
    ).toMatchSnapshot();
  });

  it.each(platforms)('strips emoji if necessary', (platform) => {
    expect(
      renderForPlatform(platform, <Link href="https://some-link">link-preview 🧙‍♂️</Link>),
    ).toMatchSnapshot(platform);
  });
});

describe(Line, () => {
  it('renders a line break', () => {
    expect(renderForPlatform('twitter', <Line>hello world</Line>)).toMatchInlineSnapshot(`
      "hello world
      "
    `);
  });
});
