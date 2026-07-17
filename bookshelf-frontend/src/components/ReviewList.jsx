import { useEffect, useState } from 'react';
import { Pencil, Trash2, MessageCircle, ChevronUp, ChevronDown, CornerDownRight, Send } from 'lucide-react';
import api from '../api';

function StarDisplay({ rating }) {
  return (
    <span className="text-xs">
      <span className="text-amber-500">{'★'.repeat(rating)}</span>
      <span className="text-[#D8C69B]">{'★'.repeat(5 - rating)}</span>
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
          <span className={star <= (hovered || rating) ? 'text-amber-500' : 'text-[#D8C69B]'}>
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
        <div className="w-px bg-[#D8C69B] ml-1 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-semibold text-[#4A3423]">
              {comment.username}
            </span>
            <span className="text-[10px] text-[#4A3423]/50">
              {timeAgo(comment.created_at)}
            </span>
          </div>
          <p className="text-[11px] text-[#4A3423]/90 leading-relaxed">
            {comment.body}
          </p>

          {user && (
            <button
              onClick={() => setReplying(!replying)}
              className="flex items-center gap-1 text-[10px] font-medium text-[#5C7A52] hover:text-[#4A3423] mt-1 transition-colors"
            >
              <CornerDownRight size={11} />
              {replying ? 'cancel' : 'reply'}
            </button>
          )}

          {replying && (
            <div className="mt-2 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.username}...`}
                className="flex-1 text-[11px] bg-[#FFFDF6] px-2 py-1.5 text-[#4A3423] placeholder-[#4A3423]/40 focus:outline-none"
                style={{ border: '1.5px solid #D8C69B', borderRadius: '10px' }}
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
              />
              <button
                onClick={handleReply}
                disabled={submitting || !replyText.trim()}
                className="text-[11px] font-semibold px-3 py-1.5 disabled:opacity-50 transition"
                style={{ background: '#A3B899', color: '#33422F', border: '2px solid #4A3423', borderRadius: '10px' }}
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
        className="flex items-center gap-1 text-[10px] font-semibold text-[#5C7A52] hover:text-[#4A3423] tracking-wide transition-colors"
      >
        <MessageCircle size={12} />
        {open ? 'hide replies' : 'replies'}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="mt-2 space-y-1">
          {comments.length === 0 && (
            <p className="text-[10px] text-[#4A3423]/50 italic">No replies yet</p>
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
                className="flex-1 text-[11px] bg-[#FFFDF6] px-2 py-1.5 text-[#4A3423] placeholder-[#4A3423]/40 focus:outline-none"
                style={{ border: '1.5px solid #D8C69B', borderRadius: '10px' }}
                onKeyDown={(e) => e.key === 'Enter' && handlePost()}
              />
              <button
                onClick={handlePost}
                disabled={submitting || !newComment.trim()}
                className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 disabled:opacity-50 transition"
                style={{ background: '#A3B899', color: '#33422F', border: '2px solid #4A3423', borderRadius: '10px' }}
              >
                <Send size={11} />
                {submitting ? '...' : 'Post'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
        className="w-full px-3 py-2 text-xs text-[#4A3423] bg-[#FFFDF6] resize-none focus:outline-none"
        style={{ border: '2px solid #D8C69B', borderRadius: '12px' }}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={submitting}
          className="text-xs font-semibold px-3 py-1.5 disabled:opacity-50 transition"
          style={{ background: '#A3B899', color: '#33422F', border: '2px solid #4A3423', borderRadius: '10px' }}
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="text-xs font-medium text-[#4A3423]/60 hover:text-[#4A3423] px-3 py-1.5 transition-colors"
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

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const currentUsername = user?.username;

  const handleSaveEdit = (updatedReview) => {
    setReviews(prev =>
      prev.map(r => r.id === updatedReview.id ? { ...r, ...updatedReview } : r)
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
      <p className="text-xs text-[#4A3423]/50 text-center py-6">
        No reviews yet — be the first!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isOwner = currentUsername && review.username === currentUsername;
        const isEditing = editingId === review.id;
        const isDeleting = deletingId === review.id;

        return (
          <div
            key={review.id}
            className="bg-[#FFFDF6] p-4 transition-transform hover:-translate-y-0.5"
            style={{
              border: '2.5px solid #4A3423',
              borderRadius: '20px 24px 18px 22px',
              boxShadow: '3px 3px 0 #4A3423',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#4A3423]">{review.username}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#4A3423]/50">{timeAgo(review.created_at)}</span>
                {isOwner && !isEditing && (
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      onClick={() => setEditingId(review.id)}
                      className="text-[#4A3423]/50 hover:text-[#5C7A52] transition-colors p-1"
                      title="Edit review"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={isDeleting}
                      className="text-[#4A3423]/50 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                      title="Delete review"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <StarDisplay rating={review.rating} />

            {isEditing ? (
              <EditReviewForm review={review} onSave={handleSaveEdit} onCancel={() => setEditingId(null)} />
            ) : (
              <>
                {review.body && (
                  <p className="text-xs text-[#4A3423]/90 mt-2 leading-relaxed">{review.body}</p>
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