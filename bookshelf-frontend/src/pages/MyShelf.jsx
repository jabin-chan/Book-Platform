import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { getGenreColor } from '../utils/genreColors';
import {
  Library, BookOpen, Bookmark, CheckCircle2,
  Flame, LogIn, MessageCircle, X,
} from 'lucide-react';

const TABS = [
  { value: 'all',               label: 'All Books',        icon: Library },
  { value: 'currently_reading', label: 'Currently Reading', icon: BookOpen },
  { value: 'want_to_read',      label: 'Want to Read',      icon: Bookmark },
  { value: 'finished',          label: 'Finished',           icon: CheckCircle2 },
];

const STATUS_META = {
  currently_reading: { label: 'Reading',      icon: BookOpen },
  want_to_read:      { label: 'Want to read', icon: Bookmark },
  finished:          { label: 'Finished',      icon: CheckCircle2 },
};

function ShelfTile({ book, onClick }) {
  const color = getGenreColor(book.genre);
  const status = STATUS_META[book.status];
  const StatusIcon = status?.icon;

  return (
    <div onClick={() => onClick(book)} className="group cursor-pointer flex flex-col items-center">
      <div
        className="relative w-24 h-32 rounded-md transition-transform duration-200 group-hover:-translate-y-2 overflow-hidden"
        style={{
          backgroundColor: color.bg,
          border: `2.5px solid ${color.spine}`,
          boxShadow: `4px 4px 0 ${color.spine}`,
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-3 z-10" style={{ backgroundColor: color.spine }} />

        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="absolute top-0 bottom-0 object-cover"
            style={{ left: '12px', width: 'calc(100% - 12px)', height: '100%' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="absolute top-3 left-4 right-1">
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: color.spine }}>
              {book.genre?.split(',')[0] || 'General'}
            </p>
          </div>
        )}

        {StatusIcon && (
          <div className="absolute bottom-1.5 left-3 right-1 z-20">
            <span className="flex items-center gap-1 text-[8px] bg-[#FFFDF6] bg-opacity-90 px-1.5 py-0.5 rounded-full text-[#4A3423] font-medium w-fit border border-[#4A3423]/20">
              <StatusIcon size={9} />
              {status.label}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center z-20">
          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-white bg-black bg-opacity-60 px-2 py-1 rounded-full transition-opacity">
            View
          </span>
        </div>
      </div>

      <div className="mt-2 text-center w-24">
        <p className="text-[11px] font-semibold text-[#4A3423] leading-tight line-clamp-2" style={{ fontFamily: 'Georgia, serif' }}>
          {book.title}
        </p>
        <p className="text-[10px] text-[#4A3423]/60 mt-0.5 truncate">{book.author}</p>
      </div>
    </div>
  );
}

function ShelfPanel({ book, onClose, onStatusChange, onRemove }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const color = getGenreColor(book.genre);

  const changeStatus = async (status) => {
    setLoading(true);
    try {
      await api.post('/books/shelf', { book_id: book.book_id, status });
      onStatusChange(book.book_id, status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    setLoading(true);
    try {
      await api.delete(`/books/shelf/${book.book_id}`);
      onRemove(book.book_id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end px-4 pt-4">
        <button onClick={onClose} className="text-[#4A3423]/60 hover:text-[#4A3423]">
          <X size={22} />
        </button>
      </div>

      <div
        className="mx-6 mb-4 rounded-2xl h-36 flex items-center justify-center border-[2.5px]"
        style={{ backgroundColor: color.bg, borderColor: color.spine }}
      >
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="h-28 rounded-md shadow-md object-cover" />
        ) : (
          <Library size={44} style={{ color: color.spine }} strokeWidth={1.5} />
        )}
      </div>

      <div className="px-6 flex-1 overflow-y-auto space-y-4">
        {book.genre && (
          <span
            className="inline-block text-xs px-2.5 py-1 rounded-full font-semibold border-2"
            style={{ backgroundColor: color.bg, color: color.spine, borderColor: color.spine }}
          >
            {book.genre}
          </span>
        )}

        <div>
          <h2 className="text-lg font-bold text-[#4A3423] leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            {book.title}
          </h2>
          <p className="text-xs text-[#4A3423]/60 mt-1">{book.author}</p>
        </div>

        <hr className="border-[#D8C69B]" />

        <div>
          <p className="text-xs font-semibold text-[#5C7A52] uppercase tracking-widest mb-2">
            Reading status
          </p>
          <div className="space-y-2">
            {Object.entries(STATUS_META).map(([value, { label, icon: Icon }]) => (
              <button
                key={value}
                onClick={() => changeStatus(value)}
                disabled={loading}
                className={`w-full flex items-center gap-2 text-left text-xs px-3 py-2.5 rounded-xl border-2 transition-all ${
                  book.status === value
                    ? 'bg-[#A3B899] text-[#33422F] border-[#4A3423] shadow-[3px_3px_0_#4A3423]'
                    : 'bg-[#FFFDF6] border-[#4A3423]/30 text-[#4A3423] hover:border-[#4A3423] hover:shadow-[2px_2px_0_#4A3423]'
                }`}
              >
                <Icon size={14} />
                {label}
                {book.status === value && <CheckCircle2 size={14} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={remove}
          disabled={loading}
          className="w-full text-xs text-[#4A3423]/50 hover:text-red-500 py-1.5 transition-colors"
        >
          Remove from shelf
        </button>

        <hr className="border-[#D8C69B]" />

        <button
          onClick={() => navigate(`/books/${book.book_id}/discussion`)}
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

export default function MyShelf({ user }) {
  const [shelf, setShelf] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    api.get('/books/shelf')
      .then(res => setShelf(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleStatusChange = (bookId, status) => {
    setShelf(prev => prev.map(b => b.book_id === bookId ? { ...b, status } : b));
    setSelected(prev => prev && prev.book_id === bookId ? { ...prev, status } : prev);
  };

  const handleRemove = (bookId) => {
    setShelf(prev => prev.filter(b => b.book_id !== bookId));
  };

  if (!user) return (
    <div className="min-h-screen bg-[#FBEDD1] flex items-center justify-center px-4">
      <div
        className="text-center bg-[#FFFDF6] px-10 py-10 max-w-sm"
        style={{
          borderRadius: '26px 18px 28px 20px',
          border: '3.5px solid #4A3423',
          boxShadow: '6px 6px 0 rgba(74,52,35,0.9)',
        }}
      >
        <Library size={40} className="mx-auto mb-3 text-[#4A3423]/40" strokeWidth={1.5} />
        <p className="text-[#4A3423] font-medium mb-4">Log in to see your shelf</p>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 bg-[#A3B899] hover:bg-[#93A889] text-[#33422F] font-semibold px-5 py-2.5 rounded-full border-2 border-[#4A3423] shadow-[3px_3px_0_#4A3423] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4A3423] active:translate-y-0 active:shadow-[1px_1px_0_#4A3423] transition-all text-sm"
        >
          <LogIn size={15} />
          Log in
        </button>
      </div>
    </div>
  );

  const filtered = activeTab === 'all'
    ? shelf
    : shelf.filter(b => b.status === activeTab);

  return (
    <div className="min-h-screen bg-[#FBEDD1] px-6 py-8">
      <div
        className="flex-1"
        style={{ maxWidth: selected ? 'calc(100% - 384px)' : '100%' }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#4A3423] flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
            <Library size={22} /> My Shelf
          </h1>
          <p className="text-sm text-[#4A3423]/60 mt-0.5">{shelf.length} books total</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(({ value, label, icon: Icon }) => {
            const active = activeTab === value;
            const count = value === 'all' ? shelf.length : shelf.filter(b => b.status === value).length;
            return (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={
                  active
                    ? 'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-[#A3B899] text-[#33422F] border-2 border-[#4A3423] shadow-[3px_3px_0_#4A3423]'
                    : 'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-[#FFFDF6] text-[#4A3423] border-2 border-[#D8C69B] hover:border-[#4A3423] transition-colors'
                }
              >
                <Icon size={14} />
                {label}
                <span className="text-xs opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <p className="text-[#4A3423]/60 animate-pulse text-sm">Loading your shelf...</p>
        ) : shelf.length === 0 ? (
          <div className="text-center py-16">
            <Flame size={40} className="mx-auto mb-3 text-[#4A3423]/30" strokeWidth={1.5} />
            <p className="text-[#4A3423]/60 text-sm mb-4">Your shelf is empty</p>
            <button
              onClick={() => navigate('/explore')}
              className="inline-flex items-center gap-2 bg-[#A3B899] hover:bg-[#93A889] text-[#33422F] font-semibold px-5 py-2.5 rounded-full border-2 border-[#4A3423] shadow-[3px_3px_0_#4A3423] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4A3423] active:translate-y-0 active:shadow-[1px_1px_0_#4A3423] transition-all text-sm"
            >
              Start Exploring →
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark size={40} className="mx-auto mb-3 text-[#4A3423]/30" strokeWidth={1.5} />
            <p className="text-[#4A3423]/60 text-sm">
              No books in "{TABS.find(t => t.value === activeTab)?.label}" yet
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap gap-6">
              {filtered.map(book => (
                <ShelfTile key={book.id} book={book} onClick={setSelected} />
              ))}
            </div>

            <div className="mt-6 h-3 bg-[#a0714f] rounded-sm shadow-md" />
            <div className="h-2 bg-[#7a5233]" />
          </div>
        )}
      </div>

      {/* Right panel — only route to Discussion from inside here */}
      {selected && (
        <div className="w-96 border-l-[3px] border-[#4A3423] bg-[#FFFDF6] fixed right-0 top-16 bottom-0 overflow-y-auto z-10 shadow-[-6px_0_0_rgba(74,52,35,0.08)]">
          <ShelfPanel
            book={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
            onRemove={handleRemove}
          />
        </div>
      )}
    </div>
  );
}