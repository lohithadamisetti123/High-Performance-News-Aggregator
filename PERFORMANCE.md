# Performance Audit – High-Performance News Aggregator

## Baseline (Slow Version)

> Baseline measurements taken using Lighthouse (Performance tab) and Chrome DevTools Performance panel for the **slow-version** branch.

| Metric / Issue   | Baseline Score / Observation                | Root Cause Analysis                                                                                     | Proposed Solution Hypothesis                                                                                          |
|------------------|---------------------------------------------|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| LCP              | ~8.5s                                       | Large, unoptimized hero image blocking render, no intrinsic dimensions, and heavy JavaScript execution. | Compress/optimize hero image, add `width` and `height`, provide `srcset`, and keep main thread free during initial paint. |
| INP (from TBT)   | TBT ~1200ms, noticeable lag when filtering  | Re-rendering 500+ DOM nodes on every keystroke plus expensive date formatting in the render path.      | Implement list virtualization, memoize expensive computations, and avoid unnecessary re-renders.                     |
| CLS              | ~0.45                                       | Hero image loads without dimensions and pushes content down as it appears.                             | Add explicit `width` and `height` to the hero `<img>` to reserve layout space ahead of time.                         |
| Bundle Size      | ~1.5MB main bundle (single JS file)         | Full lodash import and no code splitting; all code shipped in a single initial bundle.                 | Use cherry-picked lodash imports (e.g., `lodash/sortBy`) and introduce code splitting for non-critical components.   |
| Network Waterfall| 501 serial requests (1 for IDs + 500 items) | Story details fetched sequentially in a `for` loop, creating a long network waterfall.                 | Parallelize story detail requests using `Promise.all` after fetching the top stories IDs.                             |

---

## Optimization Steps

This section documents each optimization (parallel fetch, virtualization, dependency optimization, image optimization, code splitting) with before/after metrics and reasoning.

### 1. Parallelize Network Requests

- **Change:**  
  Refactored the data-fetching logic to request the 500 story details in parallel using `Promise.all` after fetching the list of top story IDs, instead of awaiting each `fetch` inside a loop.

- **Before:**  
  501 sequential HTTP requests (1 for `topstories.json` + 500 item requests), leading to a long waterfall in the Network panel and slow initial data load.

- **After:**  
  1 request for `topstories.json`, followed by 500 item requests fired in parallel. Total data-fetch time is significantly reduced, and the Network panel shows overlapping requests instead of a deep waterfall.

- **Why it improved:**  
  Sequential requests force the browser to wait for each response before starting the next, so total time roughly sums all latencies. Parallel requests overlap network time, reducing total wait and allowing the UI to render the list sooner, improving perceived load performance and LCP/TBT.

---

### 2. Implement List Virtualization

- **Change:**  
  Replaced the naive `.map` rendering of all 500+ articles with a virtualized list using `@tanstack/react-virtual` and a scrollable container (`data-testid="article-list"`). Only the visible items plus a small overscan are mounted at any time.

- **Before:**  
  Every filter keystroke or sort action caused React to re-render all 500+ `ArticleItem` components. The DOM contained hundreds of nodes simultaneously, and DevTools showed long tasks during input interactions.

- **After:**  
  The DOM typically contains fewer than 50 `article-item` nodes at a time. Scrolling is smooth, filter and sort interactions feel instantaneous, and DevTools shows much shorter tasks with dramatically lower TBT.

- **Why it improved:**  
  Virtualization limits the number of mounted components and DOM nodes, so each update touches only a small subset of items. This reduces layout, paint, and JavaScript work per interaction, improving responsiveness (INP surrogate via TBT) and memory usage.

---

### 3. Optimize Dependencies and Expensive Calculations

- **Change:**  
  - Switched from `import _ from 'lodash'` to `import sortBy from 'lodash/sortBy'`.  
  - Created a single `Intl.DateTimeFormat` instance outside the component and used `useMemo` for formatted timestamps.  
  - Wrapped `ArticleItem` in `React.memo` to avoid re-rendering unchanged items during filter/sort operations.

- **Before:**  
  The bundle included the full lodash library despite using only sorting functionality. Date formatting was recalculated for every item on every render, and all items re-rendered even when their props did not change.

- **After:**  
  The main bundle is smaller and split into multiple chunks; redundant lodash code is excluded. Date formatting work is reduced via memoization, and many `ArticleItem` components are skipped during re-renders thanks to `React.memo`.

- **Why it improved:**  
  Cherry-picked imports reduce JavaScript download and parse time. Memoizing expensive calculations and components reduces CPU work on re-renders, cutting TBT and improving responsiveness, especially during frequent interactions like filtering and sorting.

---

### 4. Optimize Image Delivery

- **Change:**  
  Optimized the hero image by:
  - Using a compressed variant via query parameters.
  - Adding explicit `width="1200"` and `height="600"` attributes.
  - Providing a `srcset` with multiple resolutions so the browser can choose the best size per device.

- **Before:**  
  The large hero image loaded without intrinsic dimensions or responsive sizing, causing a high LCP and significant layout shifts as the image appeared.

- **After:**  
  The hero image loads with reserved layout space, minimizing layout shifts. The browser selects an appropriate resolution from `srcset`, which reduces bytes downloaded and speeds up rendering of the Largest Contentful Paint element.

- **Why it improved:**  
  Explicit dimensions prevent CLS by reserving space for the image. Smaller or right-sized image variants reduce network transfer and decode time, directly improving LCP and overall load performance.

---

### 5. Implement Code Splitting

- **Change:**  
  Extracted a non-critical UI piece (`AboutModal`) into a lazily loaded chunk using `React.lazy` and `Suspense`, so it is only loaded when the user opens the “About” dialog.

- **Before:**  
  All code, including the modal, was bundled into a single main JavaScript file loaded on initial page load, increasing bundle size and initial parse/execute time.

- **After:**  
  The production build outputs multiple JavaScript chunks in `dist/assets`, including a separate chunk for `AboutModal`. The main bundle is smaller and loads faster; the modal chunk is only fetched on demand.

- **Why it improved:**  
  Code splitting defers non-critical JavaScript until it is actually needed, reducing the amount of code the browser must download, parse, and execute before the app becomes interactive. This improves initial load performance and perceived responsiveness.

---

## Optimized Metrics (Main Branch)

> Measurements after applying all optimizations (parallel fetch, virtualization, memoization, image optimization, code splitting).

- LCP: ~1.8s (down from ~8.5s).
- TBT: ~100ms (down from ~1200ms).
- CLS: ~0.02 (down from ~0.45).
- Main bundle: significantly smaller with multiple JavaScript chunks generated in `dist/assets` (main chunk + About modal chunk), plus `stats.html` bundle analysis output.