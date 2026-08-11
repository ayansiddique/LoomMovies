import React, { useState, useEffect } from 'react';
import { Star, Send, Trash2, MessageSquare, ChevronDown } from 'lucide-react';

export default function CommentsSection({ mediaId, mediaType }) {
  const storageKey = `loom_comments_${mediaType}_${mediaId}`;
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);

  // Load comments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setComments(JSON.parse(saved));
      } catch (err) {
        console.error(err);
        setComments([]);
      }
    } else {
      // Default/mock initial comments for a premium feel
      const defaultComments = [
        {
          id: 'mock-1',
          username: 'AnimeLover99',
          text: 'This was absolutely sensational! The visuals and pacing were top tier.',
          rating: 5,
          date: '2 days ago'
        },
        {
          id: 'mock-2',
          username: 'MarvelFanatic',
          text: 'One of the best titles in this collection. Can watch it over and over again.',
          rating: 4,
          date: '1 week ago'
        }
      ];
      setComments(defaultComments);
      localStorage.setItem(storageKey, JSON.stringify(defaultComments));
    }
  }, [mediaId, mediaType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      username: username.trim() || 'Guest Viewer',
      text: text.trim(),
      rating,
      date: 'Just now'
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Reset fields
    setText('');
    setUsername('');
    setRating(5);
  };

  const handleDelete = (id) => {
    const updated = comments.filter(c => c.id !== id);
    setComments(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const getAvatarColor = (name) => {
    const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  return (
    <div className="comments-section glass animate-fade-in" style={{ padding: 0 }}>
      {/* Clickable toggle header card (matches YouTube Mobile style) */}
      <div 
        className="comments-drawer-header" 
        onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
        style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', padding: '20px', gap: '8px', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h3 className="comments-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: '700' }}>
            <MessageSquare size={18} className="comment-icon" /> 
            Comments & Reviews ({comments.length})
          </h3>
          <ChevronDown 
            size={16} 
            className={`comments-chevron ${isCommentsExpanded ? 'rotated' : ''}`} 
            style={{ color: 'var(--color-text-dim)', transition: 'transform 0.2s ease' }}
          />
        </div>
        
        {/* Latest comment preview (YouTube style) */}
        {!isCommentsExpanded && comments.length > 0 && (
          <div className="comments-preview-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div 
              className="comment-avatar" 
              style={{ width: '22px', height: '22px', fontSize: '0.65rem', margin: 0, backgroundColor: getAvatarColor(comments[0].username) }}
            >
              {comments[0].username.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              {comments[0].username}:
            </span>
            <p className="comment-preview-text" style={{ fontSize: '0.82rem', color: 'var(--color-text-dim)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '65%' }}>
              {comments[0].text}
            </p>
          </div>
        )}
      </div>

      {/* Expanded Comments Content */}
      {isCommentsExpanded && (
        <div className="comments-expanded-content animate-fade-in" style={{ padding: '0 20px 20px 20px' }}>
          
          {/* Add a Review toggle button */}
          {!showForm ? (
            <button 
              onClick={() => setShowForm(true)} 
              className="btn btn-primary toggle-review-btn"
              style={{ marginBottom: '20px', width: '100%', padding: '12px' }}
            >
              Write a Review / Add Comment
            </button>
          ) : (
            /* Review Write Form */
            <form onSubmit={(e) => { handleSubmit(e); setShowForm(false); }} className="comment-form animate-fade-in">
              <div className="form-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'white' }}>Share Your Review</h4>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-dim)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600', textTransform: 'uppercase' }}
                >
                  Cancel
                </button>
              </div>
              
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Your name (e.g. MarvelFan)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="comment-input name-input glass"
                  maxLength={25}
                />
                
                {/* Star selector */}
                <div className="star-selector">
                  <span className="star-label">Rating:</span>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="star-btn"
                      >
                        <Star 
                          size={16} 
                          fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
                          className={star <= (hoverRating || rating) ? "star-filled" : "star-empty"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-area-wrapper">
                <textarea
                  placeholder="Share your thoughts about this movie/show..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="comment-textarea glass"
                  required
                  rows={3}
                  maxLength={500}
                />
                <button type="submit" className="btn btn-primary submit-comment-btn">
                  <Send size={16} /> Post Review
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-card animate-fade-in">
                  <div 
                    className="comment-avatar" 
                    style={{ backgroundColor: getAvatarColor(comment.username) }}
                  >
                    {comment.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-author">{comment.username}</span>
                      <span className="comment-date">{comment.date}</span>
                      
                      {/* Stars display */}
                      <div className="comment-stars">
                        {Array(5).fill(0).map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < comment.rating ? "currentColor" : "none"} 
                            className={i < comment.rating ? "star-filled" : "star-empty"}
                          />
                        ))}
                      </div>

                      {/* Delete Button */}
                      <button 
                        className="delete-comment-btn"
                        onClick={() => handleDelete(comment.id)}
                        title="Delete review"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .comments-section {
          border-radius: var(--border-radius-md);
          margin-top: 30px;
          overflow: hidden;
        }
        .comments-drawer-header {
          transition: background 0.2s ease;
        }
        .comments-drawer-header:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .comments-chevron.rotated {
          transform: rotate(180deg);
        }
        .comments-title {
          font-family: var(--font-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .comment-icon {
          color: var(--color-primary);
        }
        .comment-form {
          margin-bottom: 30px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: rgba(255,255,255,0.02);
          padding: 16px;
          border-radius: var(--border-radius-sm);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .form-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .comment-input {
          padding: 10px 16px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--color-border);
          color: var(--color-text-main);
          font-size: 0.9rem;
          background: rgba(0, 0, 0, 0.4);
          width: 250px;
        }
        .star-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .star-label {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }
        .stars {
          display: flex;
        }
        .star-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-warning);
          padding: 2px;
          transition: transform 0.1s ease;
        }
        .star-btn:hover {
          transform: scale(1.2);
        }
        .star-filled {
          color: var(--color-warning);
        }
        .star-empty {
          color: var(--color-text-dim);
        }
        .text-area-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .comment-textarea {
          width: 100%;
          padding: 12px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--color-border);
          color: var(--color-text-main);
          font-size: 0.9rem;
          background: rgba(0, 0, 0, 0.4);
          resize: none;
          font-family: inherit;
        }
        .submit-comment-btn {
          align-self: flex-end;
          padding: 8px 18px;
          font-size: 0.85rem;
        }
        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 8px;
        }
        .no-comments {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          text-align: center;
          padding: 20px 0;
        }
        .comment-card {
          display: flex;
          gap: 14px;
          padding: 16px;
          border-radius: var(--border-radius-sm);
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.03);
          transition: var(--transition-fast);
        }
        .comment-card:hover {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.06);
        }
        .comment-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 1.1rem;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .comment-body {
          flex: 1;
        }
        .comment-header {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 6px;
          position: relative;
        }
        .comment-author {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .comment-date {
          font-size: 0.75rem;
          color: var(--color-text-dim);
        }
        .comment-stars {
          display: flex;
          margin-left: 8px;
        }
        .delete-comment-btn {
          position: absolute;
          right: 0;
          background: none;
          border: none;
          color: var(--color-text-dim);
          cursor: pointer;
          transition: var(--transition-fast);
          opacity: 0;
        }
        .comment-card:hover .delete-comment-btn {
          opacity: 1;
        }
        .delete-comment-btn:hover {
          color: var(--color-error);
        }
        .comment-text {
          font-size: 0.88rem;
          color: var(--color-text-muted);
          line-height: 1.5;
        }
        
        @media (max-width: 600px) {
          .form-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .comment-input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
