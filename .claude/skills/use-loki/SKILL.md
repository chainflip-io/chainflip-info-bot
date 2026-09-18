---
name: use-loki
description: Query the Chainflip Info Bot's production logs in Loki with logcli and its pod metrics in VictoriaMetrics with PromQL — connection details, the `{app="info-bot"}` selector, winston log line shapes per queue, restart/health-check forensics, and analysis patterns. Use whenever the user asks to check the info bot's logs, find out whether an alert was posted, investigate queue errors, GraphQL timeouts, missed swap/burn/LP/delegation notifications, or pod restarts and memory.
---

# Querying the Info Bot's logs

## Establish the time range first

If the user asks to check logs without giving a time range, ask for one before running anything. Once given, pass it explicitly (`--since=1h`, or `--from`/`--to` for exact windows).

The good news for this service: **it is low-volume — ~1,800–2,300 lines/hour, ~46k/day (measured 2026-09-18)**. A raw dump of a whole hour is a few hundred KB and completely safe; a whole day is fine too when filtered. So unlike the chatty web-services gateways, you do not need to sample here. Just don't dump multiple unfiltered days at once, and prefer `count_over_time` for "how many/how often" questions.

Daily level split over 24h (2026-09-18, for calibration): `info` ~37.7k, `debug` ~8.1k, `error` ~721, `crit` ~309, `warn` ~98.

## Connection

- CLI: `logcli` (Homebrew). No `LOKI_ADDR` is configured — always pass the address explicitly.
- Range queries: `--addr="https://loki.monitoring" --tls-skip-verify`
- Live tail: `--addr="wss://loki.monitoring" --tls-skip-verify --tail`
- Internal DNS — requires the company VPN. A connection error usually means the VPN is off, not that the query is wrong.
- On macOS logcli prints harmless `CFPropertyListCreateFromXMLData` warnings to stderr — silence with `2>/dev/null`.
- `--limit=0` (uncapped) works for `query` but is rejected by `instant-query` ("limit must be a positive value") — omit it there.

## Label selector

**`{app="info-bot"}`** — that's it. Note the difference from the web services, which use `component=`: the info bot has **no `component` label**, so `{namespace="berghain", component="info-bot"}` matches nothing.

Facts (verified 2026-09-18):

- It runs **only on mainnet**: `namespace="berghain"`, `cluster="euc1-mainnet"`, `container="info-bot"`, `job="berghain/info-bot"`, `managed_by="product"`. There is no perseverance/backspin deployment.
- **Single replica.** The `pod` label changes on every redeploy (e.g. `info-bot-6f6548c8c4-lfbgb`); add `pod=` only to isolate one deployment generation.
- `{app="hermod"}` is a different service, not this repo.

```sh
logcli series '{app="info-bot"}' --addr="https://loki.monitoring" --tls-skip-verify --since=24h --quiet \
  | grep -oE 'pod="[^"]*"' | sort -u     # which pod generations exist in the window
```

## Log line shape (winston)

In production (`NODE_ENV=production`) `src/utils/logger.ts` emits **one JSON object per line** with `winston.format.json()`:

```json
{
  "level": "info",
  "message": "Alerting about new swap request",
  "queue": "newSwapAlert",
  "swapRequestId": "1821023",
  "timestamp": "2026-09-18T09:17:20.627Z"
}
```

- `timestamp` is **ISO 8601 UTC** (`2026-09-18T09:17:20.627Z`) — not the `"yy-MM-dd HH:mm:ss"` format the web services use. Slice the first 13 chars for hour bucketing.
- Custom levels (`src/utils/logger.ts`): `alert`(0), `crit`(1), `error`(2), `warn`(3), `info`(4), `debug`(7). **`crit` and `alert` are not standard winston levels — remember them when filtering for "anything bad".**
- There is **no request/response envelope** — no `reqId`, no `statusCode`, no `duration`. Every line is a domain event from a BullMQ job processor. Extra metadata is spread flat onto the object (`queue`, `swapRequestId`, `newSwapRequests`, `lastSwapRequestId`, `delegationActivityId`, `lastCheckedLoanUpdateId`, `err`, `name`, …).
- Dev mode uses a colorized printf format instead — everything here assumes the production JSON.

## Count and filter server-side

The logs are JSON, so `| json` extracts fields. Nested objects flatten with underscores (`err.message` → `err_message`), or bind explicitly with `| json err_msg="err.message"`:

```sh
# lines per hour, as a time series
logcli query 'sum(count_over_time({app="info-bot"}[1h]))' \
  --addr="https://loki.monitoring" --tls-skip-verify --since=6h --quiet

# split by level over a day (instant-query gives one number per level, not a series)
logcli instant-query 'sum by (level) (count_over_time({app="info-bot"} | json [24h]))' \
  --addr="https://loki.monitoring" --tls-skip-verify --quiet

# queue-level error breakdown — `name` is the queue that threw
logcli instant-query 'sum by (name) (count_over_time({app="info-bot"} |= `error occurred in job queue` | json [24h]))' \
  --addr="https://loki.monitoring" --tls-skip-verify --quiet
```

Use backticks for LogQL string literals (avoids shell-quoting pain); keep a line filter (`|=` / `|~`) before `| json` so extraction only runs on matching lines; add `| __error__ = ""` to drop lines that fail extraction.

`logcli query` on a metric expression prints a verbose JSON time series — pipe it through `node -e` or use `instant-query` when you only want totals.

## Raw dumps

```sh
logcli query '{app="info-bot"} |~ `"level":"(error|crit|alert)"`' \
  --addr="https://loki.monitoring" --tls-skip-verify \
  --since=24h --limit=0 --output=raw --quiet > errs.jsonl 2>/dev/null
```

`--limit=0` removes the row cap; `--output=raw --quiet` gives one JSON log line per row with no decoration. Write dumps and analysis scripts to the session scratchpad, not the repo, and parse them with a small node script rather than eyeballing — some lines are enormous (see the `err.message` gotcha below).

## What each queue logs

Mapped to source (`src/queues/`, `src/channels/`). Message text is the only reliable discriminator — there is no per-queue Loki label.

| Message (substring to filter on)                                                                                                                                                                     | Source                               | Notes                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------- |
| `Checking for new swap requests, lastSwapRequestId: N` / `Current latest swapRequestId: N` / `Found N new swap requests`                                                                             | `newSwapCheck.ts`                    | the last one carries the full `newSwapRequests` array           |
| `Alerting about new swap request`                                                                                                                                                                    | `newSwapAlert.tsx`                   | fields `queue`, `swapRequestId`                                 |
| `skipping stale job` (warn)                                                                                                                                                                          | `newSwapAlert.tsx`                   | alert dropped for age — first thing to check for "why no post?" |
| `Checking swap #N` / `Swap #N is fresh, job was added in a queue` / `Swap #N is not completed, pushed to a scheduler` / `Swap #N is stale` (warn) / `Swap egress amount is zero, so it was refunded` | `swapStatusCheck.tsx`                |                                                                 |
| `Dispatched N jobs for message type X`                                                                                                                                                               | `messageRouter.ts`                   | **the fan-out count — see below**                               |
| `Processing time period stats` (+ `endOfPeriod`, `sendWeeklySummary`) / `Processed time period stats` / `discarding stale job` (warn)                                                                | `timePeriodStats.tsx`                | daily/weekly summaries, fires ~03:00 UTC                        |
| `Checking for new delegation requests, delegationActivityId: N` / `Latest delegation activity id: N` / `Sent messages for N new delegation events`                                                   | `newDelegationAcitivityCheck.tsx`    |                                                                 |
| `Checking for new liquidation swap requests` / `Latest liquidation swap request id: N, found N …`                                                                                                    | `newLiquidationCheck.tsx`            |                                                                 |
| `Checking for new loan update` / `Send message for loan N about X update` / `Loan N X update exceeded max age threshold` (warn)                                                                      | `newLoanUpdateCheck.tsx`             |                                                                 |
| `Checking for new lending liquidity change` / `Send message about lending liquidity X` / `… exceeded max age threshold` (warn)                                                                       | `newLendingLiquidityChangeCheck.tsx` |                                                                 |
| `health check ok` (debug) / `found jobs past due` (crit)                                                                                                                                             | `src/server.ts`                      | see restart forensics                                           |
| `Discord: client ready` / `Discord: Logged in` / `Discord: Going to login` / `Discord: shardReconnecting raised` (warn) / `Discord: shardDisconnect raised` (warn) / `discord debug` (debug)         | `channels/discord.ts`                | login lines mark a process start                                |
| `Visit the admin pages: http://…/admin/queues`                                                                                                                                                       | `main.ts`                            | **process start marker**                                        |
| `error occurred in job queue` (error)                                                                                                                                                                | `utils/functions.ts`                 | fields `name` (queue), `err`                                    |
| `deduplicated` / `error in queue` (error)                                                                                                                                                            | `queues/initialize.ts`               | BullMQ queue-level events                                       |
| `unhandledRejection` (error) / `uncaughtException` (crit)                                                                                                                                            | `utils/functions.ts`                 | `err` via `inspectError`                                        |

### Gotchas

- **Successful sends are not logged.** `sendMessage.ts` has no logger calls, so nothing records "message posted to Discord/Telegram/Twitter". The closest proxy is `Dispatched N jobs for message type X` from `messageRouter`, which counts the channels a message was _routed to_ — a send that then failed shows up only as an `error occurred in job queue` with `name: "sendMessage"`. To answer "did we post X?", count the dispatch lines and check for a matching sendMessage error in the same window; if you need certainty, look at the platform itself.
- **`name` vs `queue`.** `error occurred in job queue` puts the queue in `name` (from `logRejections`); the happy-path `newSwapAlert` line puts it in `queue`. Group errors by `name`, not `queue`.
- **`err.message` can be gigantic.** `graphql-request` stuffs the entire response _and the full query text_ into the error message, so a single GraphQL-timeout line runs to several KB. Always `line_format` it down or truncate in your parser. Real example (721 such lines in 24h on 2026-09-18, 689 of them `Query read timeout` and 31 `canceling statement due to statement timeout`, essentially all from `timePeriodStats` hitting `boostPools`):

  ```sh
  logcli query '{app="info-bot"} |= `error occurred in job queue` | json | line_format `{{.name}} :: {{.err_message}}`' \
    --addr="https://loki.monitoring" --tls-skip-verify --since=24h --limit=20 --output=raw --quiet | cut -c1-160
  ```

  A burst of these means the Explorer/LP GraphQL service is slow, not that the bot is broken — jobs retry (5 attempts, exponential backoff), so a summary usually still lands.

- **Numeric ids are strings.** `swapRequestId`, `lastCheckedLoanUpdateId` etc. are serialized as strings — compare with backticked literals, not numerically.
- **Tracing one swap** is a plain substring search: the id appears in both `Alerting about new swap request` (as a field) and `Checking swap #<id>` (inside the message).

  ```sh
  logcli query '{app="info-bot"} |= `1821023`' --addr="https://loki.monitoring" --tls-skip-verify \
    --since=24h --limit=0 --output=raw --quiet
  ```

## Correlating with VictoriaMetrics (pod metrics)

Pod metrics live in VictoriaMetrics at `https://victoria-metrics.monitoring` — same VPN/internal-DNS setup, no auth, PromQL-compatible, ≥180 days retention. Query with curl (no dedicated CLI installed). The container label is `container="info-bot"`, which joins directly with Loki's `app="info-bot"`:

```sh
curl -sk "https://victoria-metrics.monitoring/api/v1/query" \
  --data-urlencode 'query=container_memory_working_set_bytes{namespace="berghain", container="info-bot"}'
# also: /api/v1/query_range (start/end/step), /api/v1/label/<name>/values
```

Facts (verified 2026-09-18):

- **The `image` label carries the deployed git SHA**: `ghcr.io/chainflip-io/chainflip-info-bot/info-bot:main-<full-sha>`. You can map a metric inflection straight onto a commit in this repo (`git log <sha>`), which makes before/after regression checks easy.
- Memory limit is **1 GiB**, no CPU limit; steady-state working set is ~120 MB. So memory pressure is not normally the story here.
- The bot exposes **no application metrics** — no Prometheus endpoint in the codebase. VM gives the outside view (CPU/memory/network/restarts), Loki the inside view.
- Useful series: `container_memory_working_set_bytes`, `container_cpu_usage_seconds_total`, `kube_pod_container_status_restarts_total`, `kube_pod_container_status_last_terminated_reason`, `kube_pod_container_resource_limits`.

### Restart / health-check forensics — the signature failure of this service

The `/health` endpoint in `src/server.ts` returns **500** when any delayed `scheduler` job is past due beyond `HEALTH_CHECK_GRACE_PERIOD_MS` (default 10s), logging `found jobs past due` at `crit`. Kubernetes' liveness probe then kills the pod. This is by far the most common restart cause — as of 2026-09-18 the single pod had **460 lifetime restarts, ~103 in 24h**, with `last_terminated_reason` = `Completed` (i.e. **not** OOMKilled).

So when investigating "the bot went quiet" or "it keeps restarting":

```sh
# 1. how often, and was it OOM or the probe?
curl -sk "https://victoria-metrics.monitoring/api/v1/query" \
  --data-urlencode 'query=increase(kube_pod_container_status_restarts_total{namespace="berghain", container="info-bot"}[24h])'
curl -sk "https://victoria-metrics.monitoring/api/v1/query" \
  --data-urlencode 'query=kube_pod_container_status_last_terminated_reason{namespace="berghain", container="info-bot"}'

# 2. the crit lines that preceded each kill
logcli query 'sum(count_over_time({app="info-bot"} |= `found jobs past due` [1h]))' \
  --addr="https://loki.monitoring" --tls-skip-verify --since=24h --quiet

# 3. process starts, to see the restart cadence in the logs themselves
logcli query '{app="info-bot"} |= `Visit the admin pages`' \
  --addr="https://loki.monitoring" --tls-skip-verify --since=24h --limit=0 --output=raw --quiet
```

`Completed` + no memory ramp + `found jobs past due` immediately before = probe-driven restart, i.e. the scheduler queue backed up (usually because Redis or the GraphQL upstreams stalled), **not** a crash. `OOMKilled` or an `uncaughtException` crit line means something genuinely different — check the memory ramp shape and the stack.

Other combined patterns:

- **Missed alerts**: `Dispatched N jobs for message type X` counts vs. the `Found N new swap requests` / `Latest … id` lines upstream — a drop at the dispatch step points at config filters (`bot.config.json`), a drop upstream points at the GraphQL checks.
- **Upstream slowness**: a spike in `error occurred in job queue` with `Query read timeout` + flat CPU/memory means the Explorer or LP gateway is the bottleneck, not this pod.
- **Deploy regressions**: watch the `image` label for a change at the inflection point of any of the above.

## Handing off to the user

When the user wants to browse or watch logs themselves, hand them the LogQL query to paste into Grafana Explore at `https://grafana.aws.chainflip.xyz` (Loki datasource) instead of narrating logcli output. The bot also serves a Bull Board queue UI at `/admin/queues` (`src/server.ts`) — that is the place to inspect live job/retry state, which the logs do not fully expose.
