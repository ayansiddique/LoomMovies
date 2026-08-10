import React, { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';

export default function CelebrationOverlay({ themeType }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the celebration popup in this session
    const hasSeen = sessionStorage.getItem('loom_celebrated');
    if (!hasSeen && (themeType === 'aug14' || themeType === 'aug15')) {
      setIsOpen(true);
    }
  }, [themeType]);

  const handleClose = () => {
    sessionStorage.setItem('loom_celebrated', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const isPK = themeType === 'aug14';
  const countryName = isPK ? 'Pakistan' : 'India';
  const dateStr = isPK ? '14th August' : '15th August';
  
  // Set confetti colors
  const colors = isPK ? ['#10b981', '#ffffff'] : ['#ff9933', '#ffffff', '#128807'];

  // Generate 60 randomized confetti particles
  const particles = Array.from({ length: 60 }).map((_, i) => {
    const color = colors[i % colors.length];
    const left = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = 3 + Math.random() * 4;
    const size = 6 + Math.random() * 10;
    const shape = i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'square' : 'triangle';
    return { id: i, color, left, delay, duration, size, shape };
  });

  return (
    <div className="celebration-overlay animate-fade-in">
      {/* Confetti Container */}
      <div className="confetti-wrapper">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`confetti-particle ${p.shape}`}
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              backgroundColor: p.shape !== 'triangle' ? p.color : 'transparent',
              borderColor: p.shape === 'triangle' ? `transparent transparent ${p.color} transparent` : 'none',
              width: p.shape !== 'triangle' ? `${p.size}px` : '0',
              height: p.shape !== 'triangle' ? `${p.size}px` : '0',
              borderWidth: p.shape === 'triangle' ? `0 ${p.size / 2}px ${p.size}px ${p.size / 2}px` : '0',
            }}
          />
        ))}
      </div>

      {/* Border Beam Conic Glow Wrapper */}
      <div className="border-beam-wrapper animate-fade-in-up">
        {/* Conic rotating gradient background */}
        <div className="border-beam-glow"></div>

        {/* Main Announcement Modal */}
        <div className="celebration-modal glass">
          {/* Ambient top glow */}
          <div className="modal-glow-top"></div>

          <button className="close-modal-btn" onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>

          <div className="modal-content-inner">
            
            {/* Custom SVG Badges (Replacing cheap emojis) */}
            <div className="emblem-container">
              {isPK ? (
                /* Pakistan Crescent & Star Emblem */
                <svg className="svg-emblem pk-emblem animate-float-slow" viewBox="0 0 120 120">
                  <defs>
                    <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-white" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <circle cx="60" cy="60" r="52" fill="#005a2e" stroke="#10b981" strokeWidth="3" filter="url(#glow-green)" />
                  <g transform="rotate(-35 60 60)">
                    <path d="M60,32 A20,20 0 1,0 80,52 A16,16 0 1,1 60,32 Z" fill="#ffffff" filter="url(#glow-white)" />
                    <polygon points="78,33 81,40 88,40 83,44 85,51 78,47 71,51 73,44 68,40 75,40" fill="#ffffff" filter="url(#glow-white)" />
                  </g>
                </svg>
              ) : (
                /* India Ashoka Chakra Emblem */
                <svg className="svg-emblem in-emblem animate-float-slow" viewBox="0 0 120 120">
                  <defs>
                    <filter id="glow-saffron" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <circle cx="60" cy="60" r="52" fill="#ffffff" stroke="#ff9933" strokeWidth="4" filter="url(#glow-saffron)" />
                  <circle cx="60" cy="60" r="47" fill="none" stroke="#128807" strokeWidth="3.5" />
                  <g transform="translate(60, 60)" filter="url(#glow-blue)">
                    <circle r="30" fill="none" stroke="#000088" strokeWidth="2.5" />
                    <circle r="4" fill="#000088" />
                    {/* Spokes */}
                    {Array.from({ length: 24 }).map((_, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1="0"
                        x2={30 * Math.cos((i * 15 * Math.PI) / 180)}
                        y2={30 * Math.sin((i * 15 * Math.PI) / 180)}
                        stroke="#000088"
                        strokeWidth="1.2"
                      />
                    ))}
                    {/* Inner Rim Dots */}
                    {Array.from({ length: 24 }).map((_, i) => (
                      <circle
                        key={`dot-${i}`}
                        cx={28.5 * Math.cos((i * 15 + 7.5) * Math.PI / 180)}
                        cy={28.5 * Math.sin((i * 15 + 7.5) * Math.PI / 180)}
                        r="1"
                        fill="#000088"
                      />
                    ))}
                  </g>
                </svg>
              )}
            </div>

            <h2 className="celebration-title gradient-text">
              Happy Independence Day!
            </h2>
            <p className="celebration-subtitle">
              Celebrating {dateStr} — {countryName} Independence
            </p>

            <div className="celebration-divider-bar"></div>

            <p className="celebration-message">
              Loom Movies is officially live! To celebrate this special occasion, we have unlocked premium cinematic access. Stream your favorite Marvel universe movies, legendary anime, and trending dramas in multiple languages instantly.
            </p>

            <button className="btn btn-primary start-exploring-btn" onClick={handleClose}>
              <Play size={18} fill="currentColor" /> Enter Catalog & Stream
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .celebration-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(4, 4, 6, 0.9);
          backdrop-filter: blur(12px);
          z-index: 15000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        /* Confetti Container */
        .confetti-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        .confetti-particle {
          position: absolute;
          top: -20px;
          opacity: 0;
          animation: fall linear infinite;
        }
        .confetti-particle.circle {
          border-radius: 50%;
        }
        .confetti-particle.square {
          border-radius: 2px;
        }
        .confetti-particle.triangle {
          background-color: transparent !important;
          border-style: solid;
        }

        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(720deg);
            opacity: 0;
          }
        }

        /* Border Beam Conic Glow Wrapper */
        .border-beam-wrapper {
          position: relative;
          padding: 2px; /* Border thickness */
          border-radius: var(--border-radius-lg);
          background: transparent;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 255, 255, 0.03);
        }

        .border-beam-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg,
            transparent 20%,
            var(--color-primary) 35%,
            var(--color-accent) 50%,
            transparent 70%
          );
          animation: border-beam-rotate 4s linear infinite;
          z-index: 1;
          pointer-events: none;
        }

        @keyframes border-beam-rotate {
          100% {
            transform: rotate(360deg);
          }
        }

        /* Celebratory Modal Card */
        .celebration-modal {
          position: relative;
          width: 100%;
          background: #09090e;
          border-radius: calc(var(--border-radius-lg) - 2px);
          z-index: 2;
          padding: 40px 30px;
          border: none;
        }

        .modal-glow-top {
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 200px;
          background: radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%);
          filter: blur(30px);
          pointer-events: none;
        }

        .close-modal-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-dim);
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .close-modal-btn:hover {
          color: var(--color-text-main);
          background: rgba(255, 255, 255, 0.12);
          transform: rotate(90deg);
        }

        /* SVG Emblem layout */
        .emblem-container {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        .svg-emblem {
          width: 110px;
          height: 110px;
          filter: drop-shadow(0 8px 25px rgba(0,0,0,0.6));
        }

        .animate-float-slow {
          animation: float-emblem 4s ease-in-out infinite;
        }
        @keyframes float-emblem {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .celebration-title {
          font-family: var(--font-secondary);
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin-bottom: 6px;
        }

        .celebration-subtitle {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .celebration-divider-bar {
          height: 2px;
          width: 60px;
          background: var(--color-primary);
          margin: 20px auto;
          border-radius: 2px;
          box-shadow: 0 0 10px var(--color-primary);
        }

        .celebration-message {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          line-height: 1.6;
          margin-bottom: 30px;
          padding: 0 10px;
        }

        .start-exploring-btn {
          width: 100%;
          padding: 14px 28px;
          font-size: 1rem;
          border-radius: var(--border-radius-md);
        }

        @media (max-width: 500px) {
          .celebration-modal {
            padding: 30px 20px;
          }
          .celebration-title {
            font-size: 1.8rem;
          }
          .svg-emblem {
            width: 90px;
            height: 90px;
          }
        }
      `}</style>
    </div>
  );
}
