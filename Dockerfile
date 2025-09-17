# ---- Base: sets up core tooling and non-root user ----
FROM node:20-bookworm-slim AS base
ENV NODE_ENV=production
# Ensure system deps for sharp / Next image optimization are present
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates dumb-init curl git && \
    rm -rf /var/lib/apt/lists/*
RUN useradd -m -u 1001 -s /bin/bash nodejs
WORKDIR /app

# ---- Dependencies: install node_modules with correct lockfile ----
FROM base AS deps
# Install only package manager if needed (npm is included)
# If you use pnpm or yarn, add it here.
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
# Prefer npm by default; switch if using yarn/pnpm
RUN if [ -f package-lock.json ]; then npm ci --include=dev; \
    elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
    else npm i --include=dev; fi

# ---- Build: compiles Next to standalone output ----
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# If you build needs env at build-time, set ARGs/ENV here or use a build-time .env
# Example (uncomment only if you truly need to inline something at build):
# ARG NEXT_PUBLIC_SOME_FLAG
# ENV NEXT_PUBLIC_SOME_FLAG=$NEXT_PUBLIC_SOME_FLAG
RUN npm run build

# ---- Runner: minimal image with standalone server ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Use a non-root user
USER nodejs
WORKDIR /app

# Copy Next standalone server and public assets
# Next.js standalone puts a server.js and node_modules under .next/standalone
COPY --chown=nodejs:nodejs --from=builder /app/.next/standalone ./
COPY --chown=nodejs:nodejs --from=builder /app/.next/static ./public/_next/static
COPY --chown=nodejs:nodejs --from=builder /app/public ./public

# Runtime environment (set defaults; override in compose/infra)
ENV PORT=3000
# IMPORTANT: NEXTAUTH values must be available at runtime
# Example defaults; override these in docker-compose or your orchestrator:
# ENV NEXTAUTH_URL=https://your-domain.example.com
# ENV NEXTAUTH_SECRET=replace-me
# ENV GO_SERVER_URL=http://api:8080/api/v1

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://127.0.0.1:${PORT}/api/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
