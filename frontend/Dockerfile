# ── Stage 1: Dependencies ────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Enable corepack to use pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# ── Stage 2: Build ───────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm build

# ── Stage 3: Run ─────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
USER nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]