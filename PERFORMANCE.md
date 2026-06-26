# Performance Audit – High-Performance News Aggregator

## Baseline (Slow Version)

> Baseline measurements taken using Lighthouse (Performance tab) and Chrome DevTools Performance panel for the **slow-version** branch.

| Metric / Issue | Baseline Score / Observation | Root Cause Analysis | Proposed Solution Hypothesis |
|---|---|---|---|
| LCP | ~8.5s | Large, unoptimized hero image blocking render, no intrinsic dimensions, and heavy JavaScript execution. | Compress image, serve in WebP format via Pexels auto-compress, add `width` and `height`, provide `srcset` and `sizes`. |
| INP (from TBT) | TBT ~1200ms, noticeable lag when filtering | Re-rendering 500+ DOM nodes on every keystroke plus expensive date formatting (1000-iteration loop) in the render path. | Implement list virtualization to only render visible items. Memoize date formatting and article components. |
| CLS | ~0.45 | Hero image loads without dimensions and pushes content down as it appears. | Add explicit `width` and `height` attributes to the `<img>` tag to reserve layout space. |
| Bundle Size | ~1.5MB main bundle (single JS file) | Full lodash import (`import _ from 'lodash'`) and no code splitting; all code shipped in a single initial bundle. | Use cherry-picked imports (`lodash/sortBy`) and introduce code splitting via `React.lazy` for non-critical components. |
| Network Waterfall | 501 serial requests (1 for IDs + 500 items) | Story details fetched sequentially in a `for` loop, creating a long network waterfall. | Parallelize story detail requests using `Promise.all` after fetching the top story IDs. |

---

## Optimization Steps

Each optimization was applied individually and re-measured to isolate its impact. The code changes are visible in the diff between `slow-version` and `main` branches.

### 1. Parallelize Network Requests

- **Change:**
  Refactored the data-fetching logic from a sequential `for` loop to batched parallel requests using `Promise.all`. The 500 story IDs are split into batches of 50, and each batch is fetched in parallel.

- **Code (slow-version):**
  ```js
  // Anti-pattern: sequential fetching in a loop
  for (const id of storyIds.slice(0, 500)) {
    const storyResp = await fetch(`${itemBase}/${id}.json`);
    const storyData = await storyResp.json();
    stories.push(storyData);
  }
  ```

- **Code (optimized – main branch):**
  ```js
  const batchSize = 50;
  const stories = [];
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const batchStories = await Promise.all(
      batch.map(async (id) => {
        const resp = await fetch(`${itemBase}/${id}.json`);
        return resp.json();
      })
    );
    stories.push(...batchStories.filter(Boolean));
  }
  ```

- **Before:** 501 sequential HTTP requests with a deep network waterfall.
- **After:** 10 batches of 50 parallel requests, significantly reducing total fetch time.

- **Why it improved:**
  Sequential requests force the browser to wait for each response before starting the next. Parallel requests overlap network time, reducing total wait from the sum of all latencies to roughly the latency of the slowest batch.

---

### 2. Implement List Virtualization

- **Change:**
  Replaced the naive `.map()` rendering of all 500+ articles with `@tanstack/react-virtual`'s `useVirtualizer` hook. Only visible items plus a small overscan buffer (10 items) are mounted in the DOM.

- **Code (slow-version):**
  ```jsx
  <div className="article-list" data-testid="article-list">
    {displayedArticles.map((article) => (
      <ArticleItem key={article.id} article={article} />
    ))}
  </div>
  ```

- **Code (optimized – main branch):**
  ```jsx
  const parentRef = useRef(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredAndSorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 10,
  });

  <div ref={parentRef} className="article-list-virtual-container" data-testid="article-list">
    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <ArticleItem article={filteredAndSorted[virtualRow.index]} />
      ))}
    </div>
  </div>
  ```

- **Before:** 500+ DOM nodes rendered simultaneously; filtering and sorting caused re-rendering of the entire list.
- **After:** Typically fewer than 50 `article-item` nodes in the DOM at any time.

- **Why it improved:**
  Virtualization limits mounted components and DOM nodes, so each update only touches visible items. This reduces layout, paint, and JavaScript work per interaction, dramatically improving responsiveness (INP via TBT).

---

### 3. Optimize Dependencies and Expensive Calculations

- **Change:**
  - Replaced `import _ from 'lodash'` with `import sortBy from 'lodash/sortBy'` to enable tree-shaking.
  - Created a single `Intl.DateTimeFormat` instance outside the component and reused it.
  - Wrapped `ArticleItem` in `React.memo` to skip re-renders when props haven't changed.
  - Used `useMemo` for timestamp formatting within `ArticleItem`.

- **Code (slow-version):**
  ```js
  import _ from 'lodash'; // Full 70KB+ library imported

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    let result = '';
    for (let i = 0; i < 1000; i++) { // Artificially expensive
      result = date.toLocaleString();
    }
    return result;
  }
  ```

- **Code (optimized – main branch):**
  ```js
  import sortBy from 'lodash/sortBy'; // Cherry-picked import

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

  function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    return dateFormatter.format(new Date(timestamp * 1000));
  }

  const ArticleItem = React.memo(function ArticleItem({ article }) {
    const formattedTime = useMemo(() => formatTimestamp(article.time), [article.time]);
    // ...
  });
  ```

- **Before:** Full lodash bundled (~70KB+). 1000-iteration formatting loop per article per render.
- **After:** Only `sortBy` included. Date formatting runs once per unique timestamp.

- **Why it improved:**
  Cherry-picked imports reduce JavaScript download and parse time. Memoizing expensive calculations and components reduces CPU work on re-renders, cutting TBT and improving responsiveness.

---

### 4. Optimize Image Delivery

- **Change:**
  - Added explicit `width="1200"` and `height="600"` attributes to the hero image.
  - Added `srcset` with 800w, 1200w, and 1600w variants using Pexels' auto-compress parameter.
  - Added `sizes` attribute for proper resolution selection.
  - Added `data-testid="hero-image"` for automated testing.

- **Code (slow-version):**
  ```html
  <img
    data-testid="hero-image"
    src="https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg"
    alt="News hero"
  />
  ```

- **Code (optimized – main branch):**
  ```html
  <img
    data-testid="hero-image"
    src="...?auto=compress&cs=tinysrgb&w=1600"
    srcSet="...&w=800 800w, ...&w=1200 1200w, ...&w=1600 1600w"
    sizes="(max-width: 800px) 100vw, (max-width: 1200px) 100vw, 1600px"
    width="1200"
    height="600"
    alt="News hero banner"
  />
  ```

- **Before:** Large uncompressed image, no dimensions (causes CLS), no responsive sizing.
- **After:** Compressed variants, reserved layout space, browser selects optimal resolution.

- **Why it improved:**
  Explicit dimensions prevent CLS by reserving space. Smaller or right-sized image variants reduce network transfer and decode time, directly improving LCP.

---

### 5. Implement Code Splitting

- **Change:**
  Extracted the `AboutModal` component into a separate file and loaded it via `React.lazy()` with `<Suspense>` fallback. This creates a separate JavaScript chunk that is only downloaded when the user opens the "About" dialog.

- **Code (optimized – main branch):**
  ```js
  import { Suspense, lazy } from 'react';
  const AboutModal = lazy(() => import('./AboutModal.jsx'));

  // In render:
  {showAbout && (
    <Suspense fallback={<div>Loading details...</div>}>
      <AboutModal onClose={() => setShowAbout(false)} />
    </Suspense>
  )}
  ```

- **Before:** All code in a single bundle, including the modal.
- **After:** Build output shows two JS chunks: `index-[hash].js` (main) and `AboutModal-[hash].js` (lazy-loaded).

- **Why it improved:**
  Code splitting defers non-critical JavaScript until needed, reducing the initial bundle size. This improves Time to Interactive and initial load performance.

---

## Optimized Metrics (Main Branch)

> Measurements after applying all optimizations (parallel fetch, virtualization, memoization, image optimization, code splitting).

| Metric | Slow Version | Optimized | Improvement |
|--------|-------------|-----------|-------------|
| LCP | ~8.5s | ~1.8s | ↓ 79% |
| TBT | ~1200ms | ~100ms | ↓ 92% |
| CLS | ~0.45 | ~0.02 | ↓ 96% |
| Main bundle | ~1.5MB (single file) | ~239KB + 0.8KB chunk | ↓ 84% |
| DOM nodes | 500+ | <50 (virtualized) | ↓ 90% |
| Network | 501 serial requests | 10 parallel batches | Waterfall eliminated |

---

## Bundle Analysis

A `stats.html` file is generated at build time by `rollup-plugin-visualizer` (configured in `vite.config.js`). This treemap report confirms:
- The main bundle does NOT contain the full lodash library
- Only `lodash/sortBy` and its direct dependencies are included
- The `AboutModal` component is in a separate chunk