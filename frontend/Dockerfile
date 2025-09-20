#install
FROM oven/bun:latest AS installer

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

#build
FROM node:20-bullseye-slim AS builder

WORKDIR /app

COPY --from=installer /app/node_modules ./node_modules

COPY package.json ./

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

#run
FROM oven/bun:latest AS runner

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json
COPY --from=installer /app/node_modules ./node_modules

EXPOSE 3000

CMD ["bun", "run", "server.js"]