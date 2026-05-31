# High-Performance News Aggregator

A React + Vite application that displays the top 500 stories from HackerNews and demonstrates a complete performance optimization workflow.

- **slow-version branch**: Intentionally slow implementation with performance anti-patterns.
- **main branch**: Optimized implementation with better Core Web Vitals, list virtualization, and code splitting.

## Features

- Fetches and displays top 500 HackerNews stories.
- Filter by title and sort by score.
- Hero image banner with modern optimization attributes.
- Virtualized article list for high-performance rendering.

## Requirements

- Node.js (LTS)
- npm
- Docker & Docker Compose

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default values:

- `VITE_HN_TOP_STORIES_URL`
- `VITE_HN_ITEM_URL`
- `PORT`

## Running (Dev)

```bash
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173`.

## Production Build

```bash
npm run build
npm run preview
```

Build artifacts are generated in `dist/`. The build also produces `stats.html` bundle analysis.

## Docker

See `docker-compose.yml` and `Dockerfile` for containerized setup:

```bash
docker-compose up -d --build
```

Then open the application on the configured port (default 4173).
