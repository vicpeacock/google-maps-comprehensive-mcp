# -------------------------
# Stage 1: Builder
# -------------------------
FROM node:22.12.0-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json tsconfig.json ./

# Install all dependencies (including TypeScript)
RUN npm install && npm cache clean --force

# Copy source code and build
COPY src ./src
RUN npm run build

# -------------------------
# Stage 2: Runtime (release)
# -------------------------
FROM node:22.12.0-alpine AS release

WORKDIR /app

# Copy the compiled build
COPY --from=builder /app/dist ./dist

# Copy package files for runtime dependencies only
COPY --from=builder /app/package*.json ./

# Install only runtime dependencies
RUN npm install --omit=dev && npm cache clean --force

# Set environment variables
ENV NODE_ENV=production

# MCP servers communicate via stdio, not HTTP ports
# No EXPOSE needed for stdio-based MCP servers

# Set default Google Maps API key (can be overridden)
ENV GOOGLE_MAPS_API_KEY=""

# Start the MCP server
CMD ["node", "dist/index.js"]