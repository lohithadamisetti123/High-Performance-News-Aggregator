# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY vite.config.* ./
COPY .env.example ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package.json and lockfile
COPY package*.json ./

# Install ALL dependencies including dev so `vite` is available
RUN npm install

# Copy built assets and stats
COPY --from=build /app/dist ./dist
COPY --from=build /app/stats.html ./stats.html

# Copy env
COPY .env.example ./.env

ENV PORT=4173

EXPOSE 4173

# Ensure node_modules/.bin is on PATH so `vite` is found
ENV PATH=/app/node_modules/.bin:$PATH

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
