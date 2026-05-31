import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
  lazy,
} from 'react';
import sortBy from 'lodash/sortBy';
import { useVirtualizer } from '@tanstack/react-virtual';
import './App.css';

// Reuse a single date formatter instance
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

// Heavy, non-critical component (code-split)
const AboutModal = lazy(() => import('./AboutModal.jsx'));

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  return dateFormatter.format(new Date(timestamp * 1000));
}

const ArticleItem = React.memo(function ArticleItem({ article }) {
  const formattedTime = useMemo(
    () => formatTimestamp(article.time),
    [article.time],
  );

  return (
    <div className="article-item" data-testid="article-item">
      <h3>
        <a href={article.url} target="_blank" rel="noreferrer">
          {article.title}
        </a>
      </h3>
      <p>
        Score: {article.score} | Author: {article.by}
      </p>
      <p>Time: {formattedTime}</p>
    </div>
  );
});

function App() {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('');
  const [sorted, setSorted] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [loading, setLoading] = useState(true);

  const parentRef = useRef(null);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const topUrl =
          import.meta.env.VITE_HN_TOP_STORIES_URL ||
          'https://hacker-news.firebaseio.com/v0/topstories.json';
        const itemBase =
          import.meta.env.VITE_HN_ITEM_URL ||
          'https://hacker-news.firebaseio.com/v0/item';

        const response = await fetch(topUrl);
        const storyIds = await response.json();
        const ids = storyIds.slice(0, 500);

        // Parallelize requests with Promise.all
        const stories = await Promise.all(
          ids.map(async (id) => {
            const resp = await fetch(`${itemBase}/${id}.json`);
            return resp.json();
          }),
        );

        setArticles(stories.filter(Boolean));
      } catch (error) {
        console.error('Error fetching stories', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = articles;
    if (filter.trim()) {
      const lower = filter.toLowerCase();
      result = result.filter(
        (a) => a.title && a.title.toLowerCase().includes(lower),
      );
    }
    if (sorted) {
      result = sortBy(result, 'score').reverse();
    }
    return result;
  }, [articles, filter, sorted]);

  const rowVirtualizer = useVirtualizer({
    count: filteredAndSorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 10,
  });

  return (
    <div className="app">
      <header className="hero">
        <img
          data-testid="hero-image"
          src="https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg?auto=compress&cs=tinysrgb&w=1600"
          srcSet="
            https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg?auto=compress&cs=tinysrgb&w=800 800w,
            https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg?auto=compress&cs=tinysrgb&w=1200 1200w,
            https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg?auto=compress&cs=tinysrgb&w=1600 1600w
          "
          width="1200"
          height="600"
          alt="News hero"
        />
        <h1>HackerNews Top Stories</h1>
        <p>
          High-performance news aggregator with optimized Core Web Vitals and
          virtualized list.
        </p>
      </header>

      <div className="controls">
        <input
          type="text"
          placeholder="Filter by title..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button onClick={() => setSorted((prev) => !prev)}>
          {sorted ? 'Unsort' : 'Sort by Score'}
        </button>
        <button onClick={() => setShowAbout(true)}>About</button>
      </div>

      {loading && <p>Loading stories...</p>}

      <div
        ref={parentRef}
        className="article-list-virtual-container"
        data-testid="article-list"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const article = filteredAndSorted[virtualRow.index];
            if (!article) return null;
            return (
              <div
                key={article.id}
                data-index={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <ArticleItem article={article} />
              </div>
            );
          })}
        </div>
      </div>

      {showAbout && (
        <Suspense fallback={<div>Loading details...</div>}>
          <AboutModal onClose={() => setShowAbout(false)} />
        </Suspense>
      )}
    </div>
  );
}

export default App;
