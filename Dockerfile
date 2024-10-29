FROM node:22.3.0-bullseye-slim as builder

# create root application folder
WORKDIR /app

COPY . .

RUN npm install -g pnpm@9

RUN pnpm install --frozen-lockfile

ARG node_env=production
ENV NODE_ENV=$node_env

RUN pnpm build

FROM node:22.3.0-bullseye-slim

WORKDIR /app

RUN npm install -g pnpm@9

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/dist /app/dist


# using ENTRYPOINT causes signals (SIGINT) to be passed onto the node process
ENTRYPOINT ["node", "--enable-source-maps", "./dist/main.js"]
