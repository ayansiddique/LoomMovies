import React from 'react';
import { Play, Star, Plus, Check } from 'lucide-react';
import { TMDB_CONFIG } from '../config/tmdb';

export default function MovieCard({ item, onClick, inWatchlist, onWatchlistToggle }) {
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const title = item.title || item.name;
  const releaseYear = (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A';
  const type = item.media_type === 'tv' ? 'TV Show' : 'Movie';

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    onWatchlistToggle(item);
  };

  const getAudioBadge = () => {
    // Custom check based on item category or lists if available
    if (typeof item.id === 'string' && item.id.startsWith('youtube-')) {
      return 'Urdu/Hindi';
    }
    const lang = item.original_language;
    if (lang === 'ko') return 'Korean/Hindi';
    if (lang === 'ja') return 'Jap/Hindi';
    if (lang === 'zh' || lang === 'cn') return 'Chinese';
    if (lang === 'tr') return 'Turkish';
    if (lang === 'pa') return 'Punjabi';
    if (lang === 'hi') return 'Hindi';
    
    // Fallbacks based on common names or IDs
    const titleLower = (item.title || item.name || '').toLowerCase();
    if (titleLower.includes('punjabi') || titleLower.includes('jatta') || titleLower.includes('juliet') || item.id === 1083981 || item.id === 524311 || item.id === 208573 || item.id === 208643 || item.id === 157948 || item.id === 1266014) {
      return 'Punjabi';
    }
    if (titleLower.includes('jawan') || titleLower.includes('animal') || titleLower.includes('pathaan') || titleLower.includes('dangal') || titleLower.includes('shershaah') || titleLower.includes('kalki') || titleLower.includes('fighter') || titleLower.includes('tiger 3') || titleLower.includes('dunki') || titleLower.includes('salaar')) {
      return 'Hindi';
    }
    if (item.media_type === 'tv' || lang === 'en') {
      return 'Multi-Audio';
    }
    return 'English';
  };

  return (
    <div className="movie-card glass glow-purple animate-fade-in" onClick={onClick}>
      {/* Poster Image */}
      <div className="poster-wrapper">
        {/* Audio Language Badge (Top-right corner of poster) */}
        <div className="card-audio-badge">
          {getAudioBadge()}
        </div>
        <img 
          src={TMDB_CONFIG.posterUrl(item.poster_path)} 
          alt={title} 
          className="card-poster"
          loading="lazy"
        />
        
        {/* Play Overlay */}
        <div className="card-hover-overlay">
          <div className="play-circle">
            <Play size={20} fill="currentColor" />
          </div>
        </div>

        {/* Watchlist Quick Button */}
        <button 
          className={`card-watchlist-btn ${inWatchlist ? 'active' : ''}`}
          onClick={handleWatchlistClick}
          title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          {inWatchlist ? <Check size={16} /> : <Plus size={16} />}
        </button>

        {/* Rating Badge */}
        <div className="card-rating-badge">
          <Star size={12} fill="currentColor" className="star-icon" />
          <span>{rating}</span>
        </div>
      </div>

      {/* Info Details */}
      <div className="card-info">
        <span className="card-type-label">{type}</span>
        <h3 className="card-title" title={title}>{title}</h3>
        <div className="card-meta">
          <span>{releaseYear}</span>
          <span className="dot">•</span>
          <span>{item.original_language ? item.original_language.toUpperCase() : 'EN'}</span>
        </div>
      </div>

      <style>{`
        .movie-card {
          flex: 0 0 200px; /* fixed size in horizontal scrolls */
          width: 200px;
          border-radius: var(--border-radius-md);
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: var(--transition-smooth);
          background: var(--color-bg-card);
        }
        .movie-card:hover {
          transform: translateY(-8px) scale(1.03);
          border-color: var(--color-primary-glow);
        }
        .poster-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 2/3;
          overflow: hidden;
          background: #18181b;
        }
        .card-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition-smooth);
        }
        .movie-card:hover .card-poster {
          transform: scale(1.08);
        }
        .card-hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition-fast);
        }
        .movie-card:hover .card-hover-overlay {
          opacity: 1;
        }
        .play-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px var(--color-primary-glow);
          transform: scale(0.8);
          transition: var(--transition-smooth);
        }
        .movie-card:hover .play-circle {
          transform: scale(1);
        }
        .card-watchlist-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transform: translateY(-5px);
          transition: var(--transition-smooth);
          z-index: 10;
        }
        .movie-card:hover .card-watchlist-btn {
          opacity: 1;
          transform: translateY(0);
        }
        .card-watchlist-btn:hover {
          background: var(--color-primary);
          border-color: var(--color-primary);
          transform: scale(1.1);
        }
        .card-watchlist-btn.active {
          opacity: 1;
          transform: translateY(0);
          background: var(--color-success);
          border-color: var(--color-success);
        }
        .card-audio-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: var(--color-primary);
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 800;
          z-index: 5;
          text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          letter-spacing: 0.03em;
        }
        .card-rating-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(18, 18, 24, 0.85);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3px 8px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-warning);
          z-index: 5;
        }
        .star-icon {
          color: var(--color-warning);
        }
        .card-info {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex-grow: 1;
        }
        .card-type-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--color-accent);
          letter-spacing: 0.05em;
        }
        .card-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: var(--font-secondary);
        }
        .card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
        .dot {
          color: var(--color-text-dim);
        }
        
        @media (max-width: 768px) {
          .movie-card {
            flex: 0 0 150px;
            width: 150px;
          }
          .card-watchlist-btn {
            opacity: 1;
            transform: translateY(0);
          }
          .play-circle {
            width: 40px;
            height: 40px;
          }
          .play-circle svg {
            width: 16px;
            height: 16px;
          }
          .card-title {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
