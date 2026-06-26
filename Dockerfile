# ── Build stage ──────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Production stage (nginx) ────────────────────────────────
FROM nginx:stable-alpine AS production

# Install wget for Docker healthcheck
RUN apk add --no-cache wget

# Copy the built assets into nginx's default serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
