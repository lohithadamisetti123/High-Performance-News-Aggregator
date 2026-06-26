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
  const [error, setError] = useState(null);

  const parentRef = useRef(null);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      setError(null);
      try {
        const topUrl =
          import.meta.env.VITE_HN_TOP_STORIES_URL ||
          'https://hacker-news.firebaseio.com/v0/topstories.json';
        const itemBase =
          import.meta.env.VITE_HN_ITEM_URL ||
          'https://hacker-news.firebaseio.com/v0/item';

        const response = await fetch(topUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch story IDs: ${response.statusText}`);
        }
        
        const storyIds = await response.json();
        const ids = storyIds.slice(0, 500);

        // Parallelize requests with Promise.all in batches to avoid overwhelming the server
        const batchSize = 50;
        const stories = [];
        for (let i = 0; i < ids.length; i += batchSize) {
          const batch = ids.slice(i, i + batchSize);
          const batchStories = await Promise.all(
            batch.map(async (id) => {
              try {
                const resp = await fetch(`${itemBase}/${id}.json`);
                if (!resp.ok) return null;
                return resp.json();
              } catch (err) {
                console.warn(`Failed to fetch story ${id}:`, err);
                return null;
              }
            }),
          );
          stories.push(...batchStories.filter(Boolean));
        }

        setArticles(stories);
      } catch (error) {
        console.error('Error fetching stories', error);
        setError(error.message || 'Failed to fetch stories. Please try again later.');
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
          sizes="(max-width: 800px) 100vw, (max-width: 1200px) 100vw, 1600px"
          width="1200"
          height="600"
          alt="News hero banner"
        />
        <h1>HackerNews Top Stories</h1>
        <p>
          High-performance news aggregator with optimized Core Web Vitals and
          virtualized list rendering.
        </p>
      </header>

      <div className="controls">
        <input
          type="text"
          placeholder="Filter by title..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter articles by title"
        />
        <button 
          onClick={() => setSorted((prev) => !prev)}
          aria-pressed={sorted}
        >
          {sorted ? '↓ Unsort' : '↑ Sort by Score'}
        </button>
        <button onClick={() => setShowAbout(true)}>
          ℹ️ About
        </button>
      </div>

      {loading && <p className="loading">Loading stories...</p>}
      
      {error && (
        <div style={{
          margin: '16px',
          padding: '16px',
          background: '#fee',
          border: '2px solid #f88',
          borderRadius: '8px',
          color: '#c33',
          fontWeight: '500'
        }}>
          Error: {error}
        </div>
      )}

      {!loading && articles.length === 0 && !error && (
        <div className="empty-state">
          <p>📭 No articles found.</p>
          <p>Try adjusting your filters.</p>
        </div>
      )}

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
        <Suspense fallback={<div style={{ padding: '32px', textAlign: 'center' }}>Loading details...</div>}>
          <AboutModal onClose={() => setShowAbout(false)} />
        </Suspense>
      )}
    </div>
  );
}

export default App;
