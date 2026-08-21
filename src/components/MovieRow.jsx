import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { fetchMediaDetailsLight } from '../config/tmdb';

export default function MovieRow({ title, itemsList, setView, watchlist, onWatchlistToggle }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const rowCardsRef = useRef(null);
  const rowRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setIsVisible(true);
      return;
    }
    if (!rowRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, {
      rootMargin: '200px', // start fetching data when the row is within 200px of viewport
    });
    observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let active = true;
    async function loadRowData() {
      setLoading(true);
      try {
        const promises = itemsList.map(item => fetchMediaDetailsLight(item.id, item.type));
        const results = await Promise.all(promises);
        if (active) {
          // Filter out failed loads
          setMovies(results.filter(movie => movie !== null));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadRowData();
    return () => { active = false; };
  }, [itemsList, isVisible]);

  const handleScroll = (direction) => {
    if (rowCardsRef.current) {
      const { scrollLeft, clientWidth } = rowCardsRef.current;
      const scrollToVal = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      rowCardsRef.current.scrollTo({
        left: scrollToVal,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="row-container animate-fade-in-up" ref={rowRef}>
      <h2 className="row-title">{title}</h2>
      
      <div className="row-scroll-wrapper">
        {/* Left Arrow */}
        <button 
          className="scroll-arrow left-arrow" 
          onClick={() => handleScroll('left')}
          aria-label="Scroll Left"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Card Row */}
        <div className="row-cards" ref={rowCardsRef}>
          {loading ? (
            // Shimmer skeletons
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="card-skeleton">
                <div className="skeleton skeleton-poster"></div>
                <div className="skeleton skeleton-text line-1"></div>
                <div className="skeleton skeleton-text line-2"></div>
              </div>
            ))
          ) : (
            movies.map(movie => (
              <MovieCard
                key={`${movie.media_type}-${movie.id}`}
                item={movie}
                onClick={() => setView('watch', movie.id, movie.media_type)}
                inWatchlist={watchlist.some(w => w.id === movie.id)}
                onWatchlistToggle={onWatchlistToggle}
              />
            ))
          )}
        </div>

        {/* Right Arrow */}
        <button 
          className="scroll-arrow right-arrow" 
          onClick={() => handleScroll('right')}
          aria-label="Scroll Right"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <style>{`
        .row-scroll-wrapper {
          position: relative;
          width: 100%;
        }
        .scroll-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(18, 18, 24, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
          opacity: 0;
          transition: var(--transition-smooth);
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
        .row-scroll-wrapper:hover .scroll-arrow {
          opacity: 1;
        }
        .scroll-arrow:hover {
          background: var(--color-primary);
          border-color: var(--color-primary);
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 0 15px var(--color-primary-glow);
        }
        .left-arrow {
          left: -22px;
        }
        .right-arrow {
          right: -22px;
        }
        
        /* Skeleton styling */
        .card-skeleton {
          flex: 0 0 200px;
          width: 200px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .skeleton-poster {
          width: 100%;
          aspect-ratio: 2/3;
          border-radius: var(--border-radius-md);
        }
        .skeleton-text {
          height: 16px;
          border-radius: 4px;
        }
        .skeleton-text.line-1 {
          width: 80%;
        }
        .skeleton-text.line-2 {
          width: 50%;
          height: 12px;
        }

        @media (max-width: 768px) {
          .scroll-arrow {
            display: none; /* Swipe gesture on mobile */
          }
          .card-skeleton {
            flex: 0 0 150px;
            width: 150px;
          }
        }
      `}</style>
    </div>
  );
}
