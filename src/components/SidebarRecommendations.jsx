import React, { useState, useEffect } from 'react';
import { Star, Play } from 'lucide-react';
import { fetchMediaDetails, TMDB_CONFIG, CURATED_LISTS } from '../config/tmdb';

export default function SidebarRecommendations({ currentId, currentType, setView }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadRecommendations() {
      setLoading(true);
      try {
        // Find which list the current movie belongs to, and fetch others from it as recommendations!
        // This ensures the sidebar is highly relevant (e.g. Anime shows other Anime, Marvel shows Marvel)
        let relevantList = [];
        if (currentType === 'tv') {
          // Check if Kdrama
          const isKdrama = CURATED_LISTS.kdrama.some(item => item.id === currentId);
          relevantList = isKdrama ? CURATED_LISTS.kdrama : CURATED_LISTS.anime;
        } else {
          // Check if Marvel
          const isMarvel = CURATED_LISTS.marvel.some(item => item.id === currentId);
          relevantList = isMarvel ? CURATED_LISTS.marvel : CURATED_LISTS.anime;
        }

        // Filter out current playing item and pick up to 5 recommendations
        const filteredList = relevantList
          .filter(item => item.id !== currentId)
          .slice(0, 5);

        // Fetch details
        const promises = filteredList.map(item => fetchMediaDetails(item.id, item.type));
        const results = await Promise.all(promises);
        
        if (active) {
          setRecommendations(results.filter(movie => movie !== null));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadRecommendations();
    return () => { active = false; };
  }, [currentId, currentType]);

  return (
    <div className="recommendations-sidebar glass">
      <h3 className="sidebar-title">Up Next / Recommended</h3>

      <div className="recommendations-list">
        {loading ? (
          // Skeletons
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="rec-card-skeleton">
              <div className="skeleton rec-skel-img"></div>
              <div className="rec-skel-body">
                <div className="skeleton rec-skel-line w-80"></div>
                <div className="skeleton rec-skel-line w-40"></div>
              </div>
            </div>
          ))
        ) : recommendations.length === 0 ? (
          <p className="no-recommendations">No recommendations found.</p>
        ) : (
          recommendations.map(movie => {
            const title = movie.title || movie.name;
            const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
            const year = (movie.release_date || movie.first_air_date || '').split('-')[0];
            const type = movie.media_type === 'tv' ? 'TV Show' : 'Movie';

            return (
              <div 
                key={movie.id} 
                className="rec-card glow-purple"
                onClick={() => setView('watch', movie.id, movie.media_type)}
              >
                {/* Poster */}
                <div className="rec-poster">
                  <img src={TMDB_CONFIG.posterUrl(movie.poster_path)} alt={title} className="rec-img" />
                  <div className="rec-overlay">
                    <Play size={12} fill="currentColor" />
                  </div>
                </div>

                {/* Details */}
                <div className="rec-details">
                  <span className="rec-type-badge">{type}</span>
                  <h4 className="rec-name" title={title}>{title}</h4>
                  <div className="rec-meta">
                    <span className="rec-rating">
                      <Star size={10} fill="currentColor" /> {rating}
                    </span>
                    <span className="dot">•</span>
                    <span>{year}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .recommendations-sidebar {
          padding: 20px;
          border-radius: var(--border-radius-md);
          position: sticky;
          top: 90px;
        }
        .sidebar-title {
          font-family: var(--font-secondary);
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 10px;
        }
        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .no-recommendations {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          text-align: center;
          padding: 20px 0;
        }
        .rec-card {
          display: flex;
          gap: 12px;
          cursor: pointer;
          border-radius: var(--border-radius-sm);
          padding: 8px;
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.03);
          transition: var(--transition-smooth);
        }
        .rec-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(4px);
        }
        .rec-poster {
          position: relative;
          width: 60px;
          aspect-ratio: 2/3;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
          background: #18181b;
        }
        .rec-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .rec-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition-fast);
        }
        .rec-card:hover .rec-overlay {
          opacity: 1;
        }
        .rec-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }
        .rec-type-badge {
          font-size: 0.6rem;
          color: var(--color-accent);
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .rec-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--color-text-main);
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rec-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
        .rec-rating {
          color: var(--color-warning);
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-weight: 600;
        }
        
        /* Skeletons */
        .rec-card-skeleton {
          display: flex;
          gap: 12px;
          padding: 8px;
        }
        .rec-skel-img {
          width: 60px;
          aspect-ratio: 2/3;
          border-radius: 4px;
        }
        .rec-skel-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          justify-content: center;
        }
        .rec-skel-line {
          height: 10px;
          border-radius: 2px;
        }
        .w-80 { width: 80%; }
        .w-40 { width: 40%; }
      `}</style>
    </div>
  );
}
