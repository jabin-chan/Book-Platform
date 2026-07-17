import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { BookOpen, Bookmark, CheckCircle2, Library, MessageCircle, LogIn } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'currently_reading', label: 'Currently Reading', icon: BookOpen },
  { value: 'want_to_read',      label: 'Want to Read',      icon: Bookmark },
  { value: 'finished',          label: 'Finished',           icon: CheckCircle2 },
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
  const [needsLogin, setNeedsLogin] = useState(false); // replaces window alert()
  const navigate = useNavigate();
  const spineColor = GENRE_COLORS[book.genre] || GENRE_COLORS.default;

  useEffect(() => {
    if (!user || !dbBookId) return;
    api.get('/books/shelf')
      .then(res => {
        const found = res.data.find(sb => sb.book_id === dbBookId);
        if (found) setShelfStatus(found.status);
      })
      .catch(() => {});
  }, [user, dbBookId]);

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
    if (!user) return setNeedsLogin(true);
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
    if (!user) return setNeedsLogin(true);
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
      <div className="flex justify-end px-4 pt-4">
        <button onClick={onClose} className="text-[#4A3423]/60 hover:text-[#4A3423] text-2xl leading-none">×</button>
      </div>

      <div
        className="mx-6 mb-4 rounded-2xl h-36 flex items-center justify-center border-[2.5px]"
        style={{ backgroundColor: spineColor + '18', borderColor: spineColor }}
      >
        {book.cover ? (
          <img src={book.cover} alt={book.title} className="h-28 rounded-md shadow-md object-cover" />
        ) : (
          <Library size={44} className="text-[#4A3423]/25" strokeWidth={1.5} />
        )}
      </div>

      <div className="px-6 flex-1 overflow-y-auto space-y-4">
        {/* Themed login prompt — replaces window alert() */}
        {needsLogin && (
          <div className="bg-[#F5E5C9] border-2 border-[#4A3423] rounded-2xl p-4 text-center">
            <p className="text-xs text-[#4A3423]/80 mb-3">
              Log in to add books to your shelf and join discussions
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-full bg-[#A3B899] text-[#33422F] border-2 border-[#4A3423] shadow-[2px_2px_0_#4A3423] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#4A3423] active:translate-y-0 active:shadow-[1px_1px_0_#4A3423] transition-all"
              >
                <LogIn size={14} />
                Log in
              </button>
              <button
                onClick={() => setNeedsLogin(false)}
                className="text-sm font-medium px-3 py-2 rounded-full text-[#4A3423]/60 hover:text-[#4A3423] transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {book.genre && (
          <span
            className="inline-block text-xs px-2.5 py-1 rounded-full font-semibold border-2"
            style={{ backgroundColor: spineColor + '18', color: spineColor, borderColor: spineColor }}
          >
            {book.genre}
          </span>
        )}

        <div>
          <h2 className="text-lg font-bold text-[#4A3423] leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            {book.title}
          </h2>
          <p className="text-xs text-[#4A3423]/60 mt-1">
            {book.author}
            {book.published_year ? ` · ${book.published_year}` : ''}
          </p>
        </div>

        {stars > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
            <span className="text-xs text-[#4A3423]/60">
              {Number(book.avg_rating).toFixed(1)}
              {book.review_count > 0 && ` · ${book.review_count} reviews`}
            </span>
          </div>
        ) : (
          <p className="text-xs text-[#4A3423]/50">No ratings yet — be the first!</p>
        )}

        {book.description && (
          <p className="text-xs text-[#4A3423]/80 leading-relaxed line-clamp-4">
            {book.description}
          </p>
        )}

        <hr className="border-[#D8C69B]" />

        <div>
          <p className="text-xs font-semibold text-[#5C7A52] uppercase tracking-widest mb-2">
            Add to my shelf
          </p>

          {shelfStatus && (
            <div className="mb-2 flex items-center justify-between bg-[#F5E5C9] rounded-xl px-3 py-2 border-2 border-[#4A3423]">
              <span className="text-xs font-medium text-[#4A3423]">
                {STATUS_OPTIONS.find(s => s.value === shelfStatus)?.label}
              </span>
              <button
                onClick={handleRemoveFromShelf}
                className="text-[10px] text-[#4A3423]/50 hover:text-red-500 transition-colors"
              >
                remove
              </button>
            </div>
          )}

          <div className="space-y-2">
            {STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleShelf(value)}
                disabled={loading}
                className={`w-full flex items-center gap-2 text-left text-xs px-3 py-2.5 rounded-xl border-2 transition-all ${
                  shelfStatus === value
                    ? 'bg-[#A3B899] text-[#33422F] border-[#4A3423] shadow-[3px_3px_0_#4A3423]'
                    : 'bg-[#FFFDF6] border-[#4A3423]/30 text-[#4A3423] hover:border-[#4A3423] hover:shadow-[2px_2px_0_#4A3423]'
                }`}
              >
                <Icon size={14} />
                {label}
                {shelfStatus === value && <CheckCircle2 size={14} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-[#D8C69B]" />

        <button
          onClick={handleDiscuss}
          className="w-full bg-[#A3B899] hover:bg-[#93A889] text-[#33422F] text-sm font-semibold py-3 rounded-xl border-2 border-[#4A3423] shadow-[3px_3px_0_#4A3423] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4A3423] active:translate-y-0 active:shadow-[1px_1px_0_#4A3423] transition-all"
        >
          <span className="flex items-center justify-center gap-2">
            <MessageCircle size={16} /> Join the Discussion →
          </span>
        </button>

        <div className="pb-6" />
      </div>
    </div>
  );
}