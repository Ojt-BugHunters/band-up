FROM oven/bun:1.1.26 AS installer

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

FROM node:20-bullseye-slim AS builder

WORKDIR /app

COPY --from=installer /app/node_modules ./node_modules
COPY package.json ./

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM oven/bun:1.1.26 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

ENTRYPOINT ["bun", "run", "server.js"]
