import React, { useState, useEffect } from 'react';
import { Megaphone, Building2, Shield, Film, Sparkles } from 'lucide-react';
import { SOCIAL_LINKS } from '../config/social';

export default function PreLaunch({ onBypass }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [clickCount, setClickCount] = useState(0);

  // Countdown timer to August 14, 2026
  useEffect(() => {
    const launchDate = new Date('2026-08-14T00:00:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = launchDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      onBypass();
    }
  };

  return (
    <div className="prelaunch-page">
      {/* Decorative Background Glows */}
      <div className="glow-circle prelaunch-circle-1"></div>
      <div className="glow-circle prelaunch-circle-2"></div>
      <div className="glow-circle prelaunch-circle-3"></div>

      <div className="prelaunch-wrapper animate-fade-in-up">
        {/* Interactive Logo Header */}
        <div className="prelaunch-header">
          <div className="prelaunch-logo" onClick={handleLogoClick}>
            <Film className="film-icon-logo" />
            <h1 className="logo-title gradient-text">Loom Movies</h1>
          </div>
          <span className="prelaunch-badge">
            <Sparkles size={14} className="sparkle-icon" /> Coming Soon
          </span>
        </div>

        {/* Central Content */}
        <div className="prelaunch-content glass">
          <h2 className="launching-text">Official Launch Date: August 14, 2026</h2>
          <p className="launching-desc">
            We are hard at work putting together the final cinematic collections. 
            Connect with us on our channels to get immediate updates and releases first!
          </p>

          {/* Countdown Clock */}
          <div className="countdown-grid">
            <div className="c-block">
              <span className="c-val">{String(timeLeft.days).padStart(2, '0')}</span>
              <span className="c-label">Days</span>
            </div>
            <span className="c-sep">:</span>
            <div className="c-block">
              <span className="c-val">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="c-label">Hours</span>
            </div>
            <span className="c-sep">:</span>
            <div className="c-block">
              <span className="c-val">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="c-label">Mins</span>
            </div>
            <span className="c-sep">:</span>
            <div className="c-block">
              <span className="c-val">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="c-label">Secs</span>
            </div>
          </div>

          <div className="prelaunch-divider"></div>

          {/* Main Community Channels */}
          <h3 className="channels-section-title">Join Our Community</h3>
          <div className="social-row">
            {/* WhatsApp */}
            <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="s-btn whatsapp-btn">
              <svg className="s-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.908.533 3.69 1.464 5.215L2 22l4.914-1.288c1.477.804 3.16 1.293 4.935 1.293 5.524 0 10.004-4.48 10.004-10.004C21.853 6.48 17.528 2 12.004 2zm5.728 14.168c-.24.672-1.2 1.224-1.656 1.272-.456.048-.96.264-2.928-.528-2.52-1.02-4.14-3.6-4.26-3.768-.12-.168-1.008-1.344-1.008-2.568 0-1.224.636-1.824.864-2.064.228-.24.504-.3.672-.3.168 0 .336 0 .48.012.156.012.36-.048.564.444.204.504.72 1.752.78 1.884.06.12.108.264.024.432-.084.168-.168.276-.288.42-.12.144-.252.324-.36.432-.12.12-.24.252-.108.48.132.228.588.972 1.26 1.572.864.768 1.596 1.008 1.824 1.128.228.12.36.096.492-.048.132-.144.564-.66.72-.888.156-.228.312-.192.528-.108.216.084 1.368.648 1.608.768.24.12.4.18.456.288.06.096.06.564-.18 1.236z"/>
              </svg>
              <span>WhatsApp</span>
            </a>

            {/* Facebook */}
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="s-btn facebook-btn">
              <svg className="s-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
              <span>Facebook</span>
            </a>

            {/* Instagram */}
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="s-btn instagram-btn">
              <svg className="s-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              <span>Instagram</span>
            </a>
          </div>

          {/* Sub Channels Grid */}
          <div className="sub-row">
            <a href={SOCIAL_LINKS.company} target="_blank" rel="noopener noreferrer" className="sub-card glass">
              <div className="sub-i-box cyan-bg-dim">
                <Building2 size={18} />
              </div>
              <div className="sub-text">
                <h4>Company Channel</h4>
                <p>Corporate status & customer help</p>
              </div>
            </a>

            <a href={SOCIAL_LINKS.official} target="_blank" rel="noopener noreferrer" className="sub-card glass">
              <div className="sub-i-box purple-bg-dim">
                <Megaphone size={18} />
              </div>
              <div className="sub-text">
                <h4>Official News</h4>
                <p>Instant announcements & alerts</p>
              </div>
            </a>
          </div>
        </div>

        {/* Footer Warning / Bypass Note */}
        <div className="prelaunch-footer">
          <div className="security-notice">
            <Shield size={14} className="shield-icon" />
            <span>Secure Cinematic Stream Protocol Enabled</span>
          </div>
          {clickCount > 0 && clickCount < 5 && (
            <p className="bypass-hint animate-fade-in">Logo clicked {clickCount}/5 times to bypass preview...</p>
          )}
        </div>
      </div>

      <style>{`
        .prelaunch-page {
          min-height: 100vh;
          width: 100vw;
          background-color: var(--color-bg-deep);
          color: var(--color-text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
        }

        /* Ambient Glowing Circles */
        .glow-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.18;
          pointer-events: none;
          z-index: 1;
        }
        .prelaunch-circle-1 {
          top: -10%;
          left: -10%;
          width: 45vw;
          height: 45vw;
          background: var(--color-primary);
        }
        .prelaunch-circle-2 {
          bottom: -10%;
          right: -10%;
          width: 50vw;
          height: 50vw;
          background: var(--color-accent);
        }
        .prelaunch-circle-3 {
          top: 30%;
          left: 40%;
          width: 30vw;
          height: 30vw;
          background: var(--color-secondary);
          opacity: 0.12;
        }

        .prelaunch-wrapper {
          width: 100%;
          max-width: 680px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
          z-index: 2;
        }

        .prelaunch-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }

        .prelaunch-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .prelaunch-logo:active {
          transform: scale(0.95);
        }
        .film-icon-logo {
          width: 38px;
          height: 38px;
          color: var(--color-primary);
          filter: drop-shadow(0 0 10px var(--color-primary));
          animation: logo-spin 6s linear infinite;
        }
        @keyframes logo-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .logo-title {
          font-family: var(--font-secondary);
          font-size: 2.8rem;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .prelaunch-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(124, 58, 237, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(124, 58, 237, 0.3);
          padding: 4px 14px;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .sparkle-icon {
          animation: beat 1.5s infinite;
        }

        .prelaunch-content {
          padding: 36px;
          border-radius: var(--border-radius-lg);
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(10, 10, 15, 0.7);
        }

        .launching-text {
          font-family: var(--font-secondary);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--color-text-main);
          margin-bottom: 8px;
        }

        .launching-desc {
          font-size: 0.92rem;
          color: var(--color-text-muted);
          line-height: 1.5;
          margin-bottom: 28px;
        }

        /* Countdown clock */
        .countdown-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .c-block {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          width: 72px;
          height: 72px;
          border-radius: var(--border-radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        .c-val {
          font-family: var(--font-secondary);
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--color-text-main);
          line-height: 1;
        }
        .c-label {
          font-size: 0.65rem;
          color: var(--color-text-dim);
          text-transform: uppercase;
          font-weight: 600;
          margin-top: 4px;
        }
        .c-sep {
          font-size: 1.6rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.2);
          animation: blink 1s infinite;
        }

        .prelaunch-divider {
          border-top: 1px solid var(--color-border);
          margin: 28px 0;
        }

        .channels-section-title {
          font-family: var(--font-secondary);
          font-size: 1.1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-dim);
          margin-bottom: 18px;
        }

        /* Social actions */
        .social-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .s-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: var(--border-radius-sm);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-muted);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: var(--transition-smooth);
        }
        .s-btn:hover {
          color: #fff;
          transform: translateY(-2px);
        }
        .s-icon {
          width: 18px;
          height: 18px;
        }

        .whatsapp-btn:hover {
          background: #25D366;
          border-color: #25D366;
          box-shadow: 0 0 15px rgba(37, 211, 102, 0.4);
        }
        .facebook-btn:hover {
          background: #1877F2;
          border-color: #1877F2;
          box-shadow: 0 0 15px rgba(24, 119, 242, 0.4);
        }
        .instagram-btn:hover {
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
          border-color: #cc2366;
          box-shadow: 0 0 15px rgba(204, 35, 102, 0.4);
        }

        /* Sub channels */
        .sub-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .sub-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border-radius: var(--border-radius-md);
          text-decoration: none;
          text-align: left;
          transition: var(--transition-smooth);
          border: 1px solid var(--color-border);
        }
        .sub-card:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }
        .sub-i-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cyan-bg-dim {
          background: rgba(6, 182, 212, 0.12);
          color: var(--color-accent);
        }
        .purple-bg-dim {
          background: rgba(124, 58, 237, 0.12);
          color: var(--color-primary);
        }
        .sub-text h4 {
          font-family: var(--font-secondary);
          font-size: 0.9rem;
          color: var(--color-text-main);
          margin-bottom: 2px;
        }
        .sub-text p {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          line-height: 1.3;
        }

        .prelaunch-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          font-size: 0.75rem;
          color: var(--color-text-dim);
        }
        .security-notice {
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0.7;
        }
        .shield-icon {
          color: var(--color-success);
        }
        .bypass-hint {
          color: var(--color-accent);
          font-weight: 500;
        }

        @media (max-width: 600px) {
          .prelaunch-content {
            padding: 24px;
          }
          .sub-row {
            grid-template-columns: 1fr;
          }
          .logo-title {
            font-size: 2.2rem;
          }
          .c-block {
            width: 58px;
            height: 58px;
          }
          .c-val {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
}
