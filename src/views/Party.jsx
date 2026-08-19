import React, { useState, useEffect, useRef } from 'react';
import { Play, Star, Calendar, Clock, RefreshCw, AlertTriangle, Monitor, Tv, Sparkles, ChevronDown, FileText, Send, Share2 } from 'lucide-react';
import { fetchMediaDetails, TMDB_CONFIG, BANNED_KEYWORDS } from '../config/tmdb';
import EpisodeSelector from '../components/EpisodeSelector';
import CustomPlayer from '../components/CustomPlayer';
import { supabase } from '../config/supabase';

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
    id: 'vidsrc-cc',
    name: 'Server 3 (VidSrc.cc)',
    movie: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrc-to',
    name: 'Server 4 (VidSrc.to)',
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'autoembed',
    name: 'Server 5 (AutoEmbed)',
    movie: (id) => `https://player.autoembed.co/movie/${id}`,
    tv: (id, s, e) => `https://player.autoembed.co/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrc-pm',
    name: 'Server 6 (VidSrc.pm)',
    movie: (id) => `https://embed.vidsrc.pm/v2/embed/movie/${id}`,
    tv: (id, s, e) => `https://embed.vidsrc.pm/v2/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'desidub',
    name: 'Server 7 (DesiDub - Hindi)',
    movie: (id) => ``, // Loaded dynamically
    tv: (id, s, e) => ``
  }
];

export default function Party({ mediaId: rawMediaId, mediaType, setView, roomId, setRoomId }) {
  const mediaId = String(rawMediaId);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  
  // Tabs for Mobile View ('chat', 'episodes', 'recommended', 'info')
  const [activeTab, setActiveTab] = useState('chat');
  
  // Track active episode if TV show
  const [activeEpisode, setActiveEpisode] = useState({ season: 1, episode: 1 });
  const [showServers, setShowServers] = useState(false);

  // Smart AI Regional Routing & Fallback States
  const [isSmartRouting, setIsSmartRouting] = useState(() => {
    return localStorage.getItem('loom_smart_routing') !== 'false';
  });
  const [isSouthAsian, setIsSouthAsian] = useState(false);
  const [isCheckingServers, setIsCheckingServers] = useState(false);
  const [isMovieUnavailable, setIsMovieUnavailable] = useState(false);

  // Server Reporting, Fallback Timer and Extension UI States
  const [reportedServers, setReportedServers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('loom_reported_servers') || '{}');
    } catch (e) {
      return {};
    }
  });
  const [showFallbackHint, setShowFallbackHint] = useState(false);
  const [useCustomPlayer, setUseCustomPlayer] = useState(false);
  const [directStreamUrl, setDirectStreamUrl] = useState(null);

  // Hindi Audio / DesiDub States
  const [hindiSources, setHindiSources] = useState([]);
  const [activeHindiSourceIdx, setActiveHindiSourceIdx] = useState(0);
  const [isFetchingHindi, setIsFetchingHindi] = useState(false);
  const [hindiError, setHindiError] = useState(null);
  const [hindiEmbedUrl, setHindiEmbedUrl] = useState(null);

  // Watch Party States
  const [isHost, setIsHost] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('loom_party_nickname') || `User-${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const chatEndRef = useRef(null);

  // GeoIP detection
  useEffect(() => {
    const isLocalHiUr = navigator.languages
      ? navigator.languages.some(lang => /hi|ur|pa/i.test(lang))
      : /hi|ur|pa/i.test(navigator.language || '');
      
    if (isLocalHiUr) {
      setIsSouthAsian(true);
    }
    
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
  }, []);

  // AI Server Checker
  useEffect(() => {
    let active = true;
    async function verifyServers() {
      if (!mediaId || isSmartRouting === false) return;
      
      setIsCheckingServers(true);
      setIsMovieUnavailable(false);
      
      try {
        const queryUrl = `/api/check-servers?id=${mediaId}&type=${mediaType}`;
        const res = await fetch(queryUrl);
        const data = await res.json();
        
        if (!active) return;
        
        const workingList = data.workingServers || [];
        
        if (workingList.length === 0) {
          console.warn("Smart Routing: AI flagged this movie as completely offline.");
          setIsMovieUnavailable(true);
          const currentBroken = JSON.parse(localStorage.getItem('loom_broken_movies') || '[]');
          if (!currentBroken.includes(String(mediaId))) {
            localStorage.setItem('loom_broken_movies', JSON.stringify([...currentBroken, String(mediaId)]));
          }
          return;
        }

        const currentServerId = SERVERS[activeServerIndex]?.id;
        if (!workingList.includes(currentServerId)) {
          const firstWorkingIdx = SERVERS.findIndex(s => workingList.includes(s.id));
          if (firstWorkingIdx !== -1) {
            console.log(`Smart AI Routing: Server ${currentServerId} is unavailable. Switching to working server: ${SERVERS[firstWorkingIdx].name}`);
            setActiveServerIndex(firstWorkingIdx);
            setUseCustomPlayer(false);
          }
        }
      } catch (err) {
        console.error("AI Server Verification failed:", err);
      } finally {
        if (active) setIsCheckingServers(false);
      }
    }

    verifyServers();
    return () => { active = false; };
  }, [mediaId, mediaType, activeEpisode.season, activeEpisode.episode]);

  // Load details
  useEffect(() => {
    let active = true;
    async function loadDetails() {
      setLoading(true);
      try {
        const data = await fetchMediaDetails(mediaId, mediaType);
        
        if (data) {
          const titleLower = (data.title || data.name || '').toLowerCase();
          const overviewLower = (data.overview || '').toLowerCase();
          const isAdult = data.adult === true;
          const hasBanned = BANNED_KEYWORDS.some(word => 
            titleLower.includes(word) || overviewLower.includes(word)
          );
          
          if (isAdult || hasBanned) {
            if (active) {
              setDetails(null);
              setLoading(false);
            }
            return;
          }
        }

        if (active) {
          setDetails(data);
          setIsPlayingTrailer(false);
          setActiveEpisode({ season: 1, episode: 1 });
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDetails();
    return () => { active = false; };
  }, [mediaId, mediaType]);

  // Hindi audio loaders
  useEffect(() => {
    let active = true;
    
    async function loadHindiStream() {
      if (SERVERS[activeServerIndex]?.id !== 'desidub') return;
      
      setIsFetchingHindi(true);
      setHindiError(null);
      setHindiSources([]);
      
      try {
        const queryUrl = `/api/get-hindi-stream?action=search&id=${mediaId}&type=${mediaType}`;
        const searchRes = await fetch(queryUrl);
        const searchData = await searchRes.json();
        
        if (!searchData?.found || !searchData?.id) {
          throw new Error("This title does not have a Hindi dubbed track available.");
        }
        
        const infoRes = await fetch(`/api/get-hindi-stream?action=info&id=${searchData.id}`);
        const infoData = await infoRes.json();
        
        if (!active) return;
        
        let matchedEp = null;
        if (mediaType === 'movie') {
          matchedEp = infoData.episodes?.[0];
        } else {
          const currentEpNum = activeEpisode.episode;
          const currentSeasonNum = activeEpisode.season;
          matchedEp = infoData.episodes?.find(ep => 
            ep.episode_number === currentEpNum && ep.season_number === currentSeasonNum
          );
        }
        
        if (!matchedEp) {
          matchedEp = infoData.episodes?.[0];
        }
        
        if (!matchedEp?.id) {
          throw new Error(`Episode not found in Hindi database.`);
        }
        
        const watchRes = await fetch(`/api/get-hindi-stream?action=watch&id=${matchedEp.id}`);
        const watchData = await watchRes.json();
        
        const sources = watchData?.sources || [];
        if (sources.length === 0) {
          throw new Error("No video streams found for this episode.");
        }
        
        if (active) {
          setHindiSources(sources);
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
        let finalUrl = source.url;
        if (finalUrl.startsWith('//')) {
          finalUrl = 'https:' + finalUrl;
        }
        setHindiEmbedUrl(finalUrl);
      }
    }
  }, [activeHindiSourceIdx, hindiSources, activeServerIndex]);

  // Watch Party room initialization
  useEffect(() => {
    if (!roomId) return;
    
    let active = true;
    async function initRoom() {
      try {
        const { data: room, error } = await supabase
          .from('watch_party_rooms')
          .select('*')
          .eq('room_id', roomId)
          .single();
          
        if (error || !room) {
          console.log("Room not found. Creating room as host:", roomId);
          setIsHost(true);
          await supabase.from('watch_party_rooms').insert({
            room_id: roomId,
            media_id: String(mediaId),
            media_type: mediaType,
            season: activeEpisode.season,
            episode: activeEpisode.episode,
            current_server_idx: activeServerIndex,
            is_playing: false
          });
        } else {
          console.log("Joined existing room as guest:", room);
          setIsHost(false);
          if (active) {
            setActiveServerIndex(room.current_server_idx);
            setActiveEpisode({ season: room.season, episode: room.episode });
          }
        }
      } catch (err) {
        console.error("Failed to initialize Watch Room:", err);
      }
    }
    
    initRoom();
    return () => { active = false; };
  }, [roomId, mediaId]);

  // Host state updates push
  useEffect(() => {
    if (!roomId || !isHost) return;
    
    async function updateRoomState() {
      try {
        await supabase
          .from('watch_party_rooms')
          .update({
            current_server_idx: activeServerIndex,
            season: activeEpisode.season,
            episode: activeEpisode.episode,
            updated_at: new Date().toISOString()
          })
          .eq('room_id', roomId);
      } catch (e) {
        console.error("Failed to update room state:", e);
      }
    }
    updateRoomState();
  }, [activeServerIndex, activeEpisode.season, activeEpisode.episode, roomId, isHost]);

  // Guest sync listener polling
  useEffect(() => {
    if (!roomId || isHost) return;
    
    let active = true;
    const interval = setInterval(async () => {
      try {
        const { data: room, error } = await supabase
          .from('watch_party_rooms')
          .select('*')
          .eq('room_id', roomId)
          .single();
          
        if (!error && room && active) {
          if (room.current_server_idx !== activeServerIndex) {
            console.log("Guest Sync: Server updated from host:", room.current_server_idx);
            setActiveServerIndex(room.current_server_idx);
            setUseCustomPlayer(false);
          }
          if (room.season !== activeEpisode.season || room.episode !== activeEpisode.episode) {
            console.log("Guest Sync: Episode updated from host:", room.season, room.episode);
            setActiveEpisode({ season: room.season, episode: room.episode });
          }
        }
      } catch (e) {
        console.error("Guest polling failed:", e);
      }
    }, 2500);
    
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [roomId, isHost, activeServerIndex, activeEpisode]);

  // Fetch and poll chat messages
  useEffect(() => {
    if (!roomId) return;
    
    let active = true;
    async function fetchChats() {
      try {
        const { data, error } = await supabase
          .from('watch_party_chats')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });
          
        if (!error && data && active) {
          setChatMessages(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    fetchChats();
    const interval = setInterval(fetchChats, 2000);
    
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [roomId]);

  // Auto-scroll chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !roomId) return;
    
    const msg = chatInput.trim();
    setChatInput('');
    
    try {
      await supabase.from('watch_party_chats').insert({
        room_id: roomId,
        sender_name: nickname,
        message: msg
      });
      const { data } = await supabase
        .from('watch_party_chats')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      if (data) setChatMessages(data);
    } catch (err) {
      console.error("Failed to send chat:", err);
    }
  };

  const handleReportServer = () => {
    const sId = SERVERS[activeServerIndex]?.id;
    const isReported = reportedServers[sId] === true;
    
    if (isReported) return;
    
    const updated = { ...reportedServers, [sId]: true };
    setReportedServers(updated);
    localStorage.setItem('loom_reported_servers', JSON.stringify(updated));
    alert(`Thank you! Server "${SERVERS[activeServerIndex].name}" has been flagged as offline.`);
  };

  const isServerReported = (idx) => {
    const sId = SERVERS[idx]?.id;
    return reportedServers[sId] === true;
  };

  if (loading) {
    return (
      <div className="watch-loading-container">
        <RefreshCw className="spinner" size={48} />
        <p>Analyzing media channels & preparing sync room...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="watch-error-container page-padding">
        <AlertTriangle size={60} className="error-icon" />
        <h1>Unavailable Content</h1>
        <p>This title does not comply with content safety configurations.</p>
        <button className="back-home-btn" onClick={() => setView('home')}>Back to Homepage</button>
      </div>
    );
  }

  const title = details.title || details.name;
  const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';
  const releaseYear = (details.release_date || details.first_air_date || '').split('-')[0];
  const genres = details.genres ? details.genres.map(g => g.name).join(', ') : '';
  const cast = details.credits?.cast ? details.credits.cast.slice(0, 5).map(c => c.name).join(', ') : 'N/A';

  const mainStreamUrl = mediaType === 'tv'
    ? SERVERS[activeServerIndex].tv(mediaId, activeEpisode.season, activeEpisode.episode)
    : SERVERS[activeServerIndex].movie(mediaId);

  const trailerUrl = details.videos?.results?.length > 0
    ? `https://www.youtube.com/embed/${details.videos.results.find(v => v.type === 'Trailer')?.key || details.videos.results[0].key}?autoplay=1&mute=0`
    : null;

  return (
    <div className="party-view-container animate-fade-in">
      <div className="party-columns">
        
        {/* Left Column: Player & Sync Status Card & Episodes */}
        <div className="party-left-column">
          <div className="player-wrapper-outer">
            <div className="iframe-container">
              {isPlayingTrailer && trailerUrl ? (
                <iframe
                  src={trailerUrl}
                  title={`${title} - Official Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="video-iframe"
                ></iframe>
              ) : isCheckingServers ? (
                <div className="watch-loading-inner" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--color-text-muted)' }}>
                  <RefreshCw className="spinner" size={40} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--color-primary)' }} />
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>AI Verifying Servers</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>Searching for a guaranteed working streaming link...</p>
                </div>
              ) : isMovieUnavailable ? (
                <div className="watch-error-inner" style={{ background: 'rgba(239, 68, 68, 0.05)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '40px', textAlign: 'center' }}>
                  <AlertTriangle size={40} className="error-icon" style={{ color: 'var(--color-error)' }} />
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>Content Not Available</h3>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '400px', lineHeight: '1.4' }}>
                    This title is currently not hosted on any of our streaming servers. Our AI has automatically flagged this movie for verification.
                  </p>
                  <button onClick={() => setView('home')} style={{ background: 'var(--color-primary)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Back to Homepage</button>
                </div>
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
          </div>

          {/* Watch Party Sync Status Card */}
          <div className="party-sync-card glass">
            <div className="sync-card-row">
              <div className="sync-status-indicator">
                <span className="live-dot pulse-red"></span>
                <span>Room: <strong style={{ color: 'var(--color-accent)' }}>{roomId}</strong> ({isHost ? 'Host' : 'Guest'})</span>
              </div>
              
              <div className="sync-nickname-box">
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>My Nickname:</span>
                <input 
                  type="text" 
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    localStorage.setItem('loom_party_nickname', e.target.value);
                  }}
                  className="nickname-input"
                />
              </div>

              <div className="sync-action-buttons">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Invite link copied! Share this link with friends to watch together.");
                  }}
                  className="sync-action-btn copy-btn"
                >
                  <Share2 size={12} /> Invite
                </button>
                <button 
                  onClick={() => {
                    if (confirm("Leave this Watch Room?")) {
                      setRoomId(null);
                      setView('watch', mediaId, mediaType);
                    }
                  }}
                  className="sync-action-btn leave-btn"
                >
                  Leave Room
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Only Pane content */}
          <div className="desktop-party-details">
            {/* Server Selector Bar */}
            {!mediaId.startsWith('youtube-') && (
              <div className="player-meta-controls">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="source-label">Source:</span>
                  {trailerUrl && (
                    <button 
                      className={`source-badge ${isPlayingTrailer ? 'active' : ''}`}
                      onClick={() => setIsPlayingTrailer(true)}
                    >
                      <Play size={12} /> Trailer
                    </button>
                  )}
                  {isPlayingTrailer && (
                    <button className="source-badge" onClick={() => setIsPlayingTrailer(false)}>
                      <Tv size={12} /> Back to Movie
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                  <span className="active-server-badge" onClick={() => setShowServers(!showServers)} style={{ cursor: 'pointer' }}>
                    Active: {SERVERS[activeServerIndex]?.name} <ChevronDown size={12} />
                  </span>

                  {showServers && (
                    <div className="servers-dropdown glass animate-fade-in">
                      {SERVERS.map((server, idx) => {
                        if (server.id === 'desidub' && !isSouthAsian) return null;
                        const isReported = isServerReported(idx);
                        return (
                          <button
                            key={server.id}
                            className={`server-btn-selector ${activeServerIndex === idx ? 'active' : ''} ${isReported ? 'server-reported' : ''}`}
                            onClick={() => {
                              setActiveServerIndex(idx);
                              setUseCustomPlayer(false);
                              setShowServers(false);
                            }}
                          >
                            {server.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Synopsis info */}
            <div className="party-details-card glass" style={{ marginTop: '20px', padding: '20px', borderRadius: '12px' }}>
              <h2 style={{ fontSize: '1.4rem', margin: '0 0 10px' }}>{title} ({releaseYear})</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '0 0 10px' }}>{genres} • Rating: ⭐ {rating}</p>
              <p style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: '1.5', margin: '0 0 10px' }}>{details.overview}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-dim)' }}><strong>Starring:</strong> {cast}</p>
            </div>

            {/* Episode Selector for TV Shows */}
            {mediaType === 'tv' && (
              <EpisodeSelector
                tvId={mediaId}
                seasons={details.seasons}
                activeEpisode={activeEpisode}
                onEpisodeSelect={(ep) => {
                  if (isHost) {
                    setActiveEpisode(ep);
                  } else {
                    alert("Only the Host can switch episodes!");
                  }
                }}
              />
            )}

          </div>

          {/* Mobile Only: Tabbed Layout Panels */}
          <div className="mobile-party-tabs-container">
            {/* Tabs Header */}
            <div className="mobile-tabs-header glass">
              <button className={`tab-header-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                💬 Chat
              </button>
              {mediaType === 'tv' && (
                <button className={`tab-header-btn ${activeTab === 'episodes' ? 'active' : ''}`} onClick={() => setActiveTab('episodes')}>
                  📋 Episodes
                </button>
              )}
              <button className={`tab-header-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                📝 Info
              </button>
            </div>

            {/* Active Tab Panel */}
            <div className="mobile-tab-panel-content">
              {activeTab === 'chat' && (
                <div className="watch-party-chat-container glass" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {chatMessages.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', textAlign: 'center', marginTop: '20px' }}>
                        Welcome to the room! Send a message to start.
                      </p>
                    ) : (
                      chatMessages.map(msg => (
                        <div key={msg.id} style={{
                          fontSize: '0.8rem',
                          background: msg.sender_name === nickname ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255,255,255,0.02)',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          alignSelf: msg.sender_name === nickname ? 'flex-end' : 'flex-start',
                          maxWidth: '85%'
                        }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--color-accent)', marginRight: '6px' }}>{msg.sender_name}:</span>
                          <span>{msg.message}</span>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendChat} style={{ padding: '8px', display: 'flex', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      value={chatInput} 
                      onChange={(e) => setChatInput(e.target.value)}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '20px', padding: '6px 12px', fontSize: '0.8rem', color: '#fff' }}
                    />
                    <button type="submit" style={{ background: 'var(--color-primary)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem' }}><Send size={12} /></button>
                  </form>
                </div>
              )}

              {activeTab === 'episodes' && mediaType === 'tv' && (
                <EpisodeSelector
                  tvId={mediaId}
                  seasons={details.seasons}
                  activeEpisode={activeEpisode}
                  onEpisodeSelect={(ep) => {
                    if (isHost) {
                      setActiveEpisode(ep);
                    } else {
                      alert("Only the Host can switch episodes!");
                    }
                  }}
                />
              )}

              {activeTab === 'info' && (
                <div className="party-details-card glass" style={{ padding: '16px', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px' }}>{title} ({releaseYear})</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: '10px' }}>{genres}</p>
                  <p style={{ fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '12px' }}>{details.overview}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}><strong>Starring:</strong> {cast}</p>
                  
                  {/* Server selector inside Info Tab on mobile */}
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem' }}>Server:</span>
                    {SERVERS.map((server, idx) => {
                      if (server.id === 'desidub' && !isSouthAsian) return null;
                      return (
                        <button
                          key={server.id}
                          onClick={() => {
                            setActiveServerIndex(idx);
                            setUseCustomPlayer(false);
                          }}
                          style={{
                            fontSize: '0.75rem',
                            background: activeServerIndex === idx ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: '#fff',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {server.name.replace(/Server \d+ \(/, '').replace(')', '')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Box & Recs (Desktop Only) */}
        <div className="party-right-column">
          <div className="watch-party-chat-container glass" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '420px',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            marginBottom: '20px',
            background: 'rgba(0,0,0,0.4)'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)' }}>
                <Sparkles size={16} /> Room Chat
              </span>
              <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>Code: <b>{roomId}</b></span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chatMessages.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', textAlign: 'center', marginTop: '20px' }}>
                  No messages yet. Send a message to start chatting!
                </p>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} style={{
                    fontSize: '0.8rem',
                    lineHeight: '1.4',
                    background: msg.sender_name === nickname ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255,255,255,0.02)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: msg.sender_name === nickname ? '1px solid rgba(6, 182, 212, 0.15)' : '1px solid transparent',
                    alignSelf: msg.sender_name === nickname ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--color-accent)', marginRight: '6px' }}>{msg.sender_name}:</span>
                    <span>{msg.message}</span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChat} style={{
              padding: '10px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '8px',
              background: 'rgba(0,0,0,0.2)'
            }}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: '#fff', padding: '6px 12px', fontSize: '0.8rem' }}
              />
              <button type="submit" style={{ background: 'var(--color-primary)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Send</button>
            </form>
          </div>
        </div>

      </div>

      <style>{`
        .party-view-container {
          padding: 0 4% 40px;
          margin-top: 20px;
        }
        .party-columns {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .player-wrapper-outer {
          margin-bottom: 16px;
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
        .party-sync-card {
          padding: 16px;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          margin-bottom: 24px;
        }
        .sync-card-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .sync-status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.88rem;
          font-weight: 500;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
        }
        .pulse-red {
          animation: pulseRed 2s infinite;
        }
        @keyframes pulseRed {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .sync-nickname-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nickname-input {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          color: #fff;
          padding: 4px 10px;
          font-size: 0.8rem;
          width: 130px;
        }
        .sync-action-buttons {
          display: flex;
          gap: 8px;
        }
        .sync-action-btn {
          border: none;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: var(--transition-fast);
        }
        .sync-action-btn.copy-btn {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .sync-action-btn.leave-btn {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
        }
        .player-meta-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
          flex-wrap: wrap;
          gap: 12px;
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
        }
        .active-server-badge {
          font-size: 0.8rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-border);
          padding: 6px 12px;
          border-radius: 20px;
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .servers-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 6px;
          z-index: 100;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          overflow: hidden;
          width: 200px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .server-btn-selector {
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          padding: 10px 14px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .server-btn-selector:hover, .server-btn-selector.active {
          background: var(--color-primary);
          color: #fff;
        }
        .mobile-party-tabs-container {
          display: none;
        }

        /* Desktop Layout Query */
        @media (min-width: 1024px) {
          .party-columns {
            grid-template-columns: 1fr 340px;
          }
          .party-right-column {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .desktop-party-details {
            display: block;
          }
          .mobile-party-tabs-container {
            display: none !important;
          }
        }

        /* Mobile Layout Query */
        @media (max-width: 1023px) {
          .party-right-column {
            display: none !important;
          }
          .desktop-party-details {
            display: none !important;
          }
          .mobile-party-tabs-container {
            display: block;
            margin-top: 16px;
          }
          .mobile-tabs-header {
            display: flex;
            border-radius: 12px;
            border: 1px solid var(--color-border);
            overflow: hidden;
            margin-bottom: 16px;
          }
          .tab-header-btn {
            flex: 1;
            background: transparent;
            border: none;
            color: var(--color-text-muted);
            padding: 10px 6px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            text-align: center;
            transition: var(--transition-fast);
          }
          .tab-header-btn.active {
            background: var(--color-primary);
            color: #fff;
          }
        }
      `}</style>
    </div>
  );
}
