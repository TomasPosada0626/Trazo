FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
# Same npm pin as the backend image: package-lock.json is written by npm 11,
# which omits optional peer dependencies that the npm bundled with this image
# still expects to find, so `npm ci` rejects the lock file as out of sync.
RUN npm i -g npm@11 && npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
# Without an explicit host the server can bind to loopback only, which makes it
# unreachable from outside the container even with the port published.
ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

# Nitro bundles every runtime dependency into .output, so the final image needs
# neither node_modules nor the sources — only Node and this directory.
COPY --from=build --chown=node:node /app/.output ./.output

USER node

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
