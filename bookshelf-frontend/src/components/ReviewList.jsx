import { useEffect, useState } from 'react';
import api from '../api';

function StarDisplay({ rating }) {
  return (
    <span className="text-xs">
      <span className="text-amber-400">{'★'.repeat(rating)}</span>
      <span className="text-coffee-200">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

function StarPicker({ rating, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="text-xl leading-none transition"
        >
          <span className={star <= (hovered || rating) ? 'text-amber-400' : 'text-coffee-200'}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function CommentNode({ comment, reviewId, user, onCommentPosted }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/reviews/${reviewId}/comments`, {
        body: replyText,
        parent_id: comment.id,
      });
      onCommentPosted(res.data);
      setReplyText('');
      setReplying(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <div className="w-px bg-coffee-200 ml-1 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-sans text-[11px] font-semibold text-coffee-600">
              {comment.username}
            </span>
            <span className="font-sans text-[10px] text-coffee-300">
              {timeAgo(comment.created_at)}
            </span>
          </div>
          <p className="font-sans text-[11px] text-coffee-600 leading-relaxed">
            {comment.body}
          </p>

          {user && (
            <button
              onClick={() => setReplying(!replying)}
              className="font-sans text-[10px] text-coffee-400 hover:text-coffee-600 mt-1 transition-colors"
            >
              {replying ? 'cancel' : '↩ reply'}
            </button>
          )}

          {replying && (
            <div className="mt-2 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.username}...`}
                className="flex-1 text-[11px] bg-white border border-coffee-200 rounded-lg px-2 py-1.5 text-coffee-700 placeholder-coffee-300 focus:outline-none focus:ring-1 focus:ring-coffee-300"
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
              />
              <button
                onClick={handleReply}
                disabled={submitting || !replyText.trim()}
                className="text-[11px] bg-[#5c3d2e] text-[#faf7f2] px-3 py-1.5 rounded-lg disabled:opacity-50 hover:bg-[#3d2b1f] transition-colors"
              >
                {submitting ? '...' : 'Send'}
              </button>
            </div>
          )}

          {comment.replies?.length > 0 && (
            <div className="ml-2 mt-1 space-y-1">
              {comment.replies.map((reply) => (
                <CommentNode
                  key={reply.id}
                  comment={reply}
                  reviewId={reviewId}
                  user={user}
                  onCommentPosted={onCommentPosted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentSection({ reviewId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    api.get(`/reviews/${reviewId}/comments`)
      .then(res => setComments(res.data))
      .catch(() => setComments([]));
  }, [open, reviewId]);

  const handleCommentPosted = async () => {
    const res = await api.get(`/reviews/${reviewId}/comments`);
    setComments(res.data);
  };

  const handlePost = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/reviews/${reviewId}/comments`, { body: newComment, parent_id: null });
      setNewComment('');
      handleCommentPosted();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="font-sans text-[10px] text-coffee-400 hover:text-coffee-600 tracking-wide transition-colors"
      >
        {open ? '▲ hide replies' : '💬 replies'}
      </button>

      {open && (
        <div className="mt-2 space-y-1">
          {comments.length === 0 && (
            <p className="font-sans text-[10px] text-coffee-300 italic">No replies yet</p>
          )}

          {comments.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              reviewId={reviewId}
              user={user}
              onCommentPosted={handleCommentPosted}
            />
          ))}

          {user && (
            <div className="flex gap-2 mt-3">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 text-[11px] bg-white border border-coffee-200 rounded-lg px-2 py-1.5 text-coffee-700 placeholder-coffee-300 focus:outline-none focus:ring-1 focus:ring-coffee-300"
                onKeyDown={(e) => e.key === 'Enter' && handlePost()}
              />
              <button
                onClick={handlePost}
                disabled={submitting || !newComment.trim()}
                className="text-[11px] bg-[#5c3d2e] text-[#faf7f2] px-3 py-1.5 rounded-lg disabled:opacity-50 hover:bg-[#3d2b1f] transition-colors"
              >
                {submitting ? '...' : 'Post'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Inline edit form — shows inside the review card
function EditReviewForm({ review, onSave, onCancel }) {
  const [rating, setRating] = useState(review.rating);
  const [body, setBody] = useState(review.body || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!rating) { setError('Please pick a rating'); return; }
    setSubmitting(true);
    try {
      const res = await api.put(`/reviews/${review.id}`, { rating, body });
      onSave(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <StarPicker rating={rating} onChange={setRating} />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Update your thoughts... (optional)"
        rows={3}
        className="w-full border border-coffee-200 rounded px-3 py-2 font-sans text-xs text-coffee-700 bg-white resize-none focus:outline-none focus:border-coffee-400"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={submitting}
          className="text-xs bg-[#5c3d2e] text-[#faf7f2] px-3 py-1.5 rounded-lg hover:bg-[#3d2b1f] transition-colors disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-coffee-400 hover:text-coffee-600 px-3 py-1.5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ReviewList({ reviews: initialReviews, user }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // keep in sync if parent re-fetches
  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const currentUsername = user?.username;

  const handleSaveEdit = (updatedReview) => {
    setReviews(prev =>
      prev.map(r => r.id === updatedReview.id
        ? { ...r, ...updatedReview }
        : r
      )
    );
    setEditingId(null);
  };

  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm('Delete this review? This cannot be undone.');
    if (!confirmed) return;
    
    setDeletingId(reviewId);
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <p className="font-sans text-xs text-coffee-400 text-center py-4">
        No reviews yet — be the first!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => {
        const isOwner = currentUsername && review.username === currentUsername;
        const isEditing = editingId === review.id;
        const isDeleting = deletingId === review.id;

        return (
          <div
            key={review.id}
            className="bg-coffee-50 border border-coffee-200 rounded-lg p-3"
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-1">
              <span className="font-sans text-xs font-semibold text-coffee-600">
                {review.username}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs text-coffee-400">
                  {timeAgo(review.created_at)}
                </span>
                {/* Edit + delete — only for your own reviews */}
                {isOwner && !isEditing && (
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      onClick={() => setEditingId(review.id)}
                      className="text-[10px] text-coffee-400 hover:text-coffee-600 transition-colors px-1"
                      title="Edit review"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={isDeleting}
                      className="text-[10px] text-coffee-400 hover:text-red-400 transition-colors px-1 disabled:opacity-50"
                      title="Delete review"
                    >
                      {isDeleting ? '...' : '🗑️'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Star rating */}
            <StarDisplay rating={review.rating} />

            {/* Body or inline edit form */}
            {isEditing ? (
              <EditReviewForm
                review={review}
                onSave={handleSaveEdit}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                {review.body && (
                  <p className="font-serif text-xs text-coffee-700 mt-2 leading-relaxed">
                    {review.body}
                  </p>
                )}
                <CommentSection reviewId={review.id} user={user} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}