import { Film, Heart } from 'lucide-react';
import { SOCIAL_LINKS } from '../config/social';

export default function Footer() {
  return (
    <footer className="footer glass">
      <div className="footer-content">
        {/* Brand description */}
        <div className="footer-brand-col">
          <div className="footer-logo">
            <span className="footer-logo-text gradient-text">Loom Movies</span>
          </div>
          <p className="footer-desc">
            Your premium destination for Marvel universe adventures, heartwarming Korean dramas, and legendary Japanese Anime. Stream in multiple languages instantly.
          </p>
        </div>

        {/* Categories Quick Links */}
        <div className="footer-links-col">
          <h4>Categories</h4>
          <ul>
            <li><a href="#marvel">Marvel Universe</a></li>
            <li><a href="#anime">Anime World</a></li>
            <li><a href="#kdrama">Korean Dramas</a></li>
            <li><a href="#hollywood">Hollywood Blockbusters</a></li>
          </ul>
        </div>

        {/* Communities Quick Links */}
        <div className="footer-links-col">
          <h4>Community</h4>
          <ul>
            <li><a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Channel</a></li>
            <li><a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer">Facebook Group</a></li>
            <li><a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram Profile</a></li>
            <li><a href={SOCIAL_LINKS.company} target="_blank" rel="noopener noreferrer">Company Channel</a></li>
            <li><a href={SOCIAL_LINKS.official} target="_blank" rel="noopener noreferrer">Official Updates</a></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p className="copyright">&copy; {new Date().getFullYear()} Loom Movies. All rights reserved.</p>
        <p className="credit">
          Made with <Heart size={12} className="heart-icon" /> for the ultimate viewing experience.
        </p>
      </div>

      <style>{`
        .footer {
          margin-top: 60px;
          border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
          border-bottom: none;
          border-left: none;
          border-right: none;
          padding: 60px 8% 30px;
        }
        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        .footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-logo-img {
          height: 32px;
          width: 32px;
          object-fit: cover;
          border-radius: 50%;
          filter: drop-shadow(0 0 5px rgba(6, 182, 212, 0.6));
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
        }
        .footer-logo-text {
          font-size: 1.3rem;
          font-weight: 800;
          font-family: var(--font-secondary);
        }
        .footer-desc {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          line-height: 1.6;
          max-width: 400px;
        }
        .footer-links-col h4 {
          font-family: var(--font-secondary);
          font-size: 1rem;
          margin-bottom: 20px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-main);
        }
        .footer-links-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-links-col a, .footer-static-link {
          font-size: 0.88rem;
          color: var(--color-text-muted);
          text-decoration: none;
          transition: var(--transition-fast);
        }
        .footer-links-col a:hover {
          color: var(--color-primary);
          padding-left: 4px;
        }
        .footer-static-link {
          cursor: default;
        }
        .footer-bottom {
          border-top: 1px solid var(--color-border);
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: var(--color-text-dim);
          flex-wrap: wrap;
          gap: 16px;
        }
        .heart-icon {
          color: var(--color-secondary);
          display: inline;
          animation: beat 1.5s infinite;
        }
        @keyframes beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
          .footer-brand-col {
            grid-column: 1 / -1;
            text-align: center;
            align-items: center;
          }
          .footer-brand-col .footer-desc {
            margin: 0 auto;
          }
          .footer {
            padding: 40px 5% 20px;
          }
        }
      `}</style>
    </footer>
  );
}
