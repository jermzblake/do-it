ARG BUN_VERSION=1.3.2
FROM oven/bun:${BUN_VERSION}-slim AS base

LABEL fly_launch_runtime="Bun"

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production --ignore-scripts

# Build the app
FROM base AS builder
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts
COPY . .
RUN set -ex && \
    echo "=== Verifying tailwind plugin ===" && \
    bun -e "import plugin from 'bun-plugin-tailwind'; console.log('Plugin loaded:', typeof plugin)" || echo "Plugin load failed!" && \
    echo "=== Running build directly (not via npm script) ===" && \
    bun build.ts || (echo "Build script failed with exit code: $?" && exit 1) && \
    echo "=== Checking for dist ===" && \
    test -d /app/dist && ls -la /app/dist || (echo "ERROR: No dist!" && exit 1)

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/dist ./dist
COPY entrypoint.sh ./

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 8080

ENTRYPOINT ["/app/entrypoint.sh"]
# Start the server
CMD ["bun", "src/server/index.ts"]