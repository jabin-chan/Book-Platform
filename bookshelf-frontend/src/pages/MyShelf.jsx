import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const TABS = [
  { value: 'all',               label: '📚 All Books' },
  { value: 'currently_reading', label: '📖 Currently Reading' },
  { value: 'want_to_read',      label: '🔖 Want to Read' },
  { value: 'finished',          label: '✅ Finished' },
];

const GENRE_COLORS = {
  fantasy:             '#9b5de5',
  'sci-fi':            '#3a86ff',
  'science fiction':   '#3a86ff',
  romance:             '#ff6b9d',
  mystery:             '#2dc653',
  thriller:            '#e07a5f',
  nonfiction:          '#f4a261',
  'non-fiction':       '#f4a261',
  'self-help':         '#f4a261',
  memoir:              '#e9c46a',
  history:             '#6a994e',
  biography:           '#6a994e',
  fiction:             '#8b6b4e',
  'literary fiction':  '#c97d4e',
  'historical fiction':'#8b7355',
  default:             '#8b6b4e',
};

function getSpineColor(genre) {
  if (!genre) return GENRE_COLORS.default;
  const key = genre.split(',')[0].trim().toLowerCase();
  return GENRE_COLORS[key] || GENRE_COLORS.default;
}

const STATUS_LABELS = {
  currently_reading: '📖 Reading',
  want_to_read:      '🔖 Want to read',
  finished:          '✅ Finished',
};

export default function MyShelf({ user }) {
  const [shelf, setShelf] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    api.get('/books/shelf')
      .then(res => setShelf(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="min-h-screen bg-[#f5ede0] flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-3">📚</p>
        <p className="text-[#8b6b4e] mb-4">Log in to see your shelf</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-[#5c3d2e] text-[#faf7f2] px-5 py-2 rounded-xl text-sm"
        >
          Log in
        </button>
      </div>
    </div>
  );

  const filtered = activeTab === 'all'
    ? shelf
    : shelf.filter(b => b.status === activeTab);

  return (
    <div className="min-h-screen bg-[#f5ede0] px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#3d2b1f]" style={{ fontFamily: 'Georgia, serif' }}>
          My Shelf
        </h1>
        <p className="text-sm text-[#8b6b4e] mt-0.5">{shelf.length} books total</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-[#5c3d2e] text-[#faf7f2]'
                : 'bg-[#f5e6d3] text-[#5c3d2e] hover:bg-[#e8d5c0]'
            }`}
          >
            {tab.label}
            <span className="ml-1 text-xs opacity-60">
              ({tab.value === 'all' ? shelf.length : shelf.filter(b => b.status === tab.value).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[#8b6b4e] animate-pulse text-sm">Loading your shelf...</p>
      ) : shelf.length === 0 ? (
        /* Empty state — no books at all */
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🕯️</p>
          <p className="text-[#8b6b4e] text-sm mb-4">Your shelf is empty</p>
          <button
            onClick={() => navigate('/explore')}
            className="bg-[#5c3d2e] text-[#faf7f2] px-5 py-2 rounded-xl text-sm hover:bg-[#3d2b1f] transition-colors"
          >
            Start Exploring →
          </button>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state — tab has no books */
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔖</p>
          <p className="text-[#8b6b4e] text-sm">
            No books in "{TABS.find(t => t.value === activeTab)?.label}" yet
          </p>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap gap-6">
            {filtered.map(book => {
              const spineColor = getSpineColor(book.genre);
              return (
                <div
                  key={book.id}
                  onClick={() => navigate(`/books/${book.book_id}/discussion`)}
                  className="group cursor-pointer flex flex-col items-center"
                >
                  <div
                    className="relative w-24 h-32 rounded-sm transition-transform duration-200 group-hover:-translate-y-3 group-hover:shadow-xl overflow-hidden"
                    style={{
                      backgroundColor: spineColor + '22',
                      border: `2px solid ${spineColor}`,
                      boxShadow: `3px 3px 0 ${spineColor}`,
                    }}
                  >
                    {/* Spine */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-3 z-10"
                      style={{ backgroundColor: spineColor }}
                    />

                    {/* Cover if available */}
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
                        <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: spineColor }}>
                          {book.genre?.split(',')[0] || 'General'}
                        </p>
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute bottom-1.5 left-3 right-1 z-20">
                      <span className="text-[8px] bg-white bg-opacity-80 px-1 py-0.5 rounded text-[#3d2b1f] font-medium">
                        {STATUS_LABELS[book.status]}
                      </span>
                    </div>

                    {/* Hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center z-20">
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-white bg-black bg-opacity-60 px-2 py-1 rounded transition-opacity">
                        Discuss
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-center w-24">
                    <p className="text-[11px] font-semibold text-[#3d2b1f] leading-tight line-clamp-2" style={{ fontFamily: 'Georgia, serif' }}>
                      {book.title}
                    </p>
                    <p className="text-[10px] text-[#8b6b4e] mt-0.5 truncate">{book.author}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shelf plank */}
          <div className="mt-6 h-3 bg-[#a0714f] rounded-sm shadow-md" />
          <div className="h-2 bg-[#7a5233]" />
        </div>
      )}
    </div>
  );
}