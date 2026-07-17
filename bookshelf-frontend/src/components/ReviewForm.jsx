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
      <p className="text-xs text-[#4A3423]/60 text-center py-3">
        <a href="/login" className="font-semibold text-[#5C7A52] underline">Sign in</a> to leave a review
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
            <span className={star <= (hovered || rating) ? 'text-amber-500' : 'text-[#D8C69B]'}>
              ★
            </span>
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs text-[#4A3423]/60 self-center ml-1">
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing'][rating]}
          </span>
        )}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What did you think? (optional)"
        rows={3}
        className="w-full px-3 py-2 text-xs text-[#4A3423] bg-[#FFFDF6] resize-none focus:outline-none"
        style={{ border: '2px solid #D8C69B', borderRadius: '12px' }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full text-xs font-semibold py-2 disabled:opacity-50 transition"
        style={{ background: '#A3B899', color: '#33422F', border: '2px solid #4A3423', borderRadius: '12px' }}
      >
        {loading ? 'Posting...' : 'Post review'}
      </button>
    </form>
  );
}