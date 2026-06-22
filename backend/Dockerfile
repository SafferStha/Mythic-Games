# ── Stage 1: Dependencies ─────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Create logs directory with correct permissions
RUN mkdir -p logs && chown appuser:appgroup logs

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=appuser:appgroup . .

# Remove dev files
RUN rm -rf tests/ .env* *.md

USER appuser

EXPOSE 5000

# Healthcheck — gives the container time to start migrations
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', r => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
