# Use the official Node.js 20 image for builds
ARG DOCKER_NODE_VERSION=20-bookworm-slim

FROM node:$DOCKER_NODE_VERSION AS build

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

COPY . .

# Install dependencies
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store/v3 pnpm install --frozen-lockfile

ENV NODE_ENV=production

RUN pnpm build
