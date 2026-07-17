import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const STATUS_OPTIONS = [
  { value: 'currently_reading', label: '📖 Currently Reading' },
  { value: 'want_to_read',      label: '🔖 Want to Read' },
  { value: 'finished',          label: '✅ Finished' },
];

const GENRE_COLORS = {
  Fantasy:    '#9b5de5', 'Sci-Fi': '#3a86ff', Romance: '#ff6b9d',
  Mystery:    '#2dc653', Thriller: '#e07a5f', Nonfiction: '#f4a261',
  Memoir:     '#e9c46a', History:  '#6a994e', default: '#8b6b4e',
};

export default function ExplorePanel({ book, user, onClose }) {
  const [shelfStatus, setShelfStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dbBookId, setDbBookId] = useState(book.id || null);
  const navigate = useNavigate();
  const spineColor = GENRE_COLORS[book.genre] || GENRE_COLORS.default;

  // Check if this book is already on user's shelf
  useEffect(() => {
    if (!user || !dbBookId) return;
    api.get('/books/shelf')
      .then(res => {
        const found = res.data.find(sb => sb.book_id === dbBookId);
        if (found) setShelfStatus(found.status);
      })
      .catch(() => {});
  }, [user, dbBookId]);

  // Auto-save Google Book to DB if needed, returns the db book id
  const ensureInDb = async () => {
    if (dbBookId) return dbBookId;
    const res = await api.post('/books/save-from-google', {
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description,
      published_year: book.published_year,
      cover: book.cover,
    });
    setDbBookId(res.data.id);
    return res.data.id;
  };

  const handleShelf = async (status) => {
    if (!user) return alert('Log in to add to your shelf!');
    setLoading(true);
    try {
      const bookId = await ensureInDb();
      await api.post('/books/shelf', { book_id: bookId, status });
      setShelfStatus(status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromShelf = async () => {
    if (!dbBookId) return;
    setLoading(true);
    try {
      await api.delete(`/books/shelf/${dbBookId}`);
      setShelfStatus(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscuss = async () => {
    if (!user) return alert('Log in to join the discussion!');
    try {
      const bookId = await ensureInDb();
      navigate(`/books/${bookId}/discussion`);
    } catch (err) {
      console.error(err);
    }
  };

  const stars = Math.round(parseFloat(book.avg_rating) || 0);

  return (
    <div className="flex flex-col h-full">
      {/* Close button */}
      <div className="flex justify-end px-4 pt-4">
        <button onClick={onClose} className="text-[#8b6b4e] hover:text-[#3d2b1f] text-2xl leading-none">×</button>
      </div>

      {/* Book cover block */}
      <div
        className="mx-6 mb-4 rounded-xl h-36 flex items-center justify-center"
        style={{ backgroundColor: spineColor + '22', border: `2px solid ${spineColor}44` }}
      >
        {book.cover ? (
          <img src={book.cover} alt={book.title} className="h-28 rounded shadow-md object-cover" />
        ) : (
          <span className="text-5xl">📚</span>
        )}
      </div>

      <div className="px-6 flex-1 overflow-y-auto space-y-4">
        {/* Genre tag */}
        {book.genre && (
          <span
            className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: spineColor + '22', color: spineColor }}
          >
            {book.genre}
          </span>
        )}

        {/* Title + author */}
        <div>
          <h2 className="text-lg font-bold text-[#3d2b1f] leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            {book.title}
          </h2>
          <p className="text-xs text-[#8b6b4e] mt-1">
            {book.author}
            {book.published_year ? ` · ${book.published_year}` : ''}
          </p>
        </div>

        {/* Rating */}
        {stars > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
            <span className="text-xs text-[#8b6b4e]">
              {Number(book.avg_rating).toFixed(1)}
              {book.review_count > 0 && ` · ${book.review_count} reviews`}
            </span>
          </div>
        ) : (
          <p className="text-xs text-[#b89a7a]">No ratings yet — be the first!</p>
        )}

        {/* Description */}
        {book.description && (
          <p className="text-xs text-[#5c3d2e] leading-relaxed line-clamp-4">
            {book.description}
          </p>
        )}

        <hr className="border-[#e8d5c0]" />

        {/* Shelf buttons */}
        <div>
          <p className="text-xs font-semibold text-[#8b6b4e] uppercase tracking-widest mb-2">
            Add to my shelf
          </p>

          {/* If already shelved — show current status + remove option */}
          {shelfStatus && (
            <div className="mb-2 flex items-center justify-between bg-[#f5e6d3] rounded-lg px-3 py-2">
              <span className="text-xs font-medium text-[#5c3d2e]">
                {STATUS_OPTIONS.find(s => s.value === shelfStatus)?.label}
              </span>
              <button
                onClick={handleRemoveFromShelf}
                className="text-[10px] text-[#b89a7a] hover:text-red-400 transition-colors"
              >
                remove
              </button>
            </div>
          )}

          <div className="space-y-2">
            {STATUS_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleShelf(value)}
                disabled={loading}
                className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                  shelfStatus === value
                    ? 'bg-[#5c3d2e] text-[#faf7f2] border-[#5c3d2e]'
                    : 'border-[#d6b896] text-[#5c3d2e] hover:bg-[#f5e6d3]'
                }`}
              >
                {label}
                {shelfStatus === value && ' ✓'}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-[#e8d5c0]" />

        {/* Discussion button */}
        <button
          onClick={handleDiscuss}
          className="w-full bg-[#f5e6d3] hover:bg-[#e8d5c0] text-[#3d2b1f] text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          💬 Join the Discussion →
        </button>

        <div className="pb-6" />
      </div>
    </div>
  );
}