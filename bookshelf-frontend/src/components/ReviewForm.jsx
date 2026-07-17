//star rating + text form
import { useState } from 'react';
import api from '../api';

export default function ReviewForm({ bookId, onReviewPosted }) {
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [body, setBody]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) { setError('Please pick a star rating'); return; }
    // ← removed the body length check, that's it

    setLoading(true);
    try {
      const res = await api.post(`/books/${bookId}/reviews`, { rating, body });
      onReviewPosted(res.data);
      setRating(0);
      setBody('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post review');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <p className="font-sans text-xs text-coffee-400 text-center py-3">
        <a href="/login" className="text-coffee-600 underline">Sign in</a> to leave a review
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* star picker */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="text-2xl leading-none transition"
          >
            <span className={star <= (hovered || rating) ? 'text-amber-400' : 'text-coffee-200'}>
              ★
            </span>
          </button>
        ))}
        {rating > 0 && (
          <span className="font-sans text-xs text-coffee-400 self-center ml-1">
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing'][rating]}
          </span>
        )}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What did you think? (optional)"  /* ← updated placeholder */
        rows={3}
        className="w-full border border-coffee-200 rounded px-3 py-2 font-sans text-xs text-coffee-700 bg-coffee-50 resize-none focus:outline-none focus:border-coffee-400"
      />

      {error && (
        <p className="font-sans text-xs text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-coffee-600 text-coffee-100 font-sans text-xs py-2 rounded hover:bg-coffee-700 transition disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Post review'}
      </button>
    </form>
  );
}