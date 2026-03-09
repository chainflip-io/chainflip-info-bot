# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chainflip Info Bot — a TypeScript Discord/Telegram/Twitter notification bot for the Chainflip DEX. It monitors blockchain events (swaps, liquidity deposits, burns, delegation) via GraphQL and sends formatted alerts through a BullMQ job queue system backed by Redis.

## Commands

```bash
pnpm dev                # Hot-reload dev server (tsx watch)
pnpm build              # TypeScript compilation (pnpm clean && tsc)
pnpm test               # Run tests (vitest)
pnpm test -- --run src/path/to/file.test.ts  # Run a single test file
pnpm eslint:check       # Lint (zero warnings enforced)
pnpm prettier:check     # Format check
pnpm graphql:codegen    # Regenerate GraphQL types from schema
docker compose up       # Start local Redis
```

## Architecture

### Job Queue Pipeline

The core architecture is a BullMQ job queue pipeline. Jobs flow through this chain:

```
scheduler (30s cycle)
├─> newSwapCheck ──> [swapStatusCheck, newSwapAlert]──┐
├─> newBurnCheck ─────────────────────────────────────┤
├─> newLpDepositCheck ────────────────────────────────┤
├─> newDelegationActivityCheck ───────────────────────┤
└─> timePeriodStats (daily/weekly summaries) ─────────┤
                                                      ↓
                                              messageRouter
                                                      ↓
                                              sendMessage → Discord/Telegram/Twitter
```

Queue processors live in `src/queues/`. Each exports a `JobProcessor<T>` function. The global `JobData` interface in `src/queues/initialize.ts` types all queue payloads.

### Message Rendering

Messages are rendered as **React JSX** (`.tsx` files) that output platform-specific markup. The `src/channels/formatting.tsx` module provides components (`<Bold>`, `<Link>`, etc.) that render differently per platform (Discord markdown, Telegram HTML, Twitter plain text). Platform context is set globally during render.

### Configuration

- **`bot.config.json`** — Multi-platform channel config with filters (event types + optional `minUsdValue`). Parsed/validated in `src/config.ts`.
- **`src/env.ts`** — Environment variables validated with Zod. Key vars: `REDIS_URL`, `EXPLORER_GATEWAY_URL`, `LP_GATEWAY_URL`.

### GraphQL

Two GraphQL services: Explorer (swaps, burns, deposits, delegation) and LP Service (pool fills, stats). Queries are in `src/queries/`, generated types in `src/graphql/generated/`. Run `pnpm graphql:codegen` after modifying `.graphql` files or query documents.

### Platform Channels

`src/channels/` contains Discord (discord.js), Telegram (axios to Bot API), and Twitter (OAuth 1.0a, API v2) integrations. Discord has a 2000-char message split limit.

## Code Conventions

- ESM project (`"type": "module"` in package.json), target ES2024
- Strict TypeScript with NodeNext module resolution
- Prettier: 100 char width, single quotes
- Husky + lint-staged for pre-commit hooks
- Tests colocated as `__tests__/` directories next to source; test setup in `src/__mocks__/setup.ts`
- `UnrecoverableError` from BullMQ used for non-retryable failures; other errors retry with exponential backoff (5 attempts)
