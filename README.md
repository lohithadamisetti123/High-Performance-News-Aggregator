# High-Performance News Aggregator

A polished React + Vite project that fetches and renders HackerNews top stories with a performance-first architecture.

This repository is structured to demonstrate two implementation paths:

- `slow-version`: an intentionally unoptimized branch that illustrates performance anti-patterns.
- `main`: the optimized implementation with virtualized rendering, code splitting, and production-grade deployment.

---

## Project overview

The app retrieves the current top stories from HackerNews and displays them as a responsive news feed.

It includes:

- a high-performance list rendering experience
- search and sort controls for rapid story discovery
- dark mode and visually appealing cards
- production build optimizations and bundle analysis
- Docker Compose support for containerized deployment

---



## Why this project matters

This repository is a strong real-world example of frontend performance engineering and modern React architecture. It is designed for evaluators looking for:

- effective UX and accessibility
- measurable Core Web Vitals improvements
- optimized asset delivery and lazy loading
- clean deployment workflows

The main branch is built to meet production expectations while keeping the codebase readable and maintainable.

---

## Branch summary

### `main`

The optimized branch implements:

- batched HackerNews API fetching
- virtualized list rendering with `@tanstack/react-virtual`
- lazy-loaded modal component
- improved CSS themes and responsive layout
- Docker-based production preview

### `slow-version`

The slow branch preserves common frontend anti-patterns so the difference is clear:

- un-virtualized list rendering
- heavier bundle behavior
- fewer performance optimizations
- educational comparison target

---

## Tech stack

- React 19
- Vite 5+ / Vite 8 runtime
- JavaScript + JSX
- CSS custom properties and responsive styling
- HackerNews Firebase API
- Docker, Docker Compose

---

## Prerequisites

Before running the project locally, install:

- Node.js 18 or newer
- npm 10 or compatible package manager
- Docker Desktop with Docker Compose support for container runs

---

## Environment variables

The repo includes `.env.example` for environment configuration.

Copy the template before running the app:

```bash
copy .env.example .env
```

Available variables:

- `VITE_HN_TOP_STORIES_URL`
- `VITE_HN_ITEM_URL`
- `PORT`

These variables are used by Vite to configure the HackerNews endpoints and local port behavior.

---

## Local development setup

1. Clone the repository:

```bash
git clone https://github.com/lohithadamisetti123/High-Performance-News-Aggregator.git
cd High-Performance-News-Aggregator
```

2. Install dependencies:

```bash
npm install
```

3. Create an environment file:

```bash
copy .env.example .env
```

4. Start the development server:

```bash
npm run dev
```

5. Open the app in your browser:

```text
http://localhost:5173
```

---

## Production build

Use Vite to build the app for production:

```bash
npm run build
```

The optimized production output is generated in the `dist/` directory.

### Preview locally

After building, preview the production bundle:

```bash
npm run preview
```

The preview server runs the production-ready assets locally so you can verify the real deployment output.

---

## Bundle analysis

A `stats.html` file is generated to inspect the final bundle.

This report helps verify:

- effective chunk splitting
- lazy-loaded modal assets
- CSS and JS sizes
- impact of dependencies on final bundle weight

Open `stats.html` in a browser to inspect the output.

---

## Docker deployment

This project includes a Dockerfile and Docker Compose configuration for containerized deployment.

### Build and run with Docker Compose

```bash
docker compose up -d --build
```

### Verify service status

```bash
docker compose ps
```

### Stop services

```bash
docker compose down
```

The container configuration includes a healthcheck to ensure the production app is ready before the service is considered healthy.

---

## Application features

- Fetches top 500 HackerNews stories
- Search stories by title instantly
- Sort stories by score
- Dark mode support with theme variables
- Virtualized list rendering for performance
- Skeleton loader during fetch operations
- Accessible keyboard navigation and focus states

---

## Performance optimizations

The optimized branch includes the following improvements:

- batched network requests to reduce overhead
- minimized re-renders using React memoization
- lazy loading for non-critical UI components
- virtualized scrolling for large lists
- preconnect hints in `index.html`
- efficient CSS transitions and reduced layout shifts

These changes improve speed and reduce perceived load time on slower devices.

---

## UX and accessibility

The app includes:

- high-contrast text for readability
- visible focus outlines for keyboard users
- semantic button and input labels
- responsive layout for mobile and desktop screens
- accessible modal experience with keyboard support

The styling is intentionally designed to be modern yet usable for all users.

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
├── stats.html
├── src
│   ├── AboutModal.css
│   ├── AboutModal.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
└── public
```

### Important source files

- `src/App.jsx` — main app logic, data fetching, list layout, and state management
- `src/App.css` — page styles, grid, card design, skeleton loaders, and animations
- `src/index.css` — global theme variables, accessibility helpers, and responsive utilities
- `src/AboutModal.jsx` — lazy-loaded modal with app information and “why this works” description

---

## Validation and quality checks

This repository has been verified with:

- `npm run build` for production compilation
- Docker Compose startup and shutdown validation
- bundle inspection through `stats.html`
- accessibility-friendly styling and keyboard support

Use the current branches to compare the optimized implementation against the slower reference version.

---

## Contribution notes

If you want to extend the project:

- add caching to reduce repeated HackerNews fetches
- implement server-side rendering for SEO
- add a favorites/bookmarks feature
- expand the UI with story categories and filters
Pull requests and issues are welcome.

---

## License

This project is provided under a permissive open source license. Review the repository license file or GitHub settings for details.

---

## Contact

For additional questions, improvements, or review requests, open an issue in the GitHub repository:

https://github.com/lohithadamisetti123/High-Performance-News-Aggregator
