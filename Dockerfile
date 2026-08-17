FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build
RUN source_dir="$(find node_modules/.pnpm -mindepth 4 -maxdepth 4 -type d -path '*/node_modules/@swc/helpers' -print -quit)" \
  && target_dir="$(find .next/standalone/node_modules/.pnpm -mindepth 4 -maxdepth 4 -type d -path '*/node_modules/@swc/helpers' -print -quit)" \
  && test -n "$source_dir" && test -n "$target_dir" \
  && cp -R "$source_dir/." "$target_dir/"

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
RUN addgroup -S radar && adduser -S radar -G radar
COPY --from=build --chown=radar:radar /app/.next/standalone ./
COPY --from=build --chown=radar:radar /app/.next/static ./.next/static
COPY --from=build --chown=radar:radar /app/public ./public
USER radar
EXPOSE 3000
CMD ["node", "server.js"]
