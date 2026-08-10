import React, { useState, useEffect } from 'react';
import { Play, Calendar, Clock } from 'lucide-react';
import { TMDB_CONFIG } from '../config/tmdb';

export default function EpisodeSelector({ tvId, seasons, activeEpisode, onEpisodeSelect }) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fallback if seasons list doesn't load or is empty
  const seasonsList = seasons && seasons.length > 0 
    ? seasons.filter(s => s.season_number > 0) // exclude specials (Season 0) usually
    : [{ season_number: 1, name: 'Season 1', episode_count: 12 }];

  useEffect(() => {
    async function loadEpisodes() {
      setLoading(true);
      try {
        const res = await fetch(
          `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/season/${selectedSeason}?api_key=${TMDB_CONFIG.API_KEY}`
        );
        const data = await res.json();
        setEpisodes(data.episodes || []);
      } catch (err) {
        console.error('Error fetching episodes:', err);
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    }
    loadEpisodes();
  }, [tvId, selectedSeason]);

  const getEpisodeStillUrl = (path) => {
    return path 
      ? `https://image.tmdb.org/t/p/w300${path}`
      : 'https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?q=80&w=300';
  };

  return (
    <div className="episode-selector-container glass">
      {/* Header & Season Dropdown */}
      <div className="selector-header">
        <h3 className="selector-title">Episodes Selector</h3>
        {seasonsList.length > 1 && (
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="season-dropdown glass"
          >
            {seasonsList.map(season => (
              <option key={season.id} value={season.season_number}>
                {season.name} ({season.episode_count} Episodes)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Episodes Grid */}
      <div className="episodes-list">
        {loading ? (
          // Shimmer episode skeletons
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="episode-card-skeleton">
              <div className="skeleton ep-skel-img"></div>
              <div className="ep-skel-body">
                <div className="skeleton ep-skel-line w-60"></div>
                <div className="skeleton ep-skel-line w-100"></div>
                <div className="skeleton ep-skel-line w-40"></div>
              </div>
            </div>
          ))
        ) : episodes.length === 0 ? (
          <p className="no-episodes">No episodes found for this season.</p>
        ) : (
          episodes.map(ep => {
            const isPlaying = activeEpisode.season === selectedSeason && activeEpisode.episode === ep.episode_number;
            return (
              <div 
                key={ep.id} 
                className={`episode-card ${isPlaying ? 'active-playing' : ''}`}
                onClick={() => onEpisodeSelect(selectedSeason, ep.episode_number)}
              >
                {/* Still Thumbnail */}
                <div className="episode-thumbnail">
                  <img src={getEpisodeStillUrl(ep.still_path)} alt={ep.name} className="ep-img" />
                  <div className="ep-overlay">
                    <Play size={16} fill="currentColor" className="ep-play-icon" />
                  </div>
                  <span className="ep-num-badge">EP {ep.episode_number}</span>
                </div>

                {/* Details */}
                <div className="episode-details">
                  <h4 className="episode-name">{ep.name}</h4>
                  <p className="episode-overview-text">{ep.overview || 'No description available.'}</p>
                  <div className="episode-meta">
                    {ep.runtime && (
                      <span className="ep-meta-item">
                        <Clock size={12} /> {ep.runtime} min
                      </span>
                    )}
                    {ep.air_date && (
                      <span className="ep-meta-item">
                        <Calendar size={12} /> {ep.air_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .episode-selector-container {
          padding: 24px;
          border-radius: var(--border-radius-md);
          margin-top: 30px;
        }
        .selector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .selector-title {
          font-family: var(--font-secondary);
          font-size: 1.2rem;
          font-weight: 700;
        }
        .season-dropdown {
          background: rgba(0,0,0,0.5);
          color: var(--color-text-main);
          border: 1px solid var(--color-border);
          padding: 8px 16px;
          border-radius: var(--border-radius-sm);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          outline: none;
        }
        .season-dropdown option {
          background: var(--color-bg-deep);
          color: var(--color-text-main);
        }
        .episodes-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 8px;
        }
        .no-episodes {
          text-align: center;
          color: var(--color-text-muted);
          padding: 30px 0;
        }
        .episode-card {
          display: flex;
          gap: 16px;
          padding: 12px;
          border-radius: var(--border-radius-sm);
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.03);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .episode-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--color-border-hover);
        }
        .episode-card.active-playing {
          background: var(--color-primary-glow);
          border-color: var(--color-primary);
        }
        .episode-thumbnail {
          position: relative;
          width: 140px;
          aspect-ratio: 16/9;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
          background: #18181b;
        }
        .ep-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition-smooth);
        }
        .episode-card:hover .ep-img {
          transform: scale(1.06);
        }
        .ep-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition-fast);
        }
        .episode-card:hover .ep-overlay {
          opacity: 1;
        }
        .ep-play-icon {
          color: white;
          filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));
        }
        .ep-num-badge {
          position: absolute;
          bottom: 6px;
          left: 6px;
          background: rgba(0,0,0,0.75);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 3px;
        }
        .episode-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }
        .episode-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-main);
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .episode-overview-text {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 6px;
        }
        .episode-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.75rem;
          color: var(--color-text-dim);
        }
        .ep-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        /* Episode Skeletons */
        .episode-card-skeleton {
          display: flex;
          gap: 16px;
          padding: 12px;
        }
        .ep-skel-img {
          width: 140px;
          aspect-ratio: 16/9;
          border-radius: 4px;
        }
        .ep-skel-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          justify-content: center;
        }
        .ep-skel-line {
          height: 12px;
          border-radius: 2px;
        }
        .w-60 { width: 60%; }
        .w-100 { width: 100%; }
        .w-40 { width: 40%; }

        @media (max-width: 600px) {
          .episode-card {
            flex-direction: column;
          }
          .episode-thumbnail {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
