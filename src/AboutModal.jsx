import React from 'react';
import './AboutModal.css';

function AboutModal({ onClose }) {
  return (
    <div className="about-backdrop" role="dialog" aria-modal="true">
      <div className="about-modal">
        <h2>About This Project</h2>
        <p>
          This application demonstrates performance engineering in a React + Vite
          app using Core Web Vitals as guiding metrics.
        </p>
        <ul>
          <li>Parallelized network requests to the HackerNews API.</li>
          <li>Virtualized list rendering for 500+ stories.</li>
          <li>Optimized hero image delivery with modern attributes.</li>
          <li>Code splitting via React.lazy and Suspense.</li>
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default AboutModal;
