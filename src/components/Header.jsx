import React, { useState, useEffect, useRef } from 'react';
import { Search, Film, Heart, Home, Menu, X, Play, Share2 } from 'lucide-react';
import { TMDB_CONFIG } from '../config/tmdb';
import { SOCIAL_LINKS } from '../config/social';

export default function Header({ currentView, setView, watchlist, onSearchSubmit, activeTheme }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const communityRef = useRef(null);

  // Close search suggestions and dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (communityRef.current && !communityRef.current.contains(event.target)) {
        setShowCommunityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions from TMDB
  useEffect(() => {
    if (searchVal.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `${TMDB_CONFIG.BASE_URL}/search/multi?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(searchVal)}`
        );
        const data = await res.json();
        // filter only movies/tv that have backdrop/poster
        const filtered = (data.results || [])
          .filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
          .slice(0, 5);
        setSuggestions(filtered);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchVal]);

  const handleSearchChange = (e) => {
    setSearchVal(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearchSubmitLocal = (e) => {
    if (e) e.preventDefault();
    if (searchVal.trim()) {
      onSearchSubmit(searchVal);
      setShowSuggestions(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSuggestionClick = (item) => {
    setView('watch', item.id, item.media_type);
    setSearchVal('');
    setShowSuggestions(false);
    setIsMobileMenuOpen(false);
  };

  const navigateToCategory = (category) => {
    onSearchSubmit(category); // Reuse search system to filter/display categories
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header-nav glass-nav">
      <div className="header-container">
        {/* Brand Logo */}
        <div className="logo-section" onClick={() => { setView('home'); setSearchVal(''); }}>
          <span className="logo-text gradient-text">Loom Movies</span>
          {activeTheme === 'aug14' && (
            <span className="special-badge">🇵🇰 14 Aug Live</span>
          )}
          {activeTheme === 'aug15' && (
            <span className="special-badge">🇮🇳 15 Aug Live</span>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <button 
            className={`nav-link ${currentView === 'home' && !searchVal ? 'active' : ''}`}
            onClick={() => { setView('home'); setSearchVal(''); }}
          >
            <Home size={18} /> Home
          </button>
          <button 
            className="nav-link" 
            onClick={() => navigateToCategory('Marvel')}
          >
            Marvel
          </button>
          <button 
            className="nav-link" 
            onClick={() => navigateToCategory('Anime')}
          >
            Anime
          </button>
          <button 
            className="nav-link" 
            onClick={() => navigateToCategory('Kdrama')}
          >
            K-Drama
          </button>
          <button 
            className={`nav-link watchlist-btn ${currentView === 'watchlist' ? 'active' : ''}`}
            onClick={() => setView('watchlist')}
          >
            <Heart size={18} /> Watchlist
            {watchlist.length > 0 && <span className="watchlist-badge">{watchlist.length}</span>}
          </button>
          
          <div className="community-dropdown-wrapper" ref={communityRef}>
            <button 
              className={`nav-link community-btn ${showCommunityDropdown ? 'active' : ''}`}
              onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
            >
              <Share2 size={18} /> Channels
            </button>
            {showCommunityDropdown && (
              <div className="community-dropdown glass animate-fade-in">
                <div className="dropdown-section-title">Official Networks</div>
                <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="dropdown-item">
                  <span className="dot whatsapp-dot"></span> WhatsApp Channel
                </a>
                <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="dropdown-item">
                  <span className="dot facebook-dot"></span> Facebook Community
                </a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="dropdown-item">
                  <span className="dot instagram-dot"></span> Instagram Profile
                </a>
                <div className="dropdown-divider"></div>
                <div className="dropdown-section-title">Support & Info</div>
                <a href={SOCIAL_LINKS.company} target="_blank" rel="noopener noreferrer" className="dropdown-item">
                  <span className="dot company-dot"></span> Company Channel
                </a>
                <a href={SOCIAL_LINKS.official} target="_blank" rel="noopener noreferrer" className="dropdown-item">
                  <span className="dot official-dot"></span> Official News
                </a>
              </div>
            )}
          </div>
        </nav>

        {/* Search Bar */}
        <div className="search-wrapper" ref={searchRef}>
          <form onSubmit={handleSearchSubmitLocal} className="search-form">
            <input
              type="text"
              placeholder="Search movies, anime, dramas..."
              value={searchVal}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              className="search-input glass"
            />
            <button type="submit" className="search-btn">
              <Search size={18} />
            </button>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions glass animate-fade-in">
              {suggestions.map((item) => (
                <div 
                  key={item.id} 
                  className="suggestion-item" 
                  onClick={() => handleSuggestionClick(item)}
                >
                  <img 
                    src={TMDB_CONFIG.posterUrl(item.poster_path)} 
                    alt={item.title || item.name} 
                    className="suggestion-poster"
                  />
                  <div className="suggestion-details">
                    <div className="suggestion-title">{item.title || item.name}</div>
                    <div className="suggestion-meta">
                      <span className="suggestion-type">{item.media_type === 'movie' ? 'Movie' : 'TV Show'}</span>
                      {item.release_date && <span className="suggestion-year">{item.release_date.split('-')[0]}</span>}
                      {item.first_air_date && <span className="suggestion-year">{item.first_air_date.split('-')[0]}</span>}
                    </div>
                  </div>
                  <Play size={14} className="suggestion-play" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-dropdown glass animate-fade-in">
          <nav className="mobile-nav">
            {/* Mobile Search Input */}
            <form onSubmit={handleSearchSubmitLocal} className="mobile-search-form">
              <input
                type="text"
                placeholder="Search movies, anime, dramas..."
                value={searchVal}
                onChange={handleSearchChange}
                className="mobile-search-input glass"
              />
              <button type="submit" className="mobile-search-btn">
                <Search size={16} />
              </button>
            </form>
            
            <button 
              className={`mobile-nav-link ${currentView === 'home' && !searchVal ? 'active' : ''}`}
              onClick={() => { setView('home'); setSearchVal(''); setIsMobileMenuOpen(false); }}
            >
              <Home size={18} /> Home
            </button>
            <button className="mobile-nav-link" onClick={() => navigateToCategory('Marvel')}>
              Marvel Universe
            </button>
            <button className="mobile-nav-link" onClick={() => navigateToCategory('Anime')}>
              Anime World
            </button>
            <button className="mobile-nav-link" onClick={() => navigateToCategory('Kdrama')}>
              K-Drama Hits
            </button>
            <button 
              className={`mobile-nav-link watchlist-btn-mobile ${currentView === 'watchlist' ? 'active' : ''}`}
              onClick={() => { setView('watchlist'); setIsMobileMenuOpen(false); }}
            >
              <Heart size={18} /> Watchlist
              {watchlist.length > 0 && <span className="watchlist-badge">{watchlist.length}</span>}
            </button>

            <button 
              className={`mobile-nav-link community-btn-mobile ${showCommunityDropdown ? 'active' : ''}`}
              onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
            >
              <Share2 size={18} /> Channels & Info
            </button>
            {showCommunityDropdown && (
              <div className="mobile-community-sublist animate-fade-in">
                <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="mobile-sublink" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="dot whatsapp-dot"></span> WhatsApp Channel
                </a>
                <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="mobile-sublink" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="dot facebook-dot"></span> Facebook Group
                </a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="mobile-sublink" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="dot instagram-dot"></span> Instagram Profile
                </a>
                <a href={SOCIAL_LINKS.company} target="_blank" rel="noopener noreferrer" className="mobile-sublink" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="dot company-dot"></span> Company Channel
                </a>
                <a href={SOCIAL_LINKS.official} target="_blank" rel="noopener noreferrer" className="mobile-sublink" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="dot official-dot"></span> Official News
                </a>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Styling specific to header inside JS to keep index.css cleaner */}
      <style>{`
        .header-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 70px;
          z-index: 1000;
          display: flex;
          align-items: center;
          padding: 0 4%;
        }
        .header-container {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .logo-img {
          height: 38px;
          width: 38px;
          object-fit: cover;
          border-radius: 50%;
          filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.6));
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
          transition: transform 0.3s ease;
        }
        .logo-img:hover {
          transform: scale(1.1) rotate(5deg);
        }
        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          font-family: var(--font-secondary);
          letter-spacing: -0.03em;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .nav-link {
          background: none;
          border: none;
          color: var(--color-text-muted);
          font-family: var(--font-primary);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--color-text-main);
          text-shadow: 0 0 10px rgba(255,255,255,0.3);
        }
        .watchlist-btn {
          position: relative;
          padding-right: 12px;
        }
        .watchlist-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: linear-gradient(135deg, var(--color-secondary) 0%, #be185d 100%);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--color-bg-deep);
        }
        .search-wrapper {
          position: relative;
          width: 300px;
        }
        .search-form {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-input {
          width: 100%;
          padding: 8px 40px 8px 16px;
          border-radius: 20px;
          color: var(--color-text-main);
          font-size: 0.9rem;
          transition: var(--transition-fast);
          border: 1px solid var(--color-border);
          background: rgba(255, 255, 255, 0.05);
        }
        .search-input:focus {
          border-color: var(--color-primary);
          background: rgba(0, 0, 0, 0.6);
          box-shadow: 0 0 12px var(--color-primary-glow);
        }
        .search-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: var(--transition-fast);
        }
        .search-btn:hover {
          color: var(--color-primary);
        }
        .search-suggestions {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          right: 0;
          border-radius: var(--border-radius-md);
          overflow: hidden;
          z-index: 1100;
          padding: 8px 0;
        }
        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .suggestion-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .suggestion-poster {
          width: 32px;
          height: 48px;
          object-fit: cover;
          border-radius: 4px;
        }
        .suggestion-details {
          flex: 1;
          min-width: 0;
        }
        .suggestion-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .suggestion-meta {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          display: flex;
          gap: 8px;
          margin-top: 2px;
        }
        .suggestion-type {
          background: rgba(255, 255, 255, 0.1);
          padding: 1px 4px;
          border-radius: 2px;
          font-size: 0.65rem;
          text-transform: uppercase;
        }
        .suggestion-play {
          opacity: 0;
          color: var(--color-primary);
          transition: var(--transition-fast);
        }
        .suggestion-item:hover .suggestion-play {
          opacity: 1;
          transform: scale(1.2);
        }
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--color-text-main);
          cursor: pointer;
        }
        .mobile-dropdown {
          position: absolute;
          top: 70px;
          left: 0;
          right: 0;
          padding: 20px;
          border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
        }
        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .mobile-nav-link {
          background: none;
          border: none;
          color: var(--color-text-muted);
          font-family: var(--font-primary);
          font-size: 1.1rem;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        .mobile-nav-link:hover, .mobile-nav-link.active {
          color: var(--color-text-main);
        }
        .watchlist-btn-mobile {
          position: relative;
        }
        
        /* Community dropdown styles */
        .community-dropdown-wrapper {
          position: relative;
        }
        .community-dropdown {
          position: absolute;
          top: calc(100% + 15px);
          right: 0;
          width: 250px;
          border-radius: var(--border-radius-md);
          padding: 12px;
          z-index: 1100;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .dropdown-section-title {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-dim);
          font-weight: 700;
          padding: 4px 8px;
          text-align: left;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          font-size: 0.88rem;
          color: var(--color-text-muted);
          text-decoration: none;
          border-radius: var(--border-radius-sm);
          transition: var(--transition-fast);
        }
        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--color-text-main);
          padding-left: 16px;
        }
        .dropdown-divider {
          border-top: 1px solid var(--color-border);
          margin: 6px 0;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .whatsapp-dot { background: #25D366; box-shadow: 0 0 8px #25D366; }
        .facebook-dot { background: #1877F2; box-shadow: 0 0 8px #1877F2; }
        .instagram-dot { background: #cc2366; box-shadow: 0 0 8px #cc2366; }
        .company-dot { background: var(--color-accent); box-shadow: 0 0 8px var(--color-accent); }
        .official-dot { background: var(--color-primary); box-shadow: 0 0 8px var(--color-primary); }

        .mobile-community-sublist {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-left: 20px;
          margin-top: 4px;
          border-left: 1px solid var(--color-border);
          margin-left: 8px;
          width: 100%;
        }
        .mobile-sublink {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--color-text-muted);
          text-decoration: none;
          font-size: 0.95rem;
          padding: 6px 0;
        }

        @media (max-width: 900px) {
          .desktop-nav {
            display: none;
          }
          .mobile-menu-btn {
            display: block;
          }
          .search-wrapper {
            width: 200px;
          }
        }
        @media (max-width: 600px) {
          .search-wrapper {
            display: none; /* simple search hidden on super small screens, we can add it to toggle menu */
          }
        }

        /* Mobile Search Form Styles */
        .mobile-search-form {
          display: flex;
          align-items: center;
          width: 100%;
          margin-bottom: 20px;
          position: relative;
        }
        .mobile-search-input {
          width: 100%;
          padding: 10px 40px 10px 14px;
          border-radius: var(--border-radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 0.9rem;
          background: rgba(0, 0, 0, 0.2);
        }
        .mobile-search-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--color-text-dim);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </header>
  );
}
