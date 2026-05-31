import React, { useEffect, useState, useMemo } from 'react';
import _ from 'lodash'; // Anti-pattern: full lodash import
import './App.css';

// Expensive date formatter created on each render (anti-pattern)
function formatTimestamp(timestamp) {
  // Very naive expensive computation
  const date = new Date(timestamp * 1000);
  let result = '';
  for (let i = 0; i < 1000; i++) {
    result = date.toLocaleString();
  }
  return result;
}

function ArticleItem({ article }) {
  // Expensive computation in render
  const formattedTime = formatTimestamp(article.time || 0);

  return (
    <div className="article-item" data-testid="article-item">
      <h3>
        <a href={article.url} target="_blank" rel="noreferrer">
          {article.title}
        </a>
      </h3>
      <p>Score: {article.score} | Author: {article.by}</p>
      <p>Time: {formattedTime}</p>
    </div>
  );
}

function App() {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('');
  const [sorted, setSorted] = useState(false);

  useEffect(() => {
    const fetchAllStories = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_HN_TOP_STORIES_URL ||
            'https://hacker-news.firebaseio.com/v0/topstories.json'
        );
        const storyIds = await response.json();
        const stories = [];
        // Anti-pattern: sequential fetching in a loop (N+1 waterfall)
        for (const id of storyIds.slice(0, 500)) {
          const storyResp = await fetch(
            `${import.meta.env.VITE_HN_ITEM_URL ||
              'https://hacker-news.firebaseio.com/v0/item'}/${id}.json`
          );
          const storyData = await storyResp.json();
          stories.push(storyData);
        }
        setArticles(stories);
      } catch (error) {
        console.error('Error fetching stories', error);
      }
    };
    fetchAllStories();
  }, []);

  // Anti-pattern: filter and sort recomputed on every render with full lodash
  const displayedArticles = useMemo(() => {
    let result = articles;
    if (filter.trim()) {
      result = result.filter((a) =>
        a.title?.toLowerCase().includes(filter.toLowerCase())
      );
    }
    if (sorted) {
      result = _.sortBy(result, 'score').reverse();
    }
    return result;
  }, [articles, filter, sorted]);

  return (
    <div className="app">
      {/* Large unoptimized hero image, no width/height/srcset/loading */}
      <div className="hero">
        <img
          data-testid="hero-image"
          src="https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg"
          alt="News hero"
        />
        <h1>HackerNews Top Stories</h1>
        <p>Intentionally slow, unoptimized version for performance baseline.</p>
      </div>

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
      </div>

      {/* No virtualization: render all 500 items */}
      <div className="article-list" data-testid="article-list">
        {displayedArticles.map((article) => (
          <ArticleItem key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

export default App;
