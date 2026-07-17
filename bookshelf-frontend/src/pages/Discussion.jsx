import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';

export default function Discussion({ user }) {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/books`),
      api.get(`/books/${bookId}/reviews`),
    ]).then(([booksRes, reviewsRes]) => {
      const found = booksRes.data.find(b => b.id === parseInt(bookId));
      setBook(found || null);
      setReviews(reviewsRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [bookId]);

  const handleReviewPosted = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5ede0]">
      <p className="text-[#8b6b4e] animate-pulse">Loading discussion...</p>
    </div>
  );

  if (!book) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5ede0]">
      <p className="text-[#8b6b4e]">Book not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5ede0] px-6 py-8 max-w-2xl">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="text-xs text-[#8b6b4e] hover:text-[#3d2b1f] mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back
      </button>

      {/* Book header */}
      <div className="bg-[#faf7f2] rounded-2xl border border-[#e8d5c0] p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">📚</div>
          <div>
            <h1 className="text-xl font-bold text-[#3d2b1f]" style={{ fontFamily: 'Georgia, serif' }}>
              {book.title}
            </h1>
            <p className="text-sm text-[#8b6b4e] mt-0.5">{book.author}</p>
            {book.avg_rating > 0 && (
              <p className="mt-1 text-sm">
                <span className="text-amber-400">{'★'.repeat(Math.round(book.avg_rating))}</span>
                <span className="text-coffee-200">{'★'.repeat(5 - Math.round(book.avg_rating))}</span>
                <span className="text-xs text-[#8b6b4e] ml-1">
                  {Number(book.avg_rating).toFixed(1)} · {book.review_count} reviews
                </span>
              </p>
            )}
            {book.description && (
              <p className="text-xs text-[#5c3d2e] mt-2 leading-relaxed">{book.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Write a review */}
      <div className="bg-[#faf7f2] rounded-2xl border border-[#e8d5c0] p-5 mb-6">
        <p className="text-xs font-semibold text-[#8b6b4e] uppercase tracking-widest mb-3">
          Write a review
        </p>
        <ReviewForm bookId={book.id} onReviewPosted={handleReviewPosted} />
      </div>

      {/* All reviews */}
      <div>
        <p className="text-xs font-semibold text-[#8b6b4e] uppercase tracking-widest mb-3">
          {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
        </p>
        <ReviewList reviews={reviews} user={user} />
      </div>
    </div>
  );
}