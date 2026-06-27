import { useEffect, useState } from 'react';
import api from '../api';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';

const SPINE_COLORS = [
  'bg-amber-50', 'bg-orange-50', 'bg-yellow-50',
  'bg-stone-100', 'bg-rose-50',  'bg-sky-50',
];

export default function BookPanel({ book, user }) {  //added user here
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!book) return;
    setLoading(true);
    api.get(`/books/${book.id}/reviews`)
      .then(res => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [book?.id]);

  const handleReviewPosted = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
  };

  if (!book) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="font-sans text-xs text-coffee-300">
          ← Click a book to see details
        </p>
      </div>
    );
  }

  const colorIndex = book.title.charCodeAt(0) % SPINE_COLORS.length;

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
      <div className={`${SPINE_COLORS[colorIndex]} rounded-lg h-32 flex items-center justify-center text-5xl`}>
        📚
      </div>

      <div>
        {book.genre && (
          <span className="inline-block bg-coffee-100 text-coffee-600 font-sans text-xs px-2 py-0.5 rounded-full mb-2">
            {book.genre}
          </span>
        )}
        <h2 className="font-serif text-coffee-800 text-lg leading-tight">{book.title}</h2>
        <p className="font-sans text-coffee-400 text-xs mt-0.5">
          {book.author}{book.published_year ? ` · ${book.published_year}` : ''}
        </p>

        {book.avg_rating ? (
          <p className="mt-1 text-sm">
            <span className="text-amber-400">{'★'.repeat(Math.round(book.avg_rating))}</span>
            <span className="text-coffee-200">{'★'.repeat(5 - Math.round(book.avg_rating))}</span>
            <span className="font-sans text-xs text-coffee-400 ml-1">
              {Number(book.avg_rating).toFixed(1)} · {book.review_count} review{book.review_count !== '1' ? 's' : ''}
            </span>
          </p>
        ) : (
          <p className="font-sans text-xs text-coffee-300 mt-1">No ratings yet</p>
        )}
      </div>

      {book.description && (
        <p className="font-sans text-xs text-coffee-500 leading-relaxed">{book.description}</p>
      )}

      <hr className="border-coffee-200" />

      <div>
        <p className="font-sans text-xs text-coffee-400 tracking-widest uppercase mb-3">Reviews</p>
        {loading
          ? <p className="font-sans text-xs text-coffee-300">Loading...</p>
          : <ReviewList reviews={reviews} user={user} />  /* ← pass user here */
        }
      </div>

      <hr className="border-coffee-200" />

      <div>
        <p className="font-sans text-xs text-coffee-400 tracking-widest uppercase mb-3">Write a review</p>
        <ReviewForm bookId={book.id} onReviewPosted={handleReviewPosted} />
      </div>
    </div>
  );
}