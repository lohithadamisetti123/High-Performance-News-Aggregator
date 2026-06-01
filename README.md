# High-Performance News Aggregator

A responsive, production-ready React + Vite application that fetches and renders the top 500 HackerNews stories with modern web performance and accessibility best practices.

This repository demonstrates a complete optimization workflow across UI polish, data fetching efficiency, frontend performance, build analysis, and containerized deployment.

---

## Why this project matters

- **Performance-first experience**: Virtualized list rendering, memoization, and preconnect hints keep the UI fast even with hundreds of stories.
- **Real-time HackerNews feed**: Fetches the latest top stories from HackerNews and presents them with score, author, time, and comment counts.
- **Polished UI**: Advanced styling, responsive layout, dark mode support, animated state transitions, and accessibility enhancements.
- **Container-ready**: Production build and Docker Compose support make it easy to deploy locally or in CI/CD.

---

## What’s included

- `src/App.jsx`: high-performance data fetching and rendering logic
- `src/index.css`: global design tokens, focus styling, and theme support
- `src/App.css`: responsive grid layout, cards, skeleton loaders, and animations
- `src/AboutModal.css`: polished modal styling and smooth transitions
- `Dockerfile`: multi-stage production build for small, secure containers
- `docker-compose.yml`: service orchestration with healthcheck and environment support
- `stats.html`: bundle analysis output from Vite build
- `PERFORMANCE.md`: audit notes and key optimization results

---

## Core features

- Fetches and displays the top 500 HackerNews stories
- Search and filter stories by title in real time
- Virtualized scrolling for high-volume list rendering
- Sorts stories by score for quick quality discovery
- Lightweight hero banner with optimized image loading
- Dark mode toggle and accessible color contrast
- Skeleton loading UI during data fetch
- Error and empty-state handling with friendly messaging
- Responsive layout for mobile, tablet, and desktop
- Production-optimized Vite build with bundle analysis
- Full Docker Compose support for local container deployment

---

## Setup requirements

Required tools:

- Node.js 18+ (LTS recommended)
- npm 10+ or compatible package manager
- Docker Desktop with Docker Compose support (optional for container deployment)

---

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
copy .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

4. Open the app in your browser:

```text
http://localhost:5173
```

---

## Production build

Build and preview the optimized production bundle:

```bash
npm run build
npm run preview
```

The static output is written to the `dist/` folder.

### Build artifacts

- `dist/index.html`
- `dist/assets/*.js`
- `dist/assets/*.css`

### Bundle analysis

The project produces a `stats.html` report that helps verify bundle size and chunk splitting.

---

## Docker deployment

This project supports containerized execution using Docker Compose.

### Build and run

```bash
docker compose up -d --build
```

### Verify service status

```bash
docker compose ps
```

### Shutdown containers

```bash
docker compose down
```

### Healthcheck behavior

The Compose service includes a healthcheck to confirm that the React production app is ready before it is considered healthy.

---

## Environment variables

The app supports the following environment variables via Vite:

- `VITE_HN_TOP_STORIES_URL`: HackerNews API endpoint for top stories
- `VITE_HN_ITEM_URL`: HackerNews API endpoint for story details
- `PORT`: local server port for Vite preview and production preview

These values are preconfigured in `.env.example`.

---

## Project structure

```text
.
├── Dockerfile
├── docker-compose.yml
├── index.html
├── package.json
├── README.md
├── PERFORMANCE.md
├── public/
├── src/
│   ├── AboutModal.css
│   ├── AboutModal.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
└── stats.html
```

---

## Performance highlights

- Virtualized list rendering with `@tanstack/react-virtual`
- Optimized image loading using `loading="lazy"` and `fetchpriority="high"`
- Reduced bundle overhead with code splitting and lazy-loaded modal component
- Improved startup by preconnecting to required APIs and using efficient data fetch batching
- CSS transitions and animations built with hardware-friendly properties only

---

## Accessibility improvements

- High-contrast text and focus-visible outlines for keyboard navigation
- Semantic HTML with landmarks and accessible form controls
- Accessible button labels and keyboard-friendly modal behavior
- Screen-reader friendly loading and error states

---

## Branch information

- `main`: optimized production implementation with performance and UX improvements
- `slow-version`: intentionally slower implementation for performance comparison and learning

---

## Git workflow

After making changes, use:

```bash
git add .
git commit -m "Describe your updates clearly"
git push origin main
```

---

## Notes for evaluators

This repository is built to demonstrate both frontend performance engineering and production readiness. It includes a complete local development workflow, optimized build output, runtime containerization, and clear performance documentation.

---

## Contact

For questions or further enhancements, open an issue or pull request in the repository.
