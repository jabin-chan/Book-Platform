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

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

// A single comment + its nested replies
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
        parent_id: comment.id,   // ← this is what makes it a reply
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
      {/* The comment itself */}
      <div className="flex gap-2">
        {/* indent line for visual threading */}
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

          {/* Reply button — only if logged in */}
          {user && (
            <button
              onClick={() => setReplying(!replying)}
              className="font-sans text-[10px] text-coffee-400 hover:text-coffee-600 mt-1 transition-colors"
            >
              {replying ? 'cancel' : '↩ reply'}
            </button>
          )}

          {/* Reply input */}
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

          {/* Nested replies — recursive */}
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

// Comments section per review
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

  // called when any comment or reply is posted — re-fetch to get updated tree
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
            <p className="font-sans text-[10px] text-coffee-300 italic">
              No comments yet
            </p>
          )}

          {/* Render top-level comments, each with their replies nested inside */}
          {comments.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              reviewId={reviewId}
              user={user}
              onCommentPosted={handleCommentPosted}
            />
          ))}

          {/* New top-level comment box */}
          {user && (
            <div className="flex gap-2 mt-3">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
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

export default function ReviewList({ reviews, user }) {
  if (reviews.length === 0) {
    return (
      <p className="font-sans text-xs text-coffee-400 text-center py-4">
        No reviews yet — be the first!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-coffee-50 border border-coffee-200 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-sans text-xs font-semibold text-coffee-600">
              {review.username}
            </span>
            <span className="font-sans text-xs text-coffee-400">
              {timeAgo(review.created_at)}
            </span>
          </div>

          <StarDisplay rating={review.rating} />

          <p className="font-serif text-xs text-coffee-700 mt-2 leading-relaxed">
            {review.body}
          </p>

          {/* Comments + threading live here */}
          <CommentSection reviewId={review.id} user={user} />
        </div>
      ))}
    </div>
  );
}