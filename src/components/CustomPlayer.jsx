import React, { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Activity, SkipForward, ArrowLeft } from 'lucide-react';

export default function CustomPlayer({ src, poster, title, onBackToServers }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize and bind Hls.js
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setIsBuffering(true);

    // Clean up previous Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxMaxBufferLength: 30,
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Fallback for native Safari HLS
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          setIsBuffering(false);
        });
      }
    } else {
      // Direct MP4 link
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsBuffering(false);
      });
    }

    // Set initial playing state
    setIsPlaying(false);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Handle Controls Timeout visibility
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(window.controlsTimeout);
      window.controlsTimeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3500);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('touchstart', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchstart', handleMouseMove);
      }
      clearTimeout(window.controlsTimeout);
    };
  }, [isPlaying]);

  // Video State listeners
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handlePlayPause = (e) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error(err));
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const seekTime = parseFloat(e.target.value);
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      video.volume = 0;
    } else {
      video.volume = volume || 0.5;
      if (video.volume === 0) {
        video.volume = 0.5;
        setVolume(0.5);
      }
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => console.error(err));
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Sync fullscreen change with ESC key
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (timeInSecs) => {
    if (isNaN(timeInSecs)) return '00:00';
    const hours = Math.floor(timeInSecs / 3600);
    const minutes = Math.floor((timeInSecs % 3600) / 60);
    const seconds = Math.floor(timeInSecs % 60);

    const pad = (num) => String(num).padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const skipTime = (amount) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + amount));
    }
  };

  return (
    <div 
      className={`custom-video-player-container ${showControls ? 'show-ui' : 'hide-ui'}`}
      ref={containerRef}
      onClick={handlePlayPause}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="custom-video-element"
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        playsInline
      ></video>

      {/* Loading Spinner */}
      {isBuffering && (
        <div className="player-buffering-overlay">
          <div className="buffering-spinner"></div>
          <span className="buffering-text">Buffering Stream...</span>
        </div>
      )}

      {/* Top Bar Controls */}
      <div className="player-top-bar" onClick={(e) => e.stopPropagation()}>
        <button className="player-back-btn" onClick={onBackToServers}>
          <ArrowLeft size={16} /> <span>Back to Servers</span>
        </button>
        <span className="player-video-title">{title}</span>
        <span className="player-adfree-badge">🚫 Ad-Free Stream</span>
      </div>

      {/* Controls Overlay Overlay */}
      <div className="player-controls-overlay" onClick={(e) => e.stopPropagation()}>
        {/* Progress Bar Row */}
        <div className="progress-timeline-row">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="timeline-slider"
            style={{
              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${
                (currentTime / (duration || 1)) * 100
              }%, rgba(255, 255, 255, 0.15) ${(currentTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.15) 100%)`
            }}
          />
        </div>

        {/* Lower Controls Row */}
        <div className="player-controls-bottom">
          <div className="controls-left">
            <button className="control-btn play-pause-btn" onClick={handlePlayPause}>
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>

            <button className="control-btn skip-backward-btn" onClick={() => skipTime(-10)} title="Rewind 10s">
              <RotateCcw size={16} />
            </button>

            <div className="volume-control-group">
              <button className="control-btn mute-btn" onClick={toggleMute}>
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>

            <div className="player-time-display">
              <span>{formatTime(currentTime)}</span>
              <span className="time-divider">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="controls-right">
            {/* Speed Selector */}
            <div className="speed-control-group">
              <button className="control-btn speed-btn">
                <span>{playbackSpeed}x</span>
              </button>
              <div className="speed-options-dropdown">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    className={`speed-option-item ${playbackSpeed === s ? 'active' : ''}`}
                    onClick={() => handleSpeedChange(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Fullscreen Button */}
            <button className="control-btn fullscreen-btn" onClick={toggleFullscreen}>
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-video-player-container {
          position: relative;
          width: 100%;
          height: 100%;
          background: black;
          overflow: hidden;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .custom-video-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        /* Buffering Overlay */
        .player-buffering-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: white;
          z-index: 20;
        }
        .buffering-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(6, 182, 212, 0.1);
          border-left-color: var(--color-accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .buffering-text {
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        /* Top Bar Controls */
        .player-top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%);
          display: flex;
          align-items: center;
          padding: 0 24px;
          gap: 16px;
          color: white;
          z-index: 25;
          opacity: 0;
          transform: translateY(-10px);
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .player-back-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }
        .player-back-btn:hover {
          background: rgba(255,255,255,0.18);
        }
        .player-video-title {
          font-size: 0.95rem;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          flex-grow: 1;
        }
        .player-adfree-badge {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        /* Controls Overlay Bottom */
        .player-controls-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 70%, transparent 100%);
          padding: 20px 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 25;
          opacity: 0;
          transform: translateY(10px);
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .show-ui .player-top-bar,
        .show-ui .player-controls-overlay {
          opacity: 1;
          transform: translateY(0);
        }
        
        .hide-ui {
          cursor: none;
        }

        /* Progress Timeline */
        .progress-timeline-row {
          width: 100%;
          display: flex;
          align-items: center;
        }
        .timeline-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          outline: none;
          cursor: pointer;
          -webkit-appearance: none;
          transition: height 0.1s;
        }
        .timeline-slider:hover {
          height: 8px;
        }
        .timeline-slider::-webkit-slider-runnable-track {
          height: 100%;
        }
        .timeline-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 8px var(--color-accent);
          margin-top: -3px; /* Webkit adjust */
          transition: transform 0.1s;
        }
        .timeline-slider:hover::-webkit-slider-thumb {
          transform: scale(1.3);
        }

        /* Bottom Controls layout */
        .player-controls-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
        }
        .controls-left, .controls-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .control-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s, transform 0.1s;
        }
        .control-btn:hover {
          color: white;
          transform: scale(1.1);
        }
        .play-pause-btn {
          color: white;
        }
        .volume-control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .volume-slider {
          width: 70px;
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
          -webkit-appearance: none;
        }
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: white;
        }
        .player-time-display {
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .time-divider {
          color: rgba(255,255,255,0.3);
        }

        /* Speed Control Menu */
        .speed-control-group {
          position: relative;
        }
        .speed-btn {
          font-size: 0.85rem;
          font-weight: 700;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 3px 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.05);
        }
        .speed-options-dropdown {
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(5px);
          transition: transform 0.15s, opacity 0.15s, visibility 0.15s;
          z-index: 30;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        .speed-control-group:hover .speed-options-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .speed-option-item {
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 4px 12px;
          text-align: left;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.1s, color 0.1s;
        }
        .speed-option-item:hover, .speed-option-item.active {
          color: white;
          background: var(--color-accent);
        }
      `}</style>
    </div>
  );
}
