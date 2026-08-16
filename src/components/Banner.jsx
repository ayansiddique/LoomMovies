import React, { useState, useEffect } from 'react';
import { Play, Heart, Star, Check } from 'lucide-react';
import { fetchMediaDetails, TMDB_CONFIG } from '../config/tmdb';

export default function Banner({ setView, watchlist, onWatchlistToggle }) {
  const [featured, setFeatured] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Dynamic banner movies will be fetched from TMDB and cached in localStorage
  useEffect(() => {
    let active = true;
    async function loadBannerMovies() {
      setLoading(true);
      try {
        const CACHE_KEY = 'loom_banner_movies_v5';
        const TIMESTAMP_KEY = 'loom_banner_timestamp';
        const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours cache duration (updates twice daily)
        
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(TIMESTAMP_KEY);
        
        if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime, 10) < CACHE_DURATION)) {
          try {
            const parsed = JSON.parse(cachedData);
            if (parsed && parsed.length > 0) {
              setFeatured(parsed);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('Error parsing cached banner movies, will refetch:', e);
          }
        }
        
        console.log('Fetching fresh trending and upcoming movies for the top banner...');
        
        // 1. Fetch Trending
        const trendingRes = await fetch(`${TMDB_CONFIG.BASE_URL}/trending/all/week?api_key=${TMDB_CONFIG.API_KEY}`);
        const trendingData = trendingRes.ok ? await trendingRes.json() : { results: [] };
        
        // 2. Fetch Upcoming
        const upcomingRes = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/upcoming?api_key=${TMDB_CONFIG.API_KEY}`);
        const upcomingData = upcomingRes.ok ? await upcomingRes.json() : { results: [] };
        
        // Filter out items missing backdrop or poster
        const trendingList = (trendingData.results || [])
          .filter(item => item.backdrop_path && item.poster_path)
          .map(item => ({ id: item.id, type: item.media_type || 'movie' }));
          
        const upcomingList = (upcomingData.results || [])
          .filter(item => item.backdrop_path && item.poster_path)
          .map(item => ({ id: item.id, type: 'movie' }));
          
        // Combine trending and upcoming items for a varied dynamic layout (up to 6 items)
        const mixedList = [
          { id: 1444466, type: 'movie' } // Awarapan 2 (Emraan Hashmi's new release featured at the top)
        ];
        let tIndex = 0;
        let uIndex = 0;
        
        while (mixedList.length < 6 && (tIndex < trendingList.length || uIndex < upcomingList.length)) {
          if (tIndex < trendingList.length) {
            const item = trendingList[tIndex++];
            if (!mixedList.some(m => m.id === item.id)) {
              mixedList.push(item);
            }
          }
          if (mixedList.length < 6 && uIndex < upcomingList.length) {
            const item = upcomingList[uIndex++];
            if (!mixedList.some(m => m.id === item.id)) {
              mixedList.push(item);
            }
          }
        }
        
        // Fallback to defaults if TMDB requests failed entirely or returned empty arrays
        if (mixedList.length === 0) {
          mixedList.push(
            { id: 299534, type: 'movie' }, // Avengers: Endgame
            { id: 635302, type: 'movie' }, // Demon Slayer: Mugen Train
            { id: 93405, type: 'tv' }      // Squid Game
          );
        }
        
        // Fetch detailed data for each selected item
        const promises = mixedList.map(item => fetchMediaDetails(item.id, item.type));
        const results = await Promise.all(promises);
        const validResults = results.filter(movie => movie !== null);
        
        if (active) {
          if (validResults.length > 0) {
            setFeatured(validResults);
            localStorage.setItem(CACHE_KEY, JSON.stringify(validResults));
            localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
          } else {
            // If details fetch failed, load static default blockbusters
            const fallbackList = [
              { id: 299534, type: 'movie' },
              { id: 635302, type: 'movie' },
              { id: 93405, type: 'tv' }
            ];
            const fallbackPromises = fallbackList.map(item => fetchMediaDetails(item.id, item.type));
            const fallbackResults = await Promise.all(fallbackPromises);
            setFeatured(fallbackResults.filter(m => m !== null));
          }
        }
      } catch (err) {
        console.error('Error loading banner movies:', err);
        // Load fallback defaults on overall error
        try {
          const fallbackList = [
            { id: 299534, type: 'movie' },
            { id: 635302, type: 'movie' },
            { id: 93405, type: 'tv' }
          ];
          const fallbackPromises = fallbackList.map(item => fetchMediaDetails(item.id, item.type));
          const fallbackResults = await Promise.all(fallbackPromises);
          if (active) setFeatured(fallbackResults.filter(m => m !== null));
        } catch (e) {
          console.error('Failed to load fallback movies:', e);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadBannerMovies();
    return () => { active = false; };
  }, []);

  // Automatic banner slide rotation
  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % featured.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featured]);

  if (loading) {
    return (
      <div className="banner-skeleton skeleton">
        <div className="banner-skeleton-inner">
          <div className="skeleton-line title-line skeleton"></div>
          <div className="skeleton-line desc-line skeleton"></div>
          <div className="skeleton-line btn-line skeleton"></div>
        </div>
        <style>{`
          .banner-skeleton {
            height: 70vh;
            width: 100%;
            display: flex;
            align-items: flex-end;
            padding: 0 4% 80px;
          }
          .banner-skeleton-inner {
            width: 50%;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .skeleton-line {
            height: 20px;
            border-radius: 4px;
            background: #27272a;
          }
          .title-line { height: 48px; width: 80%; }
          .desc-line { height: 80px; width: 100%; }
          .btn-line { height: 44px; width: 40%; }
        `}</style>
      </div>
    );
  }

  if (featured.length === 0) return null;

  const current = featured[activeIndex];
  const title = current.title || current.name;
  const rating = current.vote_average ? current.vote_average.toFixed(1) : 'N/A';
  const releaseYear = (current.release_date || current.first_air_date || '').split('-')[0];
  const isTV = current.media_type === 'tv';
  const genres = current.genres ? current.genres.slice(0, 3).map(g => g.name).join(' • ') : '';
  const inWatchlist = watchlist.some(w => w.id === current.id);

  return (
    <section className="hero-banner animate-fade-in">
      {/* Background Backdrop image */}
      <div className="banner-backdrop-container">
        <img 
          src={TMDB_CONFIG.backdropUrl(current.backdrop_path)} 
          alt={title} 
          className="banner-backdrop animate-fade-in"
          key={current.id} // forces image reload fade animation
        />
        <div className="banner-vignette-bottom"></div>
        <div className="banner-vignette-left"></div>
      </div>

      {/* Banner content details */}
      <div className="banner-content">
        <div className="banner-badge">
          <Star size={14} fill="currentColor" className="star-icon-banner" />
          <span>{rating} Rating</span>
          <span className="divider">|</span>
          <span>{releaseYear}</span>
          <span className="divider">|</span>
          <span className="type-badge">{isTV ? 'TV Series' : 'Blockbuster'}</span>
        </div>

        <h1 className="banner-title animate-fade-in-up" key={`t-${current.id}`}>{title}</h1>
        <p className="banner-genres">{genres}</p>
        <p className="banner-overview animate-fade-in-up" key={`o-${current.id}`}>{current.overview}</p>

        {/* Action Buttons */}
        <div className="banner-actions">
          <button 
            className="btn btn-primary banner-btn-play"
            onClick={() => setView('watch', current.id, current.media_type)}
          >
            <Play size={20} fill="currentColor" /> Watch Now
          </button>
          
          <button 
            className={`btn btn-secondary banner-btn-watchlist ${inWatchlist ? 'watchlist-added' : ''}`}
            onClick={() => onWatchlistToggle(current)}
          >
            {inWatchlist ? (
              <>
                <Check size={18} /> In Watchlist
              </>
            ) : (
              <>
                <Heart size={18} /> Add to Watchlist
              </>
            )}
          </button>
        </div>

        {/* Carousel Indicators */}
        <div className="banner-indicators">
          {featured.map((_, index) => (
            <span 
              key={index} 
              className={`indicator-dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
            ></span>
          ))}
        </div>
      </div>

      <style>{`
        .hero-banner {
          position: relative;
          height: 75vh;
          min-height: 550px;
          max-height: 800px;
          width: 100%;
          display: flex;
          align-items: flex-end;
          padding: 0 8% 80px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .banner-backdrop-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .banner-backdrop {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.02);
        }
        .banner-vignette-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(to top, var(--color-bg-deep) 0%, rgba(5, 5, 8, 0.8) 40%, transparent 100%);
        }
        .banner-vignette-left {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 50%;
          background: linear-gradient(to right, var(--color-bg-deep) 0%, rgba(5, 5, 8, 0.5) 50%, transparent 100%);
        }
        .banner-content {
          position: relative;
          z-index: 2;
          max-width: 650px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .banner-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }
        .star-icon-banner {
          color: var(--color-warning);
        }
        .divider {
          color: rgba(255, 255, 255, 0.15);
        }
        .type-badge {
          background: var(--color-primary-glow);
          color: #a78bfa;
          border: 1px solid var(--color-primary);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .banner-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          font-family: var(--font-secondary);
          text-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        .banner-genres {
          font-size: 0.9rem;
          color: var(--color-accent);
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .banner-overview {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--color-text-muted);
          text-shadow: 0 2px 5px rgba(0,0,0,0.5);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .banner-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 10px;
        }
        .banner-btn-play {
          padding: 12px 28px;
          font-size: 1rem;
        }
        .banner-btn-watchlist {
          padding: 12px 24px;
          font-size: 1rem;
        }
        .banner-btn-watchlist.watchlist-added {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-success);
          border-color: rgba(16, 185, 129, 0.4);
        }
        .banner-indicators {
          display: flex;
          gap: 8px;
          margin-top: 30px;
        }
        .indicator-dot {
          width: 24px;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .indicator-dot.active {
          background: var(--color-primary);
          width: 40px;
          box-shadow: 0 0 10px var(--color-primary);
        }
        
        @media (max-width: 768px) {
          .hero-banner {
            height: 60vh;
            padding: 0 5% 50px;
          }
          .banner-title {
            font-size: 2.2rem;
          }
          .banner-overview {
            font-size: 0.9rem;
            -webkit-line-clamp: 2;
          }
          .banner-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .banner-indicators {
            margin-top: 15px;
          }
        }
      `}</style>
    </section>
  );
}
