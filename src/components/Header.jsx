import React, { useState, useEffect, useRef } from 'react';
import { Search, Film, Heart, Home, Menu, X, Play, Share2, Download, Tv, Monitor, Languages, ChevronDown } from 'lucide-react';
import { TMDB_CONFIG, BANNED_KEYWORDS } from '../config/tmdb';
import { SOCIAL_LINKS } from '../config/social';

export default function Header({ currentView, setView, watchlist, onSearchSubmit, activeTheme }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
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
    
    // Check for banned keywords
    const queryLower = searchVal.toLowerCase();
    const isBanned = BANNED_KEYWORDS.some(word => queryLower.includes(word));
    if (isBanned) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `${TMDB_CONFIG.BASE_URL}/search/multi?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(searchVal)}`
        );
        const data = await res.json();
        
        // Filter out adult content and banned keywords
        const filtered = (data.results || [])
          .filter(item => {
            if (item.adult) return false;
            
            const isMovieOrTv = item.media_type === 'movie' || item.media_type === 'tv';
            const hasPoster = item.poster_path;
            if (!isMovieOrTv || !hasPoster) return false;
            
            const titleLower = (item.title || item.name || '').toLowerCase();
            const overviewLower = (item.overview || '').toLowerCase();
            const hasBanned = BANNED_KEYWORDS.some(word => 
              titleLower.includes(word) || overviewLower.includes(word)
            );
            
            return !hasBanned;
          })
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
    <>
      {/* Desktop fixed sidebar */}
      <aside className="desktop-sidebar">
        {/* Logo Section */}
        <div className="sidebar-logo" onClick={() => { setView('home'); setSearchVal(''); }}>
          <span className="sidebar-logo-text gradient-text">
            Loom Movies
          </span>
          {activeTheme === 'aug14' && <span className="special-badge">🇵🇰</span>}
          {activeTheme === 'aug15' && <span className="special-badge">🇮🇳</span>}
        </div>

        {/* Decorative Language Selector block */}
        <div className="sidebar-lang-selector">
          <Languages size={16} />
          <span>English (US)</span>
        </div>

        {/* Sidebar Nav links */}
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-link ${currentView === 'home' && !searchVal ? 'active' : ''}`}
            onClick={() => { setView('home'); setSearchVal(''); }}
          >
            <Home size={18} /> Home
          </button>
          <button 
            className={`sidebar-link ${searchVal === 'Marvel' ? 'active' : ''}`}
            onClick={() => navigateToCategory('Marvel')}
          >
            <Tv size={18} /> Marvel
          </button>
          <button 
            className={`sidebar-link ${searchVal === 'Anime' ? 'active' : ''}`}
            onClick={() => navigateToCategory('Anime')}
          >
            <Film size={18} /> Anime
          </button>
          <button 
            className={`sidebar-link ${searchVal === 'Kdrama' ? 'active' : ''}`}
            onClick={() => navigateToCategory('Kdrama')}
          >
            <Tv size={18} /> K-Drama
          </button>
          <button 
            className={`sidebar-link ${currentView === 'watchlist' ? 'active' : ''}`}
            onClick={() => setView('watchlist')}
          >
            <Heart size={18} /> Watchlist
            {watchlist.length > 0 && <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>{watchlist.length}</span>}
          </button>

          {/* Social Channels Dropdown inside sidebar */}
          <div ref={communityRef} style={{ position: 'relative' }}>
            <button 
              className={`sidebar-link ${showCommunityDropdown ? 'active' : ''}`}
              onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
              style={{ width: '100%' }}
            >
              <Share2 size={18} /> Channels
            </button>
            {showCommunityDropdown && (
              <div className="community-dropdown glass animate-fade-in" style={{ position: 'absolute', top: '100%', left: '0', right: '0', marginTop: '4px', zIndex: '100', background: 'rgba(15,15,22,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px' }}>
                <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', color: '#a0a0b0', textDecoration: 'none', fontSize: '0.85rem' }}>
                  <span className="dot whatsapp-dot" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#25d366' }}></span> WhatsApp Channel
                </a>
                <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', color: '#a0a0b0', textDecoration: 'none', fontSize: '0.85rem' }}>
                  <span className="dot facebook-dot" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#1877f2' }}></span> Facebook Group
                </a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', color: '#a0a0b0', textDecoration: 'none', fontSize: '0.85rem' }}>
                  <span className="dot instagram-dot" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#e1306c' }}></span> Instagram Profile
                </a>
              </div>
            )}
          </div>
        </nav>

        {/* Sidebar Get App card widgets */}
        <div className="sidebar-app-widget">
          <span className="widget-title">Get LoomMovies App</span>
          <div className="widget-card highlight" onClick={() => setShowAppModal(true)}>
            <div className="widget-card-icon">
              <Download size={16} />
            </div>
            <div className="widget-card-details">
              <span className="widget-card-title">Mobile APK</span>
              <span className="widget-card-sub">For Android & iOS</span>
            </div>
          </div>
          <div className="widget-card" onClick={() => setShowAppModal(true)}>
            <div className="widget-card-icon">
              <Monitor size={16} />
            </div>
            <div className="widget-card-details">
              <span className="widget-card-title">Windows EXE</span>
              <span className="widget-card-sub">For Windows PC</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Top header bar */}
      <header className="top-header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
        {/* Left Side: Logo + Channels Navigation */}
        <div className="mobile-only-header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Header Logo */}
          <div className="logo-section" onClick={() => { setView('home'); setSearchVal(''); }} style={{ cursor: 'pointer' }}>
            <span className="logo-text gradient-text" style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-secondary)', letterSpacing: '-0.02em' }}>Loom Movies</span>
            {activeTheme === 'aug14' && <span className="special-badge">🇵🇰</span>}
            {activeTheme === 'aug15' && <span className="special-badge">🇮🇳</span>}
          </div>

          {/* Header Channels Dropdown (Desktop Only) */}
          <div className="header-channels-wrapper desktop-only-btn" ref={communityRef} style={{ position: 'relative' }}>
            <button 
              className="header-channels-btn" 
              onClick={(e) => { e.stopPropagation(); setShowCommunityDropdown(!showCommunityDropdown); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '6px 14px',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: '0.2s',
                outline: 'none'
              }}
            >
              <Share2 size={12} className="share-icon" style={{ color: 'var(--color-primary)' }} />
              <span>Channels</span>
              <ChevronDown size={12} style={{ opacity: 0.7 }} />
            </button>

            {/* Community Dropdown floating directly below the button */}
            {showCommunityDropdown && (
              <div className="community-dropdown-menu glass animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '0', background: 'rgba(10,10,15,0.98)', border: '1px solid var(--color-border)', borderRadius: '12px', zIndex: '999', padding: '8px', width: '200px' }}>
                <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '0.82rem', transition: '0.2s' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#25d366' }}></span> WhatsApp Channel
                </a>
                <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '0.82rem', transition: '0.2s' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#1877f2' }}></span> Facebook Group
                </a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '0.82rem', transition: '0.2s' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#e1306c' }}></span> Instagram Profile
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar Container (Right aligned) */}
        <div className="search-wrapper" ref={searchRef} style={{ maxWidth: '320px', width: '100%', position: 'relative' }}>
          <form onSubmit={handleSearchSubmitLocal} className="search-form" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '4px 12px' }}>
            <input
              type="text"
              placeholder="Search movies, anime..."
              value={searchVal}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              className="search-input"
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.85rem', padding: '6px 8px', outline: 'none', width: '100%' }}
            />
            <button type="submit" className="search-btn" style={{ background: 'none', border: 'none', color: '#a0a0b0', cursor: 'pointer' }}>
              <Search size={16} />
            </button>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions glass animate-fade-in" style={{ position: 'absolute', top: '100%', left: '0', right: '0', background: 'rgba(10,10,15,0.98)', border: '1px solid var(--color-border)', borderRadius: '12px', marginTop: '8px', zIndex: '999', padding: '8px' }}>
              {suggestions.map((item) => (
                <div 
                  key={item.id} 
                  className="suggestion-item" 
                  onClick={() => handleSuggestionClick(item)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }}
                >
                  <img 
                    src={TMDB_CONFIG.posterUrl(item.poster_path)} 
                    alt={item.title || item.name} 
                    className="suggestion-poster"
                    style={{ width: '36px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div className="suggestion-details" style={{ flex: 1 }}>
                    <div className="suggestion-title" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{item.title || item.name}</div>
                    <div className="suggestion-meta" style={{ fontSize: '0.75rem', color: '#a0a0b0' }}>
                      <span className="suggestion-type">{item.media_type === 'movie' ? 'Movie' : 'TV Show'}</span>
                      {item.release_date && <span className="suggestion-year" style={{ marginLeft: '8px' }}>{item.release_date.split('-')[0]}</span>}
                      {item.first_air_date && <span className="suggestion-year" style={{ marginLeft: '8px' }}>{item.first_air_date.split('-')[0]}</span>}
                    </div>
                  </div>
                  <Play size={12} className="suggestion-play" style={{ color: 'var(--color-primary)' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Mobile bottom nav bar */}
      <nav className="mobile-bottom-nav">
        <button 
          className={`mobile-bottom-link ${currentView === 'home' && !searchVal ? 'active' : ''}`}
          onClick={() => { setView('home'); setSearchVal(''); }}
        >
          <Home size={20} />
          <span>Home</span>
        </button>
        
        <button 
          className={`mobile-bottom-link ${showCommunityDropdown ? 'active' : ''}`}
          onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
        >
          <Share2 size={20} />
          <span>Channels</span>
        </button>
        
        <button 
          className="mobile-bottom-link"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
              document.querySelector('.search-input')?.focus();
            }, 300);
          }}
        >
          <Search size={20} />
          <span>Search</span>
        </button>
        
        <button 
          className={`mobile-bottom-link ${currentView === 'watchlist' ? 'active' : ''}`}
          onClick={() => {
            setView('watchlist');
            setShowCommunityDropdown(false);
          }}
        >
          <Heart size={20} />
          <span>Watchlist</span>
        </button>
        
        <button 
          className="mobile-bottom-link"
          onClick={() => {
            setShowAppModal(true);
            setShowCommunityDropdown(false);
          }}
        >
          <Download size={20} />
          <span>Get App</span>
        </button>
      </nav>

      {/* Floating Channels Dropdown for Mobile Bottom Nav */}
      {showCommunityDropdown && (
        <div className="mobile-channels-floating-card glass animate-fade-in" style={{ position: 'fixed', bottom: '75px', left: '16px', right: '16px', background: 'rgba(10,10,15,0.98)', border: '1px solid var(--color-border)', borderRadius: '12px', zIndex: '999', padding: '12px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Community Networks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.88rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#25d366' }}></span> WhatsApp Channel
            </a>
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.88rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#1877f2' }}></span> Facebook Group
            </a>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.88rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#e1306c' }}></span> Instagram Profile
            </a>
          </div>
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
          padding: 24px 20px 30px;
          border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
          background: rgba(9, 9, 12, 0.99) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border: 1px solid var(--color-border);
          border-top: none;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.95);
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

        /* App Modal Styles */
        .app-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .app-modal {
          background: rgba(15, 15, 20, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius-lg);
          padding: 30px;
          max-width: 750px;
          width: 100%;
          position: relative;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
        }
        .close-modal-btn {
          position: absolute;
          top: 15px;
          right: 20px;
          background: none;
          border: none;
          color: var(--color-text-dim);
          font-size: 2.2rem;
          cursor: pointer;
          line-height: 1;
          transition: var(--transition-fast);
        }
        .close-modal-btn:hover {
          color: white;
        }
        .modal-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 8px;
          text-align: center;
        }
        .modal-subtitle {
          color: var(--color-text-muted);
          text-align: center;
          margin-bottom: 30px;
          font-size: 1rem;
        }
        .modal-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 650px) {
          .modal-options {
            grid-template-columns: 1fr;
          }
        }
        .modal-card {
          padding: 24px;
          border-radius: var(--border-radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: var(--transition-normal);
        }
        .modal-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.04);
        }
        .card-header-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }
        .modal-card h3 {
          font-size: 1.3rem;
          font-weight: bold;
          margin-bottom: 8px;
          color: white;
        }
        .modal-card p {
          color: var(--color-text-muted);
          font-size: 0.9rem;
          margin-bottom: 20px;
          line-height: 1.4;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 650px) {
          .modal-card p {
            height: auto;
          }
        }
        .download-btn {
          width: 100%;
          padding: 12px;
          border-radius: 25px;
          border: none;
          font-weight: bold;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          transition: var(--transition-normal);
        }
        .android-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .android-btn:hover {
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
          transform: scale(1.02);
        }
        .ios-btn {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
        }
        .ios-btn:hover {
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.5);
          transform: scale(1.02);
        }
        .ios-steps {
          text-align: left;
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: var(--border-radius-sm);
          font-size: 0.82rem;
          color: var(--color-text-dim);
          width: 100%;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          line-height: 1.3;
        }
        .app-meta {
          font-size: 0.75rem;
          color: var(--color-text-dim);
          margin-top: 10px;
        }
      `}</style>

      {showAppModal && (
        <div className="app-modal-overlay animate-fade-in" onClick={() => setShowAppModal(false)}>
          <div className="app-modal glass animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowAppModal(false)}>×</button>
            
            <h2 className="modal-title gradient-text">Download Loom Movies App</h2>
            <p className="modal-subtitle">Watch premium movies, anime, and dramas on any device without limits.</p>
            
            <div className="modal-options">
              {/* Android Section */}
              <div className="modal-card android-card glass">
                <div className="card-header-icon">🤖</div>
                <h3>Android Device</h3>
                <p>Download our official ad-free apk file directly to your Android device.</p>
                <a 
                  href="/LoomMovies.apk" 
                  download="LoomMovies.apk" 
                  className="download-btn android-btn"
                  onClick={() => {
                    alert("Download starting! Install the APK file on your device. You may need to enable 'Unknown Sources' installation in settings.");
                  }}
                >
                  <Download size={16} /> Download APK (v1.0.0)
                </a>
                <span className="app-meta">Size: ~5.4 MB | Android 6.0+</span>
              </div>
              
              {/* iOS Section */}
              <div className="modal-card ios-card glass">
                <div className="card-header-icon">🍎</div>
                <h3>iOS (iPhone / iPad)</h3>
                <p>Install Loom Movies instantly via Safari without needing the App Store.</p>
                <div className="ios-steps">
                  <div className="step">1. Open Safari browser and go to this website.</div>
                  <div className="step">2. Tap the <b>Share</b> icon at the bottom.</div>
                  <div className="step">3. Select <b>'Add to Home Screen'</b> from the menu.</div>
                </div>
                <button className="download-btn ios-btn" onClick={() => alert("iOS relies on Safari's Add to Home Screen (PWA). Follow the steps listed above to install!")}>
                  How to Install on iOS
                </button>
                <span className="app-meta">No jailbreak needed | All iOS versions</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
