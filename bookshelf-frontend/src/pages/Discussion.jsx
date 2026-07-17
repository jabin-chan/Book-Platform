import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FBEDD1] flex items-center justify-center">
      <p className="text-[#4A3423] font-medium animate-pulse">Loading discussion...</p>
    </div>
  );

  if (!book) return (
    <div className="min-h-screen bg-[#FBEDD1] flex items-center justify-center">
      <p className="text-[#4A3423] font-medium">Book not found.</p>
    </div>
  );

  const avgRounded = book.avg_rating ? Math.round(book.avg_rating) : 0;

  return (
    <div className="min-h-screen bg-[#FBEDD1] px-4 md:px-8 pt-8 pb-20">
      <div className="max-w-3xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#4A3423] hover:text-[#5C7A52] mb-6 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back
        </button>

        {/* Book header — "bulletin board" */}
        <div
          className="bg-[#FFFDF4] p-6 md:p-7 mb-6"
          style={{
            border: '3px solid #4A3423',
            borderRadius: '28px 20px 30px 18px',
            boxShadow: '6px 6px 0 #4A3423',
          }}
        >
          <div className="flex flex-col sm:flex-row gap-5">
            <div
              className="w-28 h-40 sm:w-32 sm:h-44 flex-shrink-0 overflow-hidden bg-[#F5E5C9] flex items-center justify-center mx-auto sm:mx-0"
              style={{ border: '2.5px solid #4A3423', borderRadius: '16px 10px 16px 10px' }}
            >
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={36} color="#4A3423" strokeWidth={1.5} />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              {book.genre && (
                <span
                  className="inline-block text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 mb-2"
                  style={{ background: '#A3B899', color: '#33422F', border: '2px solid #4A3423', borderRadius: '10px' }}
                >
                  {book.genre}
                </span>
              )}
              <h1 className="text-2xl font-bold text-[#4A3423]" style={{ fontFamily: 'Georgia, serif' }}>
                {book.title}
              </h1>
              <p className="text-sm text-[#5C7A52] font-medium mt-0.5">{book.author}</p>

              {book.avg_rating > 0 ? (
                <p className="mt-2 text-sm flex items-center justify-center sm:justify-start gap-1">
                  <span className="text-amber-500">{'★'.repeat(avgRounded)}</span>
                  <span className="text-[#D8C69B]">{'★'.repeat(5 - avgRounded)}</span>
                  <span className="text-xs text-[#4A3423]/70 ml-1">
                    {Number(book.avg_rating).toFixed(1)} · {book.review_count} review{book.review_count !== 1 ? 's' : ''}
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-xs text-[#4A3423]/60 italic">No ratings yet — be the first!</p>
              )}

              {book.description && (
                <p className="text-sm text-[#4A3423]/80 mt-3 leading-relaxed">{book.description}</p>
              )}
            </div>
          </div>
        </div>

        <div
          className="bg-[#FFFDF6] p-5 md:p-6 mb-6"
          style={{ border: '2.5px solid #4A3423', borderRadius: '20px 26px 18px 24px', boxShadow: '4px 4px 0 #4A3423' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#5C7A52' }}>
            Write a review
          </p>
          <ReviewForm bookId={book.id} onReviewPosted={handleReviewPosted} />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#5C7A52' }}>
            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
          </p>
          <ReviewList reviews={reviews} user={user} />
        </div>
      </div>
    </div>
  );
}