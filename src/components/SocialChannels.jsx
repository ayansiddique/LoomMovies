import React, { useState, useEffect } from 'react';
import { Megaphone, Building2 } from 'lucide-react';
import { SOCIAL_LINKS } from '../config/social';

export default function SocialChannels({ hideTimer = false }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Calculate countdown to August 14, 2026
  useEffect(() => {
    if (hideTimer) return;
    
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
  }, [hideTimer]);

  return (
    <div className="social-channels-card glass glow-purple animate-fade-in-up">
      {/* Decorative Background Glows */}
      <div className="bg-glow-circle circle-1"></div>
      <div className="bg-glow-circle circle-2"></div>

      <div className="card-header-channels">
        <div className="badge-live">
          <span className="live-dot"></span>
          <span>{hideTimer ? 'Official Communities' : 'Official Launch Countdown'}</span>
        </div>
        <h2 className="title-channels gradient-text">Join Loom Communities</h2>
        <p className="subtitle-channels">
          {hideTimer 
            ? 'Get direct access to movies, chat groups, announcements & community news channels!' 
            : 'Get direct access to movies, updates, and community links before our official launch!'}
        </p>
      </div>

      {/* Countdown Timer Widget */}
      {!hideTimer && (
        <div className="countdown-container">
          <div className="time-block">
            <span className="time-val">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="time-lbl">Days</span>
          </div>
          <span className="time-sep">:</span>
          <div className="time-block">
            <span className="time-val">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="time-lbl">Hrs</span>
          </div>
          <span className="time-sep">:</span>
          <div className="time-block">
            <span className="time-val">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="time-lbl">Mins</span>
          </div>
          <span className="time-sep">:</span>
          <div className="time-block">
            <span className="time-val">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="time-lbl">Secs</span>
          </div>
        </div>
      )}

      <div className="channels-divider"></div>

      {/* Social Media Circular Links */}
      <div className="social-icons-row">
        {/* WhatsApp */}
        <a 
          href={SOCIAL_LINKS.whatsapp} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-btn whatsapp-glow"
          aria-label="WhatsApp"
        >
          <svg className="svg-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.908.533 3.69 1.464 5.215L2 22l4.914-1.288c1.477.804 3.16 1.293 4.935 1.293 5.524 0 10.004-4.48 10.004-10.004C21.853 6.48 17.528 2 12.004 2zm5.728 14.168c-.24.672-1.2 1.224-1.656 1.272-.456.048-.96.264-2.928-.528-2.52-1.02-4.14-3.6-4.26-3.768-.12-.168-1.008-1.344-1.008-2.568 0-1.224.636-1.824.864-2.064.228-.24.504-.3.672-.3.168 0 .336 0 .48.012.156.012.36-.048.564.444.204.504.72 1.752.78 1.884.06.12.108.264.024.432-.084.168-.168.276-.288.42-.12.144-.252.324-.36.432-.12.12-.24.252-.108.48.132.228.588.972 1.26 1.572.864.768 1.596 1.008 1.824 1.128.228.12.36.096.492-.048.132-.144.564-.66.72-.888.156-.228.312-.192.528-.108.216.084 1.368.648 1.608.768.24.12.4.18.456.288.06.096.06.564-.18 1.236z"/>
          </svg>
          <span className="btn-text">WhatsApp</span>
        </a>

        {/* Facebook */}
        <a 
          href={SOCIAL_LINKS.facebook} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-btn facebook-glow"
          aria-label="Facebook"
        >
          <svg className="svg-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
          </svg>
          <span className="btn-text">Facebook</span>
        </a>

        {/* Instagram */}
        <a 
          href={SOCIAL_LINKS.instagram} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-btn instagram-glow"
          aria-label="Instagram"
        >
          <svg className="svg-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          <span className="btn-text">Instagram</span>
        </a>
      </div>

      {/* Sub Channels (Company Channel & Official Channel) */}
      <div className="sub-channels-grid">
        {/* Company Channel */}
        <a 
          href={SOCIAL_LINKS.company} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="sub-channel-card glass hover-glow-cyan"
        >
          <div className="sub-icon-box cyan-bg">
            <Building2 size={20} />
          </div>
          <div className="sub-info">
            <h3>Company Channel</h3>
            <p>Main company network & customer support</p>
          </div>
        </a>

        {/* Official Channel */}
        <a 
          href={SOCIAL_LINKS.official} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="sub-channel-card glass hover-glow-purple"
        >
          <div className="sub-icon-box purple-bg">
            <Megaphone size={20} />
          </div>
          <div className="sub-info">
            <h3>Official News Channel</h3>
            <p>Direct updates, announcements & status alerts</p>
          </div>
        </a>
      </div>

      <style>{`
        .social-channels-card {
          position: relative;
          padding: 40px;
          border-radius: var(--border-radius-lg);
          margin: 40px auto;
          max-width: 800px;
          text-align: center;
          overflow: hidden;
          background: rgba(15, 15, 25, 0.7);
        }
        
        /* Background decorative circles */
        .bg-glow-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          z-index: 0;
          pointer-events: none;
        }
        .circle-1 {
          top: -20px;
          left: -20px;
          width: 200px;
          height: 200px;
          background: var(--color-primary);
        }
        .circle-2 {
          bottom: -20px;
          right: -20px;
          width: 250px;
          height: 250px;
          background: var(--color-accent);
        }

        .card-header-channels {
          position: relative;
          z-index: 1;
          margin-bottom: 30px;
        }
        .badge-live {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-bottom: 16px;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-secondary);
          box-shadow: 0 0 10px var(--color-secondary);
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.4; }
        }

        .title-channels {
          font-family: var(--font-secondary);
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 10px;
        }
        .subtitle-channels {
          font-size: 1rem;
          color: var(--color-text-muted);
          max-width: 550px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* Countdown */
        .countdown-container {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: 25px 0 35px;
        }
        .time-block {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--border-radius-md);
          width: 80px;
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
        }
        .time-val {
          font-family: var(--font-secondary);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--color-text-main);
          line-height: 1;
        }
        .time-lbl {
          font-size: 0.72rem;
          color: var(--color-text-dim);
          text-transform: uppercase;
          font-weight: 600;
          margin-top: 4px;
        }
        .time-sep {
          font-size: 1.8rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.2);
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .channels-divider {
          border-top: 1px solid var(--color-border);
          margin: 30px 0;
          position: relative;
        }

        /* Main social icons row */
        .social-icons-row {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 30px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .social-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--color-text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          transition: var(--transition-smooth);
        }
        .svg-icon {
          width: 50px;
          height: 50px;
          padding: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: var(--transition-smooth);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        
        /* Glow states on hover */
        .social-btn:hover {
          color: var(--color-text-main);
          transform: translateY(-5px);
        }
        .whatsapp-glow:hover .svg-icon {
          background: #25D366;
          color: #fff;
          border-color: #25D366;
          box-shadow: 0 0 25px rgba(37, 211, 102, 0.6);
        }
        .facebook-glow:hover .svg-icon {
          background: #1877F2;
          color: #fff;
          border-color: #1877F2;
          box-shadow: 0 0 25px rgba(24, 119, 242, 0.6);
        }
        .instagram-glow:hover .svg-icon {
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
          color: #fff;
          border-color: #cc2366;
          box-shadow: 0 0 25px rgba(204, 35, 102, 0.6);
        }

        /* Sub channels */
        .sub-channels-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .sub-channel-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-radius: var(--border-radius-md);
          text-decoration: none;
          text-align: left;
          transition: var(--transition-smooth);
          border: 1px solid var(--color-border);
        }
        .sub-channel-card:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.05);
        }
        .sub-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cyan-bg {
          background: rgba(6, 182, 212, 0.15);
          color: var(--color-accent);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        .purple-bg {
          background: rgba(124, 58, 237, 0.15);
          color: var(--color-primary);
          border: 1px solid rgba(124, 58, 237, 0.3);
        }
        .sub-info h3 {
          font-family: var(--font-secondary);
          font-size: 1rem;
          color: var(--color-text-main);
          margin-bottom: 4px;
        }
        .sub-info p {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          line-height: 1.3;
        }

        .hover-glow-cyan:hover {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
        }
        .hover-glow-purple:hover {
          border-color: rgba(124, 58, 237, 0.5);
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.2);
        }

        @media (max-width: 600px) {
          .sub-channels-grid {
            grid-template-columns: 1fr;
          }
          .social-channels-card {
            padding: 24px;
            margin: 24px auto;
          }
          .title-channels {
            font-size: 1.8rem;
          }
          .countdown-container {
            gap: 8px;
          }
          .time-block {
            width: 60px;
            height: 60px;
          }
          .time-val {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
}
