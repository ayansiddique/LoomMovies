import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Banner from './components/Banner';
import MovieRow from './components/MovieRow';
import MovieCard from './components/MovieCard';
import Watch from './views/Watch';
import PreLaunch from './views/PreLaunch';
import { CURATED_LISTS, TMDB_CONFIG } from './config/tmdb';
import { Heart, Search, Play, RefreshCw, Film, Sparkles } from 'lucide-react';

export default function App() {
  const [view, setView] = useState(() => {
    const launchDate = new Date('2026-08-14T00:00:00').getTime();
    const now = Date.now();
    const hasLaunched = now >= launchDate;
    
    // Check bypass triggers (URL preview parameter or sessionStorage flag)
    const isPreview = sessionStorage.getItem('loom_launch_bypass') === 'true' ||
                      new URLSearchParams(window.location.search).has('preview');
                      
    if (isPreview) {
      sessionStorage.setItem('loom_launch_bypass', 'true');
      return 'home';
    }
    
    if (!hasLaunched) {
      return 'prelaunch';
    }
    return 'home';
  }); // 'prelaunch', 'home', 'watch', 'watchlist', 'search'
  const [activeMediaId, setActiveMediaId] = useState(null);
  const [activeMediaType, setActiveMediaType] = useState('movie');
  const [activeTheme, setActiveTheme] = useState(''); // '', 'aug14', 'aug15'
  
  // User states
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);

  // Load user data on mount
  useEffect(() => {
    // Load Watchlist
    const savedWatchlist = localStorage.getItem('loom_watchlist');
    if (savedWatchlist) {
      try { setWatchlist(JSON.parse(savedWatchlist)); } catch (e) { console.error(e); }
    }

    // Load History
    const savedHistory = localStorage.getItem('loom_watch_history');
    if (savedHistory) {
      try { setHistoryItems(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
  }, [view]); // reload watchlist/history states when shifting views

  // 14th August (PK) and 15th August (IN) theme logic
  useEffect(() => {
    const launchPKDate = new Date('2026-08-14T00:00:00').getTime();
    const launchINDate = new Date('2026-08-15T00:00:00').getTime();
    const endingINDate = new Date('2026-08-16T00:00:00').getTime();
    
    const checkTheme = () => {
      const now = Date.now();
      const isPKLive = now >= launchPKDate && now < launchINDate;
      const isINLive = now >= launchINDate && now < endingINDate;
      
      // Allow forced preview by adding theme=aug14 or theme=aug15 to the URL
      const urlParams = new URLSearchParams(window.location.search);
      const forcedTheme = urlParams.get('theme');
      
      let themeToApply = '';
      if (forcedTheme === 'aug14') {
        themeToApply = 'aug14';
      } else if (forcedTheme === 'aug15') {
        themeToApply = 'aug15';
      } else if (isPKLive) {
        themeToApply = 'aug14';
      } else if (isINLive) {
        themeToApply = 'aug15';
      }
      
      setActiveTheme(themeToApply);
      
      // Reset classes
      document.body.classList.remove('theme-aug14', 'theme-aug15');
      if (themeToApply) {
        document.body.classList.add(`theme-${themeToApply}`);
      }
    };
    
    checkTheme();
    const interval = setInterval(checkTheme, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const setViewNavigate = (targetView, id = null, type = 'movie') => {
    setView(targetView);
    if (targetView === 'watch') {
      setActiveMediaId(id);
      setActiveMediaType(type);
      window.scrollTo(0, 0);
    }
  };

  const handleWatchlistToggle = (item) => {
    let updated;
    const exists = watchlist.some(w => w.id === item.id);
    if (exists) {
      updated = watchlist.filter(w => w.id !== item.id);
    } else {
      updated = [item, ...watchlist];
    }
    setWatchlist(updated);
    localStorage.setItem('loom_watchlist', JSON.stringify(updated));
  };

  const handleSearchSubmit = async (query) => {
    setSearchQuery(query);
    setView('search');
    setSearchLoading(true);
    try {
      const res = await fetch(
        `${TMDB_CONFIG.BASE_URL}/search/multi?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      
      // Filter out actors/directors, only include movies/tv with poster/backdrop paths
      const filtered = (data.results || []).filter(
        item => (item.media_type === 'movie' || item.media_type === 'tv') && (item.poster_path || item.backdrop_path)
      );
      setSearchResults(filtered);
    } catch (e) {
      console.error('Search error:', e);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('loom_watch_history');
    setHistoryItems([]);
  };

  if (view === 'prelaunch') {
    return (
      <PreLaunch 
        onBypass={() => {
          sessionStorage.setItem('loom_launch_bypass', 'true');
          setView('home');
        }} 
      />
    );
  }

  return (
    <div className="app-container">
      {/* Premium Glass Header Navigation */}
      <Header 
        currentView={view} 
        setView={setViewNavigate} 
        watchlist={watchlist} 
        onSearchSubmit={handleSearchSubmit} 
        activeTheme={activeTheme}
      />

      <main className="main-content">
        
        {/* VIEW: HOME */}
        {view === 'home' && (
          <div className="view-home animate-fade-in">
            {/* Slide Banner Slider */}
            <Banner 
              setView={setViewNavigate} 
              watchlist={watchlist} 
              onWatchlistToggle={handleWatchlistToggle} 
            />



            {/* Continue Watching / Watch History (Dynamic LocalStorage) */}
            {historyItems.length > 0 && (
              <div className="row-container continue-watching-container animate-fade-in-up">
                <div className="row-header-history">
                  <h2 className="row-title">
                    <Sparkles size={18} className="history-icon" /> Continue Watching
                  </h2>
                  <button className="clear-history-btn" onClick={clearHistory}>Clear History</button>
                </div>
                <div className="row-cards">
                  {historyItems.map(item => (
                    <MovieCard
                      key={`history-${item.id}`}
                      item={item}
                      onClick={() => setViewNavigate('watch', item.id, item.media_type)}
                      inWatchlist={watchlist.some(w => w.id === item.id)}
                      onWatchlistToggle={handleWatchlistToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Category: Islamic Lectures */}
            <div id="islamic">
              <MovieRow 
                title="⭐ Islamic Lectures & Bayans" 
                itemsList={CURATED_LISTS.islamic} 
                setView={setViewNavigate}
                watchlist={watchlist}
                onWatchlistToggle={handleWatchlistToggle}
              />
            </div>

            {/* Category: Marvel Universe */}
            <div id="marvel">
              <MovieRow 
                title="Marvel Cinematic Universe" 
                itemsList={CURATED_LISTS.marvel} 
                setView={setViewNavigate}
                watchlist={watchlist}
                onWatchlistToggle={handleWatchlistToggle}
              />
            </div>

            {/* Category: Anime World */}
            <div id="anime">
              <MovieRow 
                title="Legendary Anime Collections" 
                itemsList={CURATED_LISTS.anime} 
                setView={setViewNavigate}
                watchlist={watchlist}
                onWatchlistToggle={handleWatchlistToggle}
              />
            </div>

            {/* Category: Kdrama Romances */}
            <div id="kdrama">
              <MovieRow 
                title="Trending Korean Dramas" 
                itemsList={CURATED_LISTS.kdrama} 
                setView={setViewNavigate}
                watchlist={watchlist}
                onWatchlistToggle={handleWatchlistToggle}
              />
            </div>

            {/* Category: Chinese Dramas */}
            <div id="chinese">
              <MovieRow 
                title="Sizzling Chinese & Asian Dramas" 
                itemsList={CURATED_LISTS.chinese} 
                setView={setViewNavigate}
                watchlist={watchlist}
                onWatchlistToggle={handleWatchlistToggle}
              />
            </div>

            {/* Category: Turkish Series */}
            <div id="turkish">
              <MovieRow 
                title="Famous Turkish Series Hits" 
                itemsList={CURATED_LISTS.turkish} 
                setView={setViewNavigate}
                watchlist={watchlist}
                onWatchlistToggle={handleWatchlistToggle}
              />
            </div>

            {/* Category: Bollywood & Punjabi Hits */}
            <div id="punjabi">
              <MovieRow 
                title="Bollywood & Punjabi Hits" 
                itemsList={CURATED_LISTS.punjabi} 
                setView={setViewNavigate}
                watchlist={watchlist}
                onWatchlistToggle={handleWatchlistToggle}
              />
            </div>

            {/* Category: Hollywood Blockbusters */}
            <div id="hollywood">
              <MovieRow 
                title="Hollywood Blockbusters" 
                itemsList={CURATED_LISTS.hollywood} 
                setView={setViewNavigate}
                watchlist={watchlist}
                onWatchlistToggle={handleWatchlistToggle}
              />
            </div>
          </div>
        )}

        {/* VIEW: WATCH (YouTube-style watch layout) */}
        {view === 'watch' && activeMediaId && (
          <Watch 
            mediaId={activeMediaId} 
            mediaType={activeMediaType} 
            setView={setViewNavigate} 
          />
        )}

        {/* VIEW: WATCHLIST */}
        {view === 'watchlist' && (
          <div className="view-watchlist page-padding animate-fade-in">
            <h1 className="page-title">
              <Heart size={28} fill="currentColor" className="heart-title-icon" /> My Watchlist
            </h1>
            
            {watchlist.length === 0 ? (
              <div className="empty-watchlist glass">
                <Film size={48} className="empty-icon" />
                <h2>Your Watchlist is Empty</h2>
                <p>Explore our home catalog, search for Marvel blockbusters, Anime, or dramas, and save them here.</p>
                <button className="btn btn-primary" onClick={() => setView('home')}>Explore Catalog</button>
              </div>
            ) : (
              <div className="watchlist-grid">
                {watchlist.map(movie => (
                  <MovieCard
                    key={`watchlist-${movie.id}`}
                    item={movie}
                    onClick={() => setViewNavigate('watch', movie.id, movie.media_type || (movie.title ? 'movie' : 'tv'))}
                    inWatchlist={true}
                    onWatchlistToggle={handleWatchlistToggle}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: SEARCH RESULTS */}
        {view === 'search' && (
          <div className="view-search page-padding animate-fade-in">
            <h1 className="page-title">
              <Search size={28} className="search-title-icon" /> Search Results for: <span className="query-highlight">"{searchQuery}"</span>
            </h1>

            {searchLoading ? (
              <div className="search-loading">
                <RefreshCw size={36} className="spinner" />
                <p>Scanning TMDB database...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="empty-search glass">
                <AlertTriangle size={48} className="empty-icon" />
                <h2>No Results Found</h2>
                <p>We couldn't find any movies or TV shows matching "{searchQuery}". Try searching for something else like "Avengers", "Demon Slayer", or "Squid Game".</p>
              </div>
            ) : (
              <div className="watchlist-grid">
                {searchResults.map(movie => (
                  <MovieCard
                    key={`search-${movie.id}`}
                    item={movie}
                    onClick={() => setViewNavigate('watch', movie.id, movie.media_type)}
                    inWatchlist={watchlist.some(w => w.id === movie.id)}
                    onWatchlistToggle={handleWatchlistToggle}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      <style>{`
        .page-padding {
          padding: 30px 6% 60px;
        }
        .page-title {
          font-family: var(--font-secondary);
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 12px;
          letter-spacing: -0.02em;
        }
        .heart-title-icon {
          color: var(--color-secondary);
        }
        .search-title-icon {
          color: var(--color-primary);
        }
        .query-highlight {
          color: var(--color-accent);
        }
        .watchlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 30px;
        }
        
        /* Empty states */
        .empty-watchlist, .empty-search {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 40px;
          border-radius: var(--border-radius-lg);
          max-width: 600px;
          margin: 40px auto;
          gap: 16px;
        }
        .empty-icon {
          color: var(--color-text-dim);
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .empty-watchlist h2, .empty-search h2 {
          font-family: var(--font-secondary);
          font-size: 1.4rem;
          font-weight: 700;
        }
        .empty-watchlist p, .empty-search p {
          font-size: 0.95rem;
          color: var(--color-text-muted);
          line-height: 1.6;
        }
        
        /* Search loading */
        .search-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 0;
          gap: 16px;
          color: var(--color-text-muted);
        }
        .spinner {
          animation: spin 1s linear infinite;
          color: var(--color-primary);
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        /* History details styling */
        .row-header-history {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .history-icon {
          color: var(--color-accent);
        }
        .clear-history-btn {
          background: none;
          border: none;
          color: var(--color-text-dim);
          font-size: 0.8rem;
          cursor: pointer;
          font-weight: 600;
          text-transform: uppercase;
          transition: var(--transition-fast);
        }
        .clear-history-btn:hover {
          color: var(--color-error);
        }
        .continue-watching-container {
          background: linear-gradient(180deg, rgba(6, 182, 212, 0.03) 0%, transparent 100%);
          border-radius: var(--border-radius-lg);
          padding: 20px 4% !important;
          border: 1px solid rgba(6, 182, 212, 0.05);
        }
        
        @media (max-width: 768px) {
          .watchlist-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 16px;
          }
          .page-title {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
}
