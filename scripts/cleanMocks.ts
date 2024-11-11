#!/usr/bin/env node --import=tsx --trace-uncaught --no-warnings
/// <reference lib="esnext" />
import assert from 'assert';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import { Kind } from 'graphql';
import { exec } from 'node:child_process';
import * as util from 'node:util';
import * as path from 'path';
import * as gql from '../src/graphql/generated/graphql.js';

type EndsWith<T extends string, U extends string> = T extends `${infer _}${U}` ? T : never;

const documents = Object.keys(gql).filter((key) => key.endsWith('Document')) as EndsWith<
  keyof typeof gql,
  'Document'
>[];

const sha1 = (data: string) => crypto.createHash('sha1').update(data).digest('hex').slice(0, 6);

const hashes = new Set(
  documents.map((key) => {
    const hash = sha1(JSON.stringify(gql[key]));

    const [def] = gql[key].definitions;
    assert(def.kind === Kind.OPERATION_DEFINITION);

    return `${def.name?.value}-${hash}`;
  }),
);

const fixtureDir = path.join(import.meta.dirname, '..', 'src', '__mocks__', '__fixtures__');

const dirs = new Set(await fs.readdir(fixtureDir))
  .difference(hashes)
  .values()
  .map((dir) => path.join(fixtureDir, dir))
  .toArray();

const execAsync = util.promisify(exec);

await Promise.all(dirs.map((dirname) => fs.rmdir(dirname, { recursive: true })));

await execAsync(`git add ${dirs.join(' ')}`);
