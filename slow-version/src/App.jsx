import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import './App.css';

function formatTimestamp(timestamp) {
  // Expensive formatter (anti-pattern): creates a new Date formatter repeatedly
  let out = '';
  for (let i = 0; i < 1000; i++) {
    const d = new Date((timestamp || Date.now() / 1000) * 1000);
    out = d.toLocaleString();
  }
  return out;
}

export default function App() {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('');
  const [sorted, setSorted] = useState(false);

  useEffect(() => {
    const fetchAllStories = async () => {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const storyIds = await response.json();
      const stories = [];
      // Anti-pattern: sequential fetching in a loop (N+1)
      for (const id of storyIds.slice(0, 500)) {
        const storyResp = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        const storyData = await storyResp.json();
        stories.push(storyData);
      }
      setArticles(stories);
    };

    fetchAllStories();
  }, []);

  const displayed = articles
    .filter((a) => (a.title || '').toLowerCase().includes(filter.toLowerCase()))
    .slice(0, 500);

  const sortedDisplayed = sorted ? _.sortBy(displayed, 'score').reverse() : displayed;

  return (
    <div className="app">
      <header className="hero">
        {/* Large, unoptimized hero image (anti-pattern) */}
        <img src="https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg" alt="hero" />
        <h1>HackerNews Top Stories — Slow Version</h1>
      </header>

      <div className="controls">
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by title..." />
        <button onClick={() => setSorted((s) => !s)}>{sorted ? 'Unsort' : 'Sort by Score'}</button>
      </div>

      <div className="article-list" data-testid="article-list">
        {sortedDisplayed.map((article) => (
          <div key={article.id} className="article-item" data-testid="article-item">
            <h3><a href={article.url} target="_blank" rel="noreferrer">{article.title}</a></h3>
            <p>Score: {article.score} | By: {article.by}</p>
            <p>{formatTimestamp(article.time)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
