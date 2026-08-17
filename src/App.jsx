import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Banner from './components/Banner';
import MovieRow from './components/MovieRow';
import MovieCard from './components/MovieCard';
import Watch from './views/Watch';
import PreLaunch from './views/PreLaunch';
import { CURATED_LISTS, TMDB_CONFIG, BANNED_KEYWORDS } from './config/tmdb';
import { Heart, Search, Play, RefreshCw, Film, Sparkles, AlertTriangle } from 'lucide-react';

export default function App() {
  const [view, setView] = useState(() => {
    const launchDate = new Date('2026-08-14T00:00:00').getTime();
    const now = Date.now();
    const hasLaunched = now >= launchDate;
    
    // Check bypass triggers (URL preview parameter or sessionStorage flag)
    const params = new URLSearchParams(window.location.search);
    const isPreview = sessionStorage.getItem('loom_launch_bypass') === 'true' || params.has('preview');
                      
    if (isPreview) {
      sessionStorage.setItem('loom_launch_bypass', 'true');
    }
    
    if (!hasLaunched && !isPreview) {
      return 'prelaunch';
    }

    const watchId = params.get('watch');
    if (watchId) {
      return 'watch';
    }
    const urlView = params.get('view');
    if (urlView === 'watchlist') {
      return 'watchlist';
    } else if (urlView === 'search') {
      return 'search';
    }
    return 'home';
  }); // 'prelaunch', 'home', 'watch', 'watchlist', 'search'
  console.log("DEBUG RENDER: App view=" + view);

  const [activeMediaId, setActiveMediaId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('watch') || null;
  });
  const [activeMediaType, setActiveMediaType] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('type') || 'movie';
  });
  const [activeTheme, setActiveTheme] = useState(''); // '', 'aug14', 'aug15'
  
  // User states
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'search' ? params.get('q') || '' : '';
  });
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
    const checkTheme = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const forcedTheme = urlParams.get('theme');
      
      let themeToApply = '';
      if (forcedTheme === 'aug14') {
        themeToApply = 'aug14';
      } else if (forcedTheme === 'aug15') {
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
  }, []);

  // Sync URL search parameters on load & PopState changes
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const watchId = params.get('watch');
      const mediaType = params.get('type') || 'movie';
      const urlView = params.get('view');
      const q = params.get('q');

      if (watchId) {
        setView('watch');
        setActiveMediaId(String(watchId));
        setActiveMediaType(mediaType);
      } else if (urlView === 'watchlist') {
        setView('watchlist');
      } else if (urlView === 'search') {
        setView('search');
        if (q) {
          setSearchQuery(q);
          handleSearchSubmit(q, false);
        } else {
          setSearchQuery('');
          setSearchResults([]);
        }
      } else {
        setView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initial run on mount for Search logic
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'search') {
      const q = params.get('q');
      if (q) {
        handleSearchSubmit(q, false);
      }
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update document title for non-watch views
  useEffect(() => {
    if (view === 'home') {
      document.title = 'Loom Movies - Stream Premium Marvel, Anime, & Kdrama';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Loom Movies - The ultimate premium streaming platform for Marvel blockbusters, popular Anime, and romantic Korean Dramas. Watch in multiple languages for free!');
      }
    } else if (view === 'watchlist') {
      document.title = 'My Watchlist - Loom Movies';
    } else if (view === 'search') {
      document.title = searchQuery ? `Search results for "${searchQuery}" - Loom Movies` : 'Search Movies & TV Shows - Loom Movies';
    }
  }, [view, searchQuery]);

  const setViewNavigate = (targetView, id = null, type = 'movie', searchQ = '') => {
    setView(targetView);
    
    let url = window.location.pathname;
    if (targetView === 'watch' && id) {
      setActiveMediaId(String(id));
      setActiveMediaType(type);
      url += `?watch=${id}&type=${type}`;
      window.scrollTo(0, 0);
    } else if (targetView === 'watchlist') {
      url += `?view=watchlist`;
      window.scrollTo(0, 0);
    } else if (targetView === 'search') {
      url += `?view=search${searchQ ? `&q=${encodeURIComponent(searchQ)}` : ''}`;
      window.scrollTo(0, 0);
    } else {
      url = window.location.pathname;
      window.scrollTo(0, 0);
    }
    
    window.history.pushState({ view: targetView, id, type, searchQ }, '', url);
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

  const handleSearchSubmit = async (query, shouldPushState = true) => {
    setView('search');
    setSearchLoading(true);

    if (shouldPushState) {
      let url = `${window.location.pathname}?view=search&q=${encodeURIComponent(query)}`;
      window.history.pushState({ view: 'search', query }, '', url);
    }

    const queryLower = query.toLowerCase().trim();
    
    const ADULT_BLOCK_KEYWORDS = [
      'beautiful girl', 'beautiful girls', 'cute figure', 'perfect figure', 'cute figer', 'perfect figer', 
      'figure', 'figer', 'body', 'boobies', 'boobs', 'boob', 'sexy', 'hot girl', 'hot girls', 'sensual', 
      'erotic', 'adult', 'xxx', 'porn', 'sex', 'nude', 'hentai', 'naked', 'fuck', 'erotik', 'fucking', 
      'fucking girl', 'fucking girls'
    ];
    
    const containsAdultTerm = ADULT_BLOCK_KEYWORDS.some(word => queryLower.includes(word));
    
    if (containsAdultTerm) {
      setSearchQuery(query);
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchQuery(query);

    try {
      // 1. Search locally in our custom Islamic list
      const localMatches = (CURATED_LISTS.islamic || []).filter(
        item => 
          (item.title && item.title.toLowerCase().includes(queryLower)) ||
          (item.overview && item.overview.toLowerCase().includes(queryLower))
      ).map(item => ({
        ...item,
        media_type: 'movie' // ensure it navigates to the movie custom player
      }));

      // Check if this is a language-based query (e.g. "hindi movies", "korean drama", etc.)
      let langCode = null;
      let discoverType = 'multi'; // 'movie', 'tv', 'multi'
      const cleanQuery = queryLower.trim().replace(/\s+/g, ' ');

      if (/^(hindi|hindi\s+movies?|hindi\s+films?)$/.test(cleanQuery)) {
        langCode = 'hi';
        discoverType = 'movie';
      } else if (/^(english|english\s+movies?|english\s+films?)$/.test(cleanQuery)) {
        langCode = 'en';
        discoverType = 'movie';
      } else if (/^(punjabi|punjabi\s+movies?|punjabi\s+films?)$/.test(cleanQuery)) {
        langCode = 'pa';
        discoverType = 'movie';
      } else if (/^(korean|korean\s+dramas?|kdramas?|korean\s+series)$/.test(cleanQuery)) {
        langCode = 'ko';
        discoverType = 'tv';
      } else if (/^(turkish|turkish\s+dramas?|turkish\s+series)$/.test(cleanQuery)) {
        langCode = 'tr';
        discoverType = 'tv';
      } else if (/^(chinese|chinese\s+dramas?|cdramas?)$/.test(cleanQuery)) {
        langCode = 'zh';
        discoverType = 'tv';
      } else if (/^(japanese|anime)$/.test(cleanQuery)) {
        langCode = 'ja';
        discoverType = 'multi';
      } else if (/^(urdu|urdu\s+movies?|urdu\s+films?)$/.test(cleanQuery)) {
        langCode = 'ur';
        discoverType = 'movie';
      }

      let filtered = [];
      if (langCode) {
        let fetchPromises = [];
        if (discoverType === 'movie' || discoverType === 'multi') {
          fetchPromises.push(
            fetch(
              `${TMDB_CONFIG.BASE_URL}/discover/movie?api_key=${TMDB_CONFIG.API_KEY}&with_original_language=${langCode}&sort_by=popularity.desc`
            )
              .then(res => res.json())
              .then(data => (data.results || []).map(item => ({ ...item, media_type: 'movie' })))
          );
        }
        if (discoverType === 'tv' || discoverType === 'multi') {
          fetchPromises.push(
            fetch(
              `${TMDB_CONFIG.BASE_URL}/discover/tv?api_key=${TMDB_CONFIG.API_KEY}&with_original_language=${langCode}&sort_by=popularity.desc`
            )
              .then(res => res.json())
              .then(data => (data.results || []).map(item => ({ ...item, media_type: 'tv' })))
          );
        }

        const responses = await Promise.all(fetchPromises);
        let combined = [];
        if (responses.length === 2) {
          const [movies, tvs] = responses;
          const maxLen = Math.max(movies.length, tvs.length);
          for (let i = 0; i < maxLen; i++) {
            if (movies[i]) combined.push(movies[i]);
            if (tvs[i]) combined.push(tvs[i]);
          }
        } else {
          combined = responses[0] || [];
        }

        filtered = combined.filter(item => {
          if (item.adult) return false;
          const hasImages = item.poster_path || item.backdrop_path;
          if (!hasImages) return false;

          const titleLower = (item.title || item.name || '').toLowerCase();
          const overviewLower = (item.overview || '').toLowerCase();
          const hasBannedKeyword = BANNED_KEYWORDS.some(word => 
            titleLower.includes(word) || overviewLower.includes(word)
          );
          return !hasBannedKeyword;
        });
      } else {
        // 2. Search on TMDB normally
        const res = await fetch(
          `${TMDB_CONFIG.BASE_URL}/search/multi?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        
        // Filter out actors/directors, adult content, and banned keywords in title/overview
        filtered = (data.results || []).filter(item => {
          if (item.adult) return false;
          
          const isMovieOrTv = item.media_type === 'movie' || item.media_type === 'tv';
          const hasImages = item.poster_path || item.backdrop_path;
          if (!isMovieOrTv || !hasImages) return false;
          
          const titleLower = (item.title || item.name || '').toLowerCase();
          const overviewLower = (item.overview || '').toLowerCase();
          const hasBannedKeyword = BANNED_KEYWORDS.some(word => 
            titleLower.includes(word) || overviewLower.includes(word)
          );
          
          return !hasBannedKeyword;
        });

        // --- SMART FALLBACK FOR MIXED / MISSPELLED / MULTI-TERM QUERIES ---
        // If we got very few results (less than 3), let's split the search terms and run a broader fallback query!
        const words = cleanQuery.split(' ').filter(w => w.length > 2 && !['and', 'the', 'for', 'with', 'from', 'this', 'that'].includes(w));
        
        if (filtered.length < 3 && words.length > 1) {
          // Run parallel fetches for each key term (up to 3 terms)
          const fallbackPromises = words.slice(0, 3).map(word => 
            fetch(
              `${TMDB_CONFIG.BASE_URL}/search/multi?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(word)}`
            )
              .then(res => res.json())
              .then(d => d.results || [])
              .catch(() => [])
          );
          
          const fallbackResultsArrays = await Promise.all(fallbackPromises);
          
          // Merge results, removing duplicates
          const seenIds = new Set(filtered.map(item => item.id));
          const fallbackMerged = [];
          
          // We will round-robin merge results from the different word searches for a balanced result set
          const maxLength = Math.max(...fallbackResultsArrays.map(arr => arr.length));
          for (let i = 0; i < maxLength; i++) {
            for (let j = 0; j < fallbackResultsArrays.length; j++) {
              const item = fallbackResultsArrays[j][i];
              if (item && (item.media_type === 'movie' || item.media_type === 'tv')) {
                if (!seenIds.has(item.id)) {
                  seenIds.add(item.id);
                  // Check banned keywords
                  const titleLower = (item.title || item.name || '').toLowerCase();
                  const overviewLower = (item.overview || '').toLowerCase();
                  const hasBanned = BANNED_KEYWORDS.some(w => titleLower.includes(w) || overviewLower.includes(w));
                  const hasImages = item.poster_path || item.backdrop_path;
                  
                  if (!hasBanned && hasImages && !item.adult) {
                    fallbackMerged.push(item);
                  }
                }
              }
            }
          }
          
          // Combine original matches with the fallback merged matches
          filtered = [...filtered, ...fallbackMerged].slice(0, 40); // Cap at 40 results
        }
      }

      // 3. Combine results (local custom matches first)
      setSearchResults([...localMatches, ...filtered]);
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
    <div className="app-layout">
      <div className="main-content-layout">
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

            {/* Category Filter Pills (Mobile Only Quick Navigation) */}
            <div className="mobile-categories-row">
              {[
                { name: 'Islamic', target: '#islamic' },
                { name: 'Marvel', target: '#marvel' },
                { name: 'Anime', target: '#anime' },
                { name: 'K-Drama', target: '#kdrama' },
                { name: 'Chinese', target: '#chinese' },
                { name: 'Turkish', target: '#turkish' },
                { name: 'Punjabi', target: '#punjabi' },
                { name: 'Hollywood', target: '#hollywood' }
              ].map(cat => (
                <button 
                  key={cat.name} 
                  className="mobile-category-pill"
                  onClick={() => {
                    const el = document.querySelector(cat.target);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>



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
    </div>
  );
}
