FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# package-lock.json is written by npm 11, which omits optional peer dependencies
# that npm 10 (the version bundled with this image) still expects to find, so
# `npm ci` fails on it. Match the npm that produced the lock file.
RUN npm i -g npm@11 && npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV SQLITE_PATH=/data/database.sqlite

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

RUN mkdir -p /data

EXPOSE 3000

CMD ["node", "dist/main.js"]
