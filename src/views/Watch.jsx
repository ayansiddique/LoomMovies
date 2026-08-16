import React, { useState, useEffect } from 'react';
import { Play, Star, Calendar, Clock, RefreshCw, AlertTriangle, Monitor, Tv, Sparkles, ChevronDown, FileText } from 'lucide-react';
import { fetchMediaDetails, TMDB_CONFIG, BANNED_KEYWORDS } from '../config/tmdb';
import SidebarRecommendations from '../components/SidebarRecommendations';
import EpisodeSelector from '../components/EpisodeSelector';
import CommentsSection from '../components/CommentsSection';
import CustomPlayer from '../components/CustomPlayer';

const SERVERS = [
  {
    id: 'vidlink-pro',
    name: 'Server 1 (VidLink - Clean)',
    movie: (id) => `https://vidlink.pro/movie/${id}?primaryColor=06b6d4&secondaryColor=0891b2&icons=vid`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=06b6d4&secondaryColor=0891b2&icons=vid`
  },
  {
    id: 'vidsrc-me',
    name: 'Server 2 (VidSrc.me)',
    movie: (id) => `https://vidsrc.me/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.me/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'embed-su',
    name: 'Server 3 (Embed.su)',
    movie: (id) => `https://embed.su/embed/movie/${id}`,
    tv: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrc-xyz',
    name: 'Server 4 (VidSrc.xyz)',
    movie: (id) => `https://vidsrc.xyz/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrc-cc',
    name: 'Server 5 (VidSrc.cc)',
    movie: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrc-to',
    name: 'Server 6 (VidSrc.to)',
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'autoembed',
    name: 'Server 7 (MultiEmbed)',
    movie: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
  },
  {
    id: 'vidsrc-pm',
    name: 'Server 8 (VidSrc.pm)',
    movie: (id) => `https://vidsrc.pm/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'desidub',
    name: 'Server 9 (Hindi Dubbed Anime)',
    movie: () => '',
    tv: () => ''
  }
];

export default function Watch({ mediaId: rawMediaId, mediaType, setView }) {
  const mediaId = String(rawMediaId);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  
  // Track active episode if TV show (defaults to Season 1, Episode 1)
  const [activeEpisode, setActiveEpisode] = useState({ season: 1, episode: 1 });
  const [showServers, setShowServers] = useState(false);

  // Smart AI Regional Routing & Fallback States
  const [isSmartRouting, setIsSmartRouting] = useState(() => {
    return localStorage.getItem('loom_smart_routing') !== 'false';
  });
  const [isSouthAsian, setIsSouthAsian] = useState(false);
  const [fallbackCountdown, setFallbackCountdown] = useState(null);

  // Server Reporting, Fallback Timer and Extension UI States
  const [reportedServers, setReportedServers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('loom_reported_servers') || '{}');
    } catch (e) {
      return {};
    }
  });
  const [showFallbackHint, setShowFallbackHint] = useState(false);
  const [showExtensionSteps, setShowExtensionSteps] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Direct HLS/MP4 Stream States
  const [directStreamUrl, setDirectStreamUrl] = useState(null);
  const [isFetchingDirect, setIsFetchingDirect] = useState(false);
  const [useCustomPlayer, setUseCustomPlayer] = useState(false);
  const [hindiEmbedUrl, setHindiEmbedUrl] = useState(null);
  const [isFetchingHindi, setIsFetchingHindi] = useState(false);
  const [hindiError, setHindiError] = useState(null);
  const [hindiSources, setHindiSources] = useState([]);
  const [activeHindiSourceIdx, setActiveHindiSourceIdx] = useState(0);

  const currentMediaKey = mediaType === 'tv'
    ? `tv-${mediaId}-${activeEpisode.season}-${activeEpisode.episode}`
    : `movie-${mediaId}`;

  const isServerReported = (idx) => {
    const list = reportedServers[currentMediaKey] || [];
    return list.includes(idx);
  };

  const handleReportServer = () => {
    const list = reportedServers[currentMediaKey] || [];
    if (!list.includes(activeServerIndex)) {
      const updatedList = [...list, activeServerIndex];
      const updatedData = { ...reportedServers, [currentMediaKey]: updatedList };
      setReportedServers(updatedData);
      localStorage.setItem('loom_reported_servers', JSON.stringify(updatedData));
    }
  };

  // GeoIP regional preference checker
  useEffect(() => {
    if (!isSmartRouting) return;
    
    // Quick local locale check
    const isLocalHiUr = navigator.languages
      ? navigator.languages.some(lang => /hi|ur|pa/i.test(lang))
      : /hi|ur|pa/i.test(navigator.language || '');
      
    if (isLocalHiUr) {
      setIsSouthAsian(true);
    }
    
    // Remote GeoIP country check
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country) {
          const saCountries = ['PK', 'IN', 'BD', 'NP', 'LK'];
          if (saCountries.includes(data.country)) {
            setIsSouthAsian(true);
          }
        }
      })
      .catch(err => console.log('PWA GeoIP detection skipped:', err));
  }, [isSmartRouting]);

  // Auto-Fallback Alert Trigger
  useEffect(() => {
    setShowFallbackHint(false);
    if (isPlayingTrailer) return;

    const timer = setTimeout(() => {
      setShowFallbackHint(true);
    }, 6000); // Trigger loader fallback suggestion after 6 seconds

    return () => clearTimeout(timer);
  }, [mediaId, activeServerIndex, activeEpisode, isPlayingTrailer]);

  // Fallback countdown controller effect
  useEffect(() => {
    if (!isSmartRouting || !showFallbackHint || isPlayingTrailer || SERVERS[activeServerIndex]?.id === 'desidub') {
      setFallbackCountdown(null);
      return;
    }
    
    setFallbackCountdown(5); // start a 5-second auto-fallback countdown
  }, [showFallbackHint, isSmartRouting, activeServerIndex, isPlayingTrailer]);

  useEffect(() => {
    if (fallbackCountdown === null) return;
    
    if (fallbackCountdown === 0) {
      // Find next server index (wrap around, skipping desidub since desidub is anime-only)
      let nextIdx = (activeServerIndex + 1) % SERVERS.length;
      if (SERVERS[nextIdx].id === 'desidub') {
        nextIdx = (nextIdx + 1) % SERVERS.length;
      }
      setActiveServerIndex(nextIdx);
      setFallbackCountdown(null);
      return;
    }
    
    const timer = setTimeout(() => {
      setFallbackCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [fallbackCountdown]);

  useEffect(() => {
    let active = true;
    async function loadDetails() {
      setLoading(true);
      try {
        const data = await fetchMediaDetails(mediaId, mediaType);
        
        // Content protection guard
        if (data) {
          const titleLower = (data.title || data.name || '').toLowerCase();
          const overviewLower = (data.overview || '').toLowerCase();
          const isAdult = data.adult === true;
          const hasBanned = BANNED_KEYWORDS.some(word => 
            titleLower.includes(word) || overviewLower.includes(word)
          );
          
          if (isAdult || hasBanned) {
            if (active) {
              setDetails(null); // This will show the watch-error component
              setLoading(false);
            }
            return;
          }
        }

        if (active) {
          setDetails(data);
          setIsPlayingTrailer(false); // default to main streaming player
          setActiveEpisode({ season: 1, episode: 1 }); // reset episodes
          
          // Save to continue watching / watch history in localStorage
          saveToHistory(data);

          // Smart AI Regional Routing: Auto-default to Server 9 (desidub) for Anime in South Asia
          if (isSmartRouting) {
            const isLocalAnime = data && (
              data.original_language === 'ja' ||
              data.genres?.some(g => g.name === 'Animation' || g.id === 16)
            );
            const isLocalHiUr = navigator.languages
              ? navigator.languages.some(lang => /hi|ur|pa/i.test(lang))
              : /hi|ur|pa/i.test(navigator.language || '');

            if (isLocalAnime && (isSouthAsian || isLocalHiUr)) {
              const desidubIdx = SERVERS.findIndex(s => s.id === 'desidub');
              if (desidubIdx !== -1) {
                setActiveServerIndex(desidubIdx);
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDetails();
    return () => { active = false; };
  }, [mediaId, mediaType, isSouthAsian, isSmartRouting]);

  // Fetch direct streaming URL from Consumet API
  useEffect(() => {
    let active = true;
    async function loadDirectStream() {
      if (typeof mediaId === 'string' && mediaId.startsWith('youtube-')) {
        setDirectStreamUrl(null);
        setUseCustomPlayer(false);
        setIsFetchingDirect(false);
        return;
      }
      setDirectStreamUrl(null);
      setUseCustomPlayer(false);
      setIsFetchingDirect(true);
      
      try {
        const CONSUMET_API_URL = 'https://consumet-api-clone.vercel.app';
        let url = '';
        
        if (mediaType === 'movie') {
          url = `${CONSUMET_API_URL}/meta/tmdb/watch/${mediaId}?id=${mediaId}`;
        } else {
          // For TV Shows, fetch show info to get the episodeId mapping
          const infoRes = await fetch(`${CONSUMET_API_URL}/meta/tmdb/info/${mediaId}?type=tv`);
          const infoData = await infoRes.json();
          
          // Find active episode ID
          const seasonData = infoData.seasons?.find(s => s.season === activeEpisode.season);
          const epData = seasonData?.episodes?.find(e => e.episode === activeEpisode.episode);
          
          if (epData?.id) {
            url = `${CONSUMET_API_URL}/meta/tmdb/watch/${encodeURIComponent(epData.id)}?id=${mediaId}`;
          }
        }
        
        if (url && active) {
          const res = await fetch(url);
          const data = await res.json();
          const source = data.sources?.find(s => s.quality === 'auto' || s.quality === '1080p') || data.sources?.[0];
          
          if (source?.url && active) {
            setDirectStreamUrl(source.url);
            setUseCustomPlayer(true); // Auto-enable the ad-free player!
          }
        }
      } catch (err) {
        console.error("Direct stream fetch error:", err);
      } finally {
        if (active) setIsFetchingDirect(false);
      }
    }

    if (!isPlayingTrailer) {
      loadDirectStream();
    }
    
    return () => { active = false; };
  }, [mediaId, mediaType, activeEpisode, isPlayingTrailer]);

  // Fetch Hindi dubbed stream from our internal api
  useEffect(() => {
    if (typeof mediaId === 'string' && mediaId.startsWith('youtube-')) {
      setHindiEmbedUrl(null);
      setHindiSources([]);
      return;
    }
    if (SERVERS[activeServerIndex]?.id !== 'desidub') {
      setHindiEmbedUrl(null);
      setHindiSources([]);
      return;
    }
    
    let active = true;
    async function loadHindiStream() {
      setIsFetchingHindi(true);
      setHindiError(null);
      setHindiEmbedUrl(null);
      setDirectStreamUrl(null);
      setUseCustomPlayer(false);
      setHindiSources([]);
      setActiveHindiSourceIdx(0);
      
      try {
        const queryTitle = details?.name || details?.title || '';
        if (!queryTitle) return;
        
        // Step 1: Search for the anime on DesiDub
        const searchRes = await fetch(`/api/get-hindi-stream?action=search&q=${encodeURIComponent(queryTitle)}`);
        const searchData = await searchRes.json();
        
        // Smarter matching logic to select the correct Season slug
        let bestMatch = null;
        if (searchData?.results && searchData.results.length > 0) {
          const results = searchData.results;
          const currentSeason = activeEpisode.season;
          
          const getOrdinal = (num) => {
            if (num === 1) return "1st";
            if (num === 2) return "2nd";
            if (num === 3) return "3rd";
            return `${num}th`;
          };

          const ordinal = getOrdinal(currentSeason);
          const seasonStr = `Season ${currentSeason}`;
          const sStr = `S${currentSeason}`;

          // Priority 1: Match the specific season keywords
          bestMatch = results.find(res => {
            const t = res.title.toLowerCase();
            return t.includes(ordinal.toLowerCase()) || 
                   t.includes(seasonStr.toLowerCase()) || 
                   t.includes(sStr.toLowerCase());
          });

          // Priority 2: If we are looking for Season 1, look for the title that doesn't mention other seasons
          if (!bestMatch && currentSeason === 1) {
            const otherSeasonWords = ["2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "final season", "season 2", "season 3", "season 4", "season 5", "season 6", "season 7", "season 8"];
            bestMatch = results.find(res => {
              const t = res.title.toLowerCase();
              return !otherSeasonWords.some(word => t.includes(word));
            });
          }

          // Fallback to the first search result if no specific season matched
          if (!bestMatch) {
            bestMatch = results[0];
          }
        }

        if (!bestMatch?.slug) {
          throw new Error("Anime not found in Hindi dub database.");
        }
        
        // Step 2: Fetch episodes list
        const infoRes = await fetch(`/api/get-hindi-stream?action=info&id=${bestMatch.slug}`);
        const infoData = await infoRes.json();
        
        if (!infoData.episodes || infoData.episodes.length === 0) {
          throw new Error("No episodes found for this Hindi dub anime.");
        }
        
        // Step 3: Find active episode number
        const currentEpNum = mediaType === 'tv' ? activeEpisode.episode : 1;
        
        // Find closest episode match
        let matchedEp = infoData.episodes.find(ep => ep.number === currentEpNum);
        
        // Dynamic fallback: if the requested episode is not in the parsed list, 
        // but the main anime ID (slug) is found, dynamically build it!
        if (!matchedEp && infoData.id) {
          matchedEp = {
            id: `${infoData.id}-episode-${currentEpNum}`,
            number: currentEpNum,
            title: `Episode ${currentEpNum}`,
            url: `https://www.desidubanime.me/watch/${infoData.id}-episode-${currentEpNum}/`
          };
        }
        
        // Ultimate fallback to first parsed episode if dynamic generation fails
        if (!matchedEp) {
          matchedEp = infoData.episodes[0];
        }
        
        if (!matchedEp?.id) {
          throw new Error(`Episode ${currentEpNum} not found in Hindi.`);
        }
        
        // Step 4: Get watch streams
        const watchRes = await fetch(`/api/get-hindi-stream?action=watch&id=${matchedEp.id}`);
        const watchData = await watchRes.json();
        
        const sources = watchData?.sources || [];
        if (sources.length === 0) {
          throw new Error("No video streams found for this episode.");
        }
        
        if (active) {
          setHindiSources(sources);
          // Auto select direct HLS source if available, otherwise first embed
          const hlsIdx = sources.findIndex(s => s.isM3U8 === true || s.url.includes('.m3u8'));
          setActiveHindiSourceIdx(hlsIdx !== -1 ? hlsIdx : 0);
        }
      } catch (err) {
        console.error("Hindi stream error:", err);
        if (active) {
          setHindiError(err.message || "Failed to load Hindi stream.");
        }
      } finally {
        if (active) setIsFetchingHindi(false);
      }
    }
    
    if (details) {
      loadHindiStream();
    }
    
    return () => { active = false; };
  }, [activeServerIndex, activeEpisode, mediaId, details]);

  // Handle active Hindi source changes
  useEffect(() => {
    if (SERVERS[activeServerIndex]?.id !== 'desidub') return;
    
    if (hindiSources.length > 0 && hindiSources[activeHindiSourceIdx]) {
      const source = hindiSources[activeHindiSourceIdx];
      const isM3U8 = source.isM3U8 || source.url.includes('.m3u8');
      
      if (isM3U8) {
        setDirectStreamUrl(source.url);
        setUseCustomPlayer(true);
        setHindiEmbedUrl(null);
      } else {
        setDirectStreamUrl(null);
        setUseCustomPlayer(false);
        
        // Parse relative protocol URLs
        let finalUrl = source.url;
        if (finalUrl.startsWith('//')) {
          finalUrl = 'https:' + finalUrl;
        }
        setHindiEmbedUrl(finalUrl);
      }
    }
  }, [activeHindiSourceIdx, hindiSources, activeServerIndex]);

  const saveToHistory = (item) => {
    if (!item) return;
    const historyKey = 'loom_watch_history';
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    } catch (e) {
      history = [];
    }
    // Remove if already exists
    history = history.filter(h => h.id !== item.id);
    // Add to top of list
    const historyItem = {
      id: item.id,
      media_type: mediaType,
      title: item.title || item.name,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      vote_average: item.vote_average,
      timestamp: Date.now()
    };
    localStorage.setItem(historyKey, JSON.stringify([historyItem, ...history].slice(0, 10)));
  };

  if (loading) {
    return (
      <div className="watch-loading">
        <RefreshCw className="spinner" size={48} />
        <p>Loading player and details...</p>
        <style>{`
          .watch-loading {
            height: 80vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
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
          .watch-loading-inner, .watch-error-inner {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: var(--color-text-muted);
            text-align: center;
            padding: 24px;
          }
          .watch-error-inner h3 {
            color: var(--color-text);
            margin: 0;
          }
          .watch-error-inner p {
            margin: 0;
            max-width: 400px;
          }
          .watch-error-inner .sub-text {
            font-size: 13px;
            opacity: 0.6;
          }
        `}</style>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="watch-error">
        <AlertTriangle size={48} className="error-icon" />
        <h2>Failed to Load Media</h2>
        <p>Could not fetch metadata for this title. Please try another one.</p>
        <button className="btn btn-primary" onClick={() => setView('home')}>Go Back Home</button>
        <style>{`
          .watch-error {
            height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            text-align: center;
          }
          .error-icon { color: var(--color-error); }
        `}</style>
      </div>
    );
  }

  const title = details.title || details.name;
  const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';
  const releaseYear = (details.release_date || details.first_air_date || '').split('-')[0];
  const runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : 0);
  const cast = details.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || 'N/A';
  
  // Find official youtube trailer key from videos list
  const trailerVideo = details.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const trailerUrl = trailerVideo ? `https://www.youtube.com/embed/${trailerVideo.key}?autoplay=1` : null;

  // Build public embed links using the active server selector
  const mainStreamUrl = mediaType === 'movie'
    ? SERVERS[activeServerIndex].movie(mediaId)
    : SERVERS[activeServerIndex].tv(mediaId, activeEpisode.season, activeEpisode.episode);

  const handleEpisodeSelect = (season, episode) => {
    setActiveEpisode({ season, episode });
  };

  return (
    <div className={`watch-container ${isTheaterMode ? 'theater-layout' : 'standard-layout'}`}>
      
      {/* Upper Panel: Player (Full-Width in Theater Mode) */}
      <div className="player-column">
        {/* Ad block info / Warning bar */}
        {!mediaId.startsWith('youtube-') && (
          <div className="ad-info-bar glass">
            <AlertTriangle size={14} className="warning-yellow" />
            <span>
              <b>Tip:</b> Block popups by downloading our <b>Loom Extension</b> (link in the top bar). If a movie (especially Punjabi/Bollywood) doesn't play or load, click <b>Select Server</b> below the player and switch to <b>Server 3 (Embed.su)</b>, <b>Server 2</b>, or <b>Server 7</b>! For <b>Hindi Audio</b>, switch audio track inside Server 6 or 3 settings.
            </span>
          </div>
        )}

        {/* Video Player Box */}
        <div className="player-wrapper-outer">
          <div className="iframe-container glass">
            {mediaId.startsWith('youtube-') ? (
              <iframe
                src={`https://www.youtube.com/embed/${mediaId.replace('youtube-', '')}?autoplay=1`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              ></iframe>
            ) : isPlayingTrailer && trailerUrl ? (
              <iframe
                src={trailerUrl}
                title={`${title} - Official Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              ></iframe>
            ) : SERVERS[activeServerIndex]?.id === 'desidub' ? (
              isFetchingHindi ? (
                <div className="watch-loading-inner animate-pulse">
                  <RefreshCw className="spinner" size={40} />
                  <p>Searching Hindi dubbed databases...</p>
                </div>
              ) : hindiError ? (
                <div className="watch-error-inner">
                  <AlertTriangle size={40} className="error-icon" />
                  <h3>Hindi Dub Not Available</h3>
                  <p>{hindiError}</p>
                  <p className="sub-text">Please try Server 2 or Server 6 for standard multi-audio tracks.</p>
                </div>
              ) : useCustomPlayer && directStreamUrl ? (
                <CustomPlayer
                  src={directStreamUrl}
                  poster={TMDB_CONFIG.backdropUrl(details.backdrop_path)}
                  title={title}
                  onBackToServers={() => setUseCustomPlayer(false)}
                />
              ) : hindiEmbedUrl ? (
                <iframe
                  src={hindiEmbedUrl}
                  title={`${title} - Hindi Dubbed Player`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="video-iframe"
                ></iframe>
              ) : (
                <div className="watch-error-inner">
                  <AlertTriangle size={40} className="error-icon" />
                  <h3>No Source Available</h3>
                  <p>Could not resolve any playback streams on this server.</p>
                </div>
              )
            ) : useCustomPlayer && directStreamUrl ? (
              <CustomPlayer
                src={directStreamUrl}
                poster={TMDB_CONFIG.backdropUrl(details.backdrop_path)}
                title={title}
                onBackToServers={() => setUseCustomPlayer(false)}
              />
            ) : (
              <iframe
                src={mainStreamUrl}
                title={`${title} - Streaming Player`}
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              ></iframe>
            )}
          </div>

          {/* Smart AI Fallback Countdown Warning Alert */}
          {fallbackCountdown !== null && (
            <div className="smart-fallback-alert animate-pulse" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '10px 15px',
              color: '#fca5a5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
              marginBottom: '4px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚠️</span>
                <span>Server loading slow. <b>AI Smart Fallback</b> will switch to <b>{
                  SERVERS[(activeServerIndex + 1) % SERVERS.length].id === 'desidub' 
                    ? SERVERS[(activeServerIndex + 2) % SERVERS.length].name 
                    : SERVERS[(activeServerIndex + 1) % SERVERS.length].name
                }</b> in <b>{fallbackCountdown}s</b>...</span>
              </span>
              <button 
                onClick={() => setFallbackCountdown(null)} 
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Player controls (Toggles) */}
          {!mediaId.startsWith('youtube-') && (
            <div className="player-meta-controls">
              <div className="stream-source-indicators" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="source-label">Source:</span>
                  {directStreamUrl && !isPlayingTrailer && (
                    <button 
                      className={`source-badge ${useCustomPlayer ? 'active' : ''}`}
                      onClick={() => setUseCustomPlayer(true)}
                      style={{
                        background: useCustomPlayer ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '',
                        borderColor: useCustomPlayer ? '#10b981' : ''
                      }}
                      title="Play using the custom ad-free video player"
                    >
                      <Monitor size={12} /> ⚡ Ad-Free Player (Active)
                    </button>
                  )}
                  <button 
                    className={`source-badge ${!isPlayingTrailer && !useCustomPlayer ? 'active' : ''}`}
                    onClick={() => {
                      setIsPlayingTrailer(false);
                      setUseCustomPlayer(false);
                    }}
                    title="Play using standard third-party embed servers"
                  >
                    <Monitor size={12} /> {directStreamUrl ? 'Iframe Servers' : 'Main Playback Server'}
                  </button>
                  {trailerUrl && (
                    <button 
                      className={`source-badge ${isPlayingTrailer ? 'active' : ''}`}
                      onClick={() => setIsPlayingTrailer(true)}
                    >
                      <Play size={12} /> Official Trailer
                    </button>
                  )}
                </div>

                <button 
                  className={`theater-toggle-btn ${isTheaterMode ? 'active' : ''}`}
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  title="Toggle Theater Mode"
                  style={{ marginLeft: 'auto' }}
                >
                  <Tv size={16} /> {isTheaterMode ? 'Standard Mode' : 'Theater Mode'}
                </button>
              </div>
            </div>
          )}

          {/* Auto-Fallback Toast hint */}
          {showFallbackHint && !mediaId.startsWith('youtube-') && (
            <div className="player-loading-fallback glass glow-cyan animate-fade-in">
              <div className="fallback-content">
                <Sparkles size={16} className="fallback-icon animate-pulse" />
                <span>
                  <b>Slow Loading?</b> Some servers might be offline or buffering. Try switching to <b>Server 2</b> or <b>Server 3</b> for a faster stream!
                </span>
              </div>
              <button className="fallback-close-btn" onClick={() => setShowFallbackHint(false)}>×</button>
            </div>
          )}

          {/* Server Switcher Panel (Collapsible Accordion Selector) */}
          {!isPlayingTrailer && !mediaId.startsWith('youtube-') && (
            <div className="server-switcher-bar glass animate-fade-in" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div 
                className="server-switcher-header" 
                onClick={() => setShowServers(!showServers)}
                style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="server-label" style={{ margin: 0 }}>Select Server</span>
                  <span className="active-server-badge">
                    Active: {useCustomPlayer ? '⚡ Ad-Free Player' : `Server ${activeServerIndex + 1}`}
                  </span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`server-chevron ${showServers ? 'rotated' : ''}`} 
                />
              </div>

              {showServers && (
                <div className="server-switcher-expanded animate-fade-in" style={{ width: '100%', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="server-buttons">
                    {SERVERS.map((server, idx) => {
                      const isReported = isServerReported(idx);
                      return (
                        <button
                          key={server.id}
                          className={`server-btn-selector ${!useCustomPlayer && activeServerIndex === idx ? 'active' : ''} ${isReported ? 'server-reported' : ''}`}
                          onClick={() => {
                            setActiveServerIndex(idx);
                            setUseCustomPlayer(false); // Switch to the selected server iframe!
                            setShowServers(false); // auto-close after selection
                          }}
                          title={isReported ? "This server was reported as broken by users" : ""}
                        >
                          {server.name} {isReported && '⚠️'}
                        </button>
                      );
                    })}
                  </div>

                  <div className="smart-settings-panel" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                      <span style={{ fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>🤖 AI Smart Routing</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: '1.2' }}>Auto-loads regional audio (Hindi) & auto-recovers from offline servers.</span>
                    </div>
                    <button
                      onClick={() => {
                        const nextVal = !isSmartRouting;
                        setIsSmartRouting(nextVal);
                        localStorage.setItem('loom_smart_routing', nextVal ? 'true' : 'false');
                      }}
                      style={{
                        background: isSmartRouting ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                        border: 'none',
                        color: '#fff',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: '0.2s',
                        whiteSpace: 'nowrap',
                        boxShadow: isSmartRouting ? '0 0 10px var(--color-primary-glow)' : 'none'
                      }}
                    >
                      {isSmartRouting ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <button
                    className={`report-server-btn ${isServerReported(activeServerIndex) ? 'reported' : ''}`}
                    onClick={handleReportServer}
                    disabled={isServerReported(activeServerIndex)}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <AlertTriangle size={14} />
                    <span>{isServerReported(activeServerIndex) ? ' Reported Broken' : ' Report Server Offline'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hindi Video Host Selector (Only visible for Server 9 and when sources are loaded) */}
          {SERVERS[activeServerIndex]?.id === 'desidub' && hindiSources.length > 0 && (
            <div className="hindi-sources-selector animate-fade-in glass">
              <span className="source-label">Select Hindi Stream:</span>
              <div className="source-buttons">
                {hindiSources.map((source, idx) => (
                  <button
                    key={idx}
                    className={`source-btn ${activeHindiSourceIdx === idx ? 'active' : ''}`}
                    onClick={() => setActiveHindiSourceIdx(idx)}
                  >
                    {source.name} ({source.language || 'Hindi'})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout below the player */}
      <div className="watch-grid-details">
        
        {/* Left Column: Metadata details, episode selector, comments */}
        <div className="details-pane-left">
          {/* Main Info */}
          <div className="meta-card glass animate-fade-in">
            <h1 className="movie-watch-title">{title}</h1>
            
            {mediaType === 'tv' && (
              <span className="tv-playing-indicator animate-pulse">
                Now Playing: <b>Season {activeEpisode.season}, Episode {activeEpisode.episode}</b>
              </span>
            )}

            <div className="meta-details-row">
              <span className="meta-item rating">
                <Star size={14} fill="currentColor" className="star-icon" /> {rating}
              </span>
              <span className="meta-dot">•</span>
              <span className="meta-item">
                <Calendar size={14} /> {releaseYear}
              </span>
              {runtime > 0 && (
                <>
                  <span className="meta-dot">•</span>
                  <span className="meta-item">
                    <Clock size={14} /> {runtime} min
                  </span>
                </>
              )}
              <span className="meta-dot">•</span>
              <span className="meta-type-tag">{mediaType === 'tv' ? 'TV Series' : 'Movie'}</span>
            </div>

            {/* Collapsible Description Accordion */}
            <div className="description-accordion" style={{ marginTop: '14px' }}>
              <button 
                className="description-accordion-header"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} className="text-cyan" />
                  {isDescriptionExpanded ? 'Hide Story & Cast' : 'Show Story & Cast'}
                </span>
                <ChevronDown 
                  size={16} 
                  style={{ 
                    transform: isDescriptionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }} 
                />
              </button>

              <div 
                className="description-accordion-content"
                style={{
                  maxHeight: isDescriptionExpanded ? '1000px' : '0px',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: isDescriptionExpanded ? 1 : 0
                }}
              >
                <div style={{ paddingTop: '14px' }}>
                  <p className="overview-text" style={{ margin: 0 }}>{details.overview || 'No synopsis available for this title.'}</p>
                  
                  <div className="cast-row" style={{ marginTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
                    <span className="cast-label">Starring:</span>
                    <span className="cast-names">{cast}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Episode list for TV shows */}
          {mediaType === 'tv' && (
            <EpisodeSelector
              tvId={mediaId}
              seasons={details.seasons}
              activeEpisode={activeEpisode}
              onEpisodeSelect={handleEpisodeSelect}
            />
          )}

          {/* Comments Section */}
          <CommentsSection mediaId={mediaId} mediaType={mediaType} />
        </div>

        {/* Right Column: recommendations */}
        <div className="sidebar-pane-right">
          <SidebarRecommendations
            currentId={mediaId}
            currentType={mediaType}
            setView={setView}
          />
        </div>

      </div>

      <style>{`
        .watch-container {
          padding: 0 4% 40px;
          margin-top: 20px;
        }
        .ad-info-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: var(--border-radius-sm);
          font-size: 0.82rem;
          color: var(--color-text-muted);
          margin-bottom: 16px;
          border-color: rgba(245, 158, 11, 0.2);
        }
        .warning-yellow {
          color: var(--color-warning);
          flex-shrink: 0;
        }
        .player-wrapper-outer {
          margin-bottom: 24px;
        }
        .iframe-container {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: var(--border-radius-md);
          overflow: hidden;
          background: black;
          box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        }
        .video-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        .player-meta-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .stream-source-indicators {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .source-label {
          font-size: 0.8rem;
          color: var(--color-text-dim);
          font-weight: 600;
          text-transform: uppercase;
        }
        .source-badge {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: var(--transition-fast);
        }
        .source-badge:hover, .source-badge.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
          box-shadow: 0 0 10px var(--color-primary-glow);
        }
        .theater-toggle-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          padding: 6px 12px;
          border-radius: var(--border-radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: var(--transition-fast);
        }
        .theater-toggle-btn:hover, .theater-toggle-btn.active {
          color: white;
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.3);
        }
        
        /* Server Switcher Styles */
        .server-switcher-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: var(--border-radius-sm);
          margin-top: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.02);
          flex-wrap: wrap;
        }
        .active-server-badge {
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          color: var(--color-accent);
          padding: 2px 10px;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 700;
          margin-left: 8px;
        }
        .server-chevron {
          color: var(--color-text-dim);
          transition: transform 0.2s ease;
        }
        .server-chevron.rotated {
          transform: rotate(180deg);
        }
        .server-label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .server-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .server-btn-selector {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          padding: 6px 12px;
          border-radius: var(--border-radius-sm);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .server-btn-selector:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .server-btn-selector.active {
          background: linear-gradient(135deg, var(--color-accent) 0%, #0891b2 100%);
          color: white;
          border-color: var(--color-accent);
          box-shadow: 0 0 10px var(--color-accent-glow);
        }
        
        /* Watch Grid Details Layout */
        .watch-grid-details {
          display: grid;
          grid-template-columns: 7fr 3fr;
          gap: 30px;
        }
        
        .meta-card {
          padding: 24px;
          border-radius: var(--border-radius-md);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .movie-watch-title {
          font-family: var(--font-secondary);
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .tv-playing-indicator {
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid var(--color-primary-glow);
          color: #a78bfa;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.85rem;
          width: fit-content;
        }
        .meta-details-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--color-text-muted);
          flex-wrap: wrap;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .meta-item.rating {
          color: var(--color-warning);
          font-weight: 700;
        }
        .meta-dot {
          color: var(--color-text-dim);
        }
        .meta-type-tag {
          background: rgba(255,255,255,0.08);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .overview-text {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--color-text-muted);
        }
        .cast-row {
          font-size: 0.85rem;
          margin-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 12px;
        }
        .cast-label {
          color: var(--color-text-dim);
          font-weight: 600;
          margin-right: 6px;
        }
        .cast-names {
          color: var(--color-text-muted);
        }
        
        /* Theater Layout Modifications */
        .theater-layout {
          padding: 0;
        }
        .theater-layout .player-column {
          max-width: 100vw;
          margin-bottom: 30px;
        }
        .theater-layout .ad-info-bar {
          margin: 10px 4% 16px;
        }
        .theater-layout .iframe-container {
          aspect-ratio: 21/9; /* Wider cinema look */
          border-radius: 0;
          border-left: none;
          border-right: none;
        }
        .theater-layout .player-meta-controls {
          padding: 0 4%;
        }
        .theater-layout .watch-grid-details {
          padding: 0 4%;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .watch-grid-details {
            display: flex !important;
            flex-direction: column !important;
            gap: 24px !important;
            padding: 0 4% !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .details-pane-left, .sidebar-pane-right {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .details-pane-left > *, .sidebar-pane-right > * {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .theater-layout .iframe-container {
            aspect-ratio: 16/9; /* Reset cinema ratio to standard on tablets */
          }

          /* YouTube Mobile Layout Style Overrides (Merged into 1024px for all mobile/tablet viewports) */
          .watch-container {
            padding: 0 0 40px !important; /* Full-width video player edge-to-edge */
            margin-top: 0 !important;
          }
          .iframe-container {
            border-radius: 0 !important; /* Square corners */
            border: none !important;
            box-shadow: none !important;
          }
          .ad-info-bar {
            margin: 10px 4% 16px !important;
          }
          .player-meta-controls {
            padding: 0 4% !important;
          }
          .server-switcher-bar {
            margin: 14px 4% 0 !important;
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
          }
          .watch-grid-details {
            padding: 0 4% !important;
          }
          .server-buttons {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            width: 100%;
            margin-top: 8px;
          }
          .server-btn-selector {
            width: 100%;
            text-align: center;
            padding: 10px 6px;
            font-size: 0.74rem;
            white-space: normal;
            word-break: break-word;
            line-height: 1.2;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 40px;
          }
          .server-switcher-left {
            width: 100%;
            flex-direction: column;
            align-items: flex-start;
          }
          .report-server-btn {
            width: 100%;
            justify-content: center;
          }
          .extension-actions {
            flex-direction: column;
          }
          .theater-toggle-btn {
            display: none !important;
          }
        }

        /* Fallback Alert Styling */
        .player-loading-fallback {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          border-radius: var(--border-radius-sm);
          margin-bottom: 16px;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          color: var(--color-text-muted);
          font-size: 0.85rem;
        }
        .fallback-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .fallback-icon {
          color: var(--color-accent);
          flex-shrink: 0;
        }
        .fallback-close-btn {
          background: none;
          border: none;
          color: var(--color-text-dim);
          font-size: 1.2rem;
          cursor: pointer;
          font-weight: bold;
          transition: var(--transition-fast);
        }
        .fallback-close-btn:hover {
          color: white;
        }

        /* Server Offline / Report styles */
        .server-switcher-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          flex-grow: 1;
        }
        .server-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .server-btn-selector.server-reported {
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.05);
        }
        .report-server-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 6px 12px;
          border-radius: var(--border-radius-sm);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: var(--transition-fast);
        }
        .report-server-btn:hover:not(:disabled) {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
        }
        .report-server-btn.reported {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--color-border);
          color: var(--color-text-dim);
          cursor: not-allowed;
        }

        /* Chrome Extension Promo Card */
        .chrome-extension-card {
          padding: 20px;
          border-radius: var(--border-radius-md);
          margin-top: 20px;
          border: 1px solid rgba(6, 182, 212, 0.15);
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(5, 5, 8, 0.4) 100%);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .extension-header-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .extension-badge {
          background: linear-gradient(135deg, var(--color-accent) 0%, #0891b2 100%);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }
        .extension-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: white;
          font-family: var(--font-secondary);
        }
        .extension-desc {
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--color-text-muted);
        }
        .extension-actions {
          display: flex;
          gap: 12px;
          margin-top: 6px;
        }
        .btn-extension-download {
          background: var(--color-accent);
          color: white;
          border: 1px solid var(--color-accent);
          padding: 8px 16px;
          border-radius: var(--border-radius-sm);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: var(--transition-fast);
        }
        .btn-extension-download:hover {
          background: #0891b2;
          border-color: #0891b2;
          box-shadow: 0 0 12px var(--color-accent-glow);
        }
        .btn-extension-steps {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          padding: 8px 16px;
          border-radius: var(--border-radius-sm);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .btn-extension-steps:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        /* Modal Overlay & Content */
        .modal-overlay {
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
        .modal-content {
          width: 100%;
          max-width: 580px;
          background: #18181b;
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          font-family: var(--font-secondary);
        }
        .close-modal-btn {
          background: none;
          border: none;
          color: var(--color-text-dim);
          font-size: 1.8rem;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .close-modal-btn:hover {
          color: white;
        }
        .modal-body {
          padding: 24px;
        }
        .steps-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .steps-list li {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .step-num {
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid var(--color-accent);
          color: var(--color-accent);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.85rem;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .steps-list p {
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--color-text-muted);
        }
        .code-block-inline {
          background: rgba(255, 255, 255, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          color: #f43f5e;
          font-family: monospace;
          font-size: 0.85rem;
        }
        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: flex-end;
          background: rgba(0, 0, 0, 0.2);
        }
        
        .hindi-sources-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        .hindi-sources-selector .source-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-muted);
        }
        .hindi-sources-selector .source-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .hindi-sources-selector .source-btn {
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--color-text-muted);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .hindi-sources-selector .source-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-text);
        }
        .hindi-sources-selector .source-btn.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: #000;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
        }
        

      `}</style>

      {/* Extension Steps Modal */}
      {showExtensionSteps && (
        <div className="modal-overlay" onClick={() => setShowExtensionSteps(false)}>
          <div className="modal-content glass animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Loom Extension Install Kaise Karein? 🛠️</h2>
              <button className="close-modal-btn" onClick={() => setShowExtensionSteps(false)}>×</button>
            </div>
            <div className="modal-body">
              <ol className="steps-list">
                <li>
                  <span className="step-num">1</span>
                  <p>Sabse pehle upar diye gaye button se <b>Loom Extension</b> ZIP file download karein aur use extract (unzip) kar lein.</p>
                </li>
                <li>
                  <span className="step-num">2</span>
                  <p>Apne Chrome/Edge browser me naya tab khol kar ye URL enter karein: <code className="code-block-inline">chrome://extensions/</code></p>
                </li>
                <li>
                  <span className="step-num">3</span>
                  <p>Browser ke top-right corner me <b>"Developer Mode"</b> toggle switch ko ON kar dein.</p>
                </li>
                <li>
                  <span className="step-num">4</span>
                  <p>Top-left corner me <b>"Load unpacked"</b> button par click karein aur extract kiya hua folder (jis me manifest.json file hai) select kar lein.</p>
                </li>
                <li>
                  <span className="step-num">5</span>
                  <p>Bas! Extension active ho chuki hai. Ab Loom Movies par aakar bina kisi ad ke premium streaming enjoy karein!</p>
                </li>
              </ol>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowExtensionSteps(false)}>Samajh Gaya (Close)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
