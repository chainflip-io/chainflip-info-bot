import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type React from 'react';
import satori from 'satori';

const fontsDir = join(dirname(fileURLToPath(import.meta.url)), 'assets/fonts');

let fontsPromise: Promise<{ name: string; data: Buffer; weight: 400 | 500 | 700; style: 'normal' }[]> | null = null;

const loadFonts = () => {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      readFile(join(fontsDir, 'Aeonik-Regular.ttf')),
      readFile(join(fontsDir, 'Aeonik-Medium.ttf')),
      readFile(join(fontsDir, 'Aeonik-Bold.ttf')),
    ]).then(([regular, medium, bold]) => [
      { name: 'Aeonik', data: regular, weight: 400 as const, style: 'normal' as const },
      { name: 'Aeonik', data: medium, weight: 500 as const, style: 'normal' as const },
      { name: 'Aeonik', data: bold, weight: 700 as const, style: 'normal' as const },
    ]);
  }
  return fontsPromise;
};

export const renderBanner = async (
  element: React.ReactElement,
  size: { width: number; height: number } = { width: 1000, height: 1000 },
): Promise<Buffer> => {
  const fonts = await loadFonts();
  const svg = await satori(element, { ...size, fonts });
  return Buffer.from(new Resvg(svg).render().asPng());
};

export const fileToDataUrl = async (path: string, mime = 'image/png'): Promise<string> => {
  const buf = await readFile(path);
  return `data:${mime};base64,${buf.toString('base64')}`;
};
