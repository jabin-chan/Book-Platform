import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../api';
import ExplorePanel from '../components/ExplorePanel';

const GENRES = [
  'All', 'Fantasy', 'Sci-Fi', 'Science Fiction', 'Romance',
  'Mystery', 'Thriller', 'Nonfiction', 'Non-Fiction', 'Self-Help',
  'Memoir', 'History', 'Biography', 'Fiction', 'Literary Fiction',
  'Historical Fiction',
];

const GENRE_COLORS = {
  fantasy:             { bg: '#e8d5f5', spine: '#9b5de5' },
  'sci-fi':            { bg: '#d0eaff', spine: '#3a86ff' },
  'science fiction':   { bg: '#d0eaff', spine: '#3a86ff' },
  romance:             { bg: '#ffd6e0', spine: '#ff6b9d' },
  mystery:             { bg: '#d4f1e4', spine: '#2dc653' },
  thriller:            { bg: '#ffe5d9', spine: '#e07a5f' },
  horror:              { bg: '#f0d6f5', spine: '#7b2d8b' },
  nonfiction:          { bg: '#fff3cd', spine: '#f4a261' },
  'non-fiction':       { bg: '#fff3cd', spine: '#f4a261' },
  'self-help':         { bg: '#fff3cd', spine: '#f4a261' },
  memoir:              { bg: '#ffebc8', spine: '#e9c46a' },
  history:             { bg: '#dde5b6', spine: '#6a994e' },
  biography:           { bg: '#dde5b6', spine: '#6a994e' },
  fiction:             { bg: '#f5e6d3', spine: '#8b6b4e' },
  'literary fiction':  { bg: '#f5e6d3', spine: '#c97d4e' },
  'historical fiction':{ bg: '#dde5b6', spine: '#8b7355' },
  default:             { bg: '#f5e6d3', spine: '#8b6b4e' },
};

function getColor(genre) {
  if (!genre) return GENRE_COLORS.default;
  const first = genre.split(',')[0].trim().toLowerCase();
  return GENRE_COLORS[first] || GENRE_COLORS.default;
}

function BookTile({ book, onClick }) {
  const color = getColor(book.genre);
  const stars = Math.round(parseFloat(book.avg_rating) || 0);
  const hasCover = !!(book.cover_url || book.cover);
  const coverSrc = book.cover_url || book.cover;

  return (
    <div onClick={() => onClick(book)} className="group cursor-pointer flex flex-col items-center">
      <div
        className="relative w-24 h-32 rounded-sm transition-transform duration-200 group-hover:-translate-y-3 group-hover:shadow-xl overflow-hidden"
        style={{
          backgroundColor: color.bg,
          boxShadow: `3px 3px 0 ${color.spine}`,
          border: `2px solid ${color.spine}`,
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-3 z-10" style={{ backgroundColor: color.spine }} />

        {hasCover ? (
          <img
            src={coverSrc}
            alt={book.title}
            className="absolute top-0 bottom-0 object-cover"
            style={{ left: '12px', width: 'calc(100% - 12px)', height: '100%' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <>
            <div className="absolute top-3 left-4 right-1">
              <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: color.spine }}>
                {book.genre?.split(',')[0] || 'General'}
              </p>
            </div>
            <div className="absolute bottom-2 left-4 right-1">
              <p className="text-[9px] text-amber-500">
                {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
              </p>
              {book.review_count > 0 && (
                <p className="text-[8px] text-[#8b6b4e]">{book.review_count} reviews</p>
              )}
            </div>
          </>
        )}

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center z-20">
          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-white bg-black bg-opacity-60 px-2 py-1 rounded transition-opacity">
            View
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
}

export default function Explore({ user }) {
  const [dbBooks, setDbBooks] = useState([]);
  const [googleBooks, setGoogleBooks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [genre, setGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null); // null = not searching
  const [googlePage, setGooglePage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const debounceRef = useRef(null);

  // Load DB books on mount
  useEffect(() => {
    api.get('/books').then(res => setDbBooks(res.data)).catch(() => {});
  }, []);

  // Load Google Books when genre changes and not searching
  useEffect(() => {
    if (searchResults !== null) return; // don't interfere with search
    setGoogleBooks([]);
    setGooglePage(0);
    setHasMore(true);
    fetchGoogleBooks(0, genre);
  }, [genre]);

  const fetchGoogleBooks = async (page, currentGenre) => {
    setLoadingMore(true);
    try {
      const q = currentGenre === 'All' ? 'popular books fiction' : `subject:${currentGenre}`;
      const res = await api.get(`/books/google?q=${encodeURIComponent(q)}&startIndex=${page * 20}`);
      if (res.data.length === 0) {
        setHasMore(false);
      } else {
        setGoogleBooks(prev => page === 0 ? res.data : [...prev, ...res.data]);
        setGooglePage(page + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Search — debounced, hits both your DB and Google
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (!val.trim()) {
      setSearchResults(null); // back to browse mode
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const [dbRes, googleRes] = await Promise.all([
          api.get(`/books/search?q=${encodeURIComponent(val)}`),
          api.get(`/books/google?q=${encodeURIComponent(val)}`),
        ]);
        setSearchResults({ db: dbRes.data, google: googleRes.data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  // Infinite scroll
  const handleObserver = useCallback((entries) => {
    if (entries[0].isIntersecting && hasMore && !loadingMore && searchResults === null) {
      fetchGoogleBooks(googlePage, genre);
    }
  }, [googlePage, hasMore, loadingMore, genre, searchResults]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

// Community picks = has reviews OR was added by a real user
const communityBooks = dbBooks.filter(
    b => parseInt(b.review_count) > 0 || b.added_by !== null
  );
  
  const filteredDb = genre === 'All'
    ? communityBooks
    : communityBooks.filter(b => b.genre?.toLowerCase().includes(genre.toLowerCase()));
  const dbTitles = new Set(dbBooks.map(b => b.title.toLowerCase()));
  const filteredGoogle = googleBooks.filter(b => !dbTitles.has(b.title.toLowerCase()));

  const isSearching = searchResults !== null;

  return (
    <div className="flex min-h-screen bg-[#f5ede0]">
      <div
        className="flex-1 px-6 py-6 overflow-y-auto"
        style={{ maxWidth: selected ? 'calc(100% - 384px)' : '100%' }}
      >
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-[#3d2b1f]" style={{ fontFamily: 'Georgia, serif' }}>
            Explore the Library 📖
          </h1>
          <p className="text-sm text-[#8b6b4e] mt-0.5">Discover what everyone's reading</p>
        </div>

        {/* Search + Genre row */}
        <div className="flex gap-3 mb-6 items-center">

          {/* Search input */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b89a7a] text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search books, authors..."
              className="w-full pl-9 pr-9 py-2.5 bg-white border border-[#d6b896] rounded-xl text-[#3d2b1f] placeholder-[#b89a7a] focus:outline-none focus:ring-2 focus:ring-[#c9956a] text-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b89a7a] hover:text-[#3d2b1f] text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>

          {/* Genre dropdown — hidden while searching */}
          {!isSearching && (
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#d6b896] rounded-xl text-[#3d2b1f] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9956a] cursor-pointer"
            >
              {GENRES.map(g => (
                <option key={g} value={g}>{g === 'All' ? 'All Genres' : g}</option>
              ))}
            </select>
          )}
        </div>

        {/* SEARCH RESULTS MODE */}
        {isSearching && (
          <div>
            {loadingSearch ? (
              <p className="text-sm text-[#8b6b4e] animate-pulse">Searching...</p>
            ) : (
              <>
                {/* DB results */}
                {searchResults.db.length > 0 && (
                  <div className="mb-8">
                    <p className="text-xs font-semibold text-[#8b6b4e] uppercase tracking-widest mb-4">
                      ✨ In your community library
                    </p>
                    <div className="flex flex-wrap gap-6">
                      {searchResults.db.map(book => (
                        <BookTile key={book.id} book={book} onClick={setSelected} />
                      ))}
                    </div>
                    <div className="mt-4 h-3 bg-[#a0714f] rounded-sm shadow-md" />
                    <div className="h-2 bg-[#7a5233] mb-6" />
                  </div>
                )}

                {/* Google results */}
                {searchResults.google.length > 0 && (
                  <div className="mb-8">
                    <p className="text-xs font-semibold text-[#8b6b4e] uppercase tracking-widest mb-4">
                      📚 From the wider library
                    </p>
                    <div className="flex flex-wrap gap-6">
                      {searchResults.google
                        .filter(b => !dbTitles.has(b.title.toLowerCase()))
                        .map(book => (
                          <BookTile key={book.google_id} book={book} onClick={setSelected} />
                        ))}
                    </div>
                    <div className="mt-4 h-3 bg-[#a0714f] rounded-sm shadow-md" />
                    <div className="h-2 bg-[#7a5233] mb-6" />
                  </div>
                )}

                {searchResults.db.length === 0 && searchResults.google.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="text-[#8b6b4e] text-sm">No results for "{searchQuery}"</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* BROWSE MODE */}
        {!isSearching && (
          <>
            {/* Community picks */}
            {filteredDb.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-semibold text-[#8b6b4e] uppercase tracking-widest mb-4">
                  ✨ Community picks
                </p>
                <div className="flex flex-wrap gap-6">
                  {filteredDb.map(book => (
                    <BookTile key={book.id} book={book} onClick={setSelected} />
                  ))}
                </div>
                <div className="mt-4 h-3 bg-[#a0714f] rounded-sm shadow-md" />
                <div className="h-2 bg-[#7a5233] mb-6" />
              </div>
            )}

            {/* Google Books */}
            {filteredGoogle.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#8b6b4e] uppercase tracking-widest mb-4">
                  📚 From the wider library
                </p>
                <div className="flex flex-wrap gap-6">
                  {filteredGoogle.map(book => (
                    <BookTile key={book.google_id} book={book} onClick={setSelected} />
                  ))}
                </div>
                <div className="mt-4 h-3 bg-[#a0714f] rounded-sm shadow-md" />
                <div className="h-2 bg-[#7a5233] mb-6" />
              </div>
            )}

            {/* Infinite scroll trigger */}
            <div ref={loaderRef} className="text-center py-6">
              {loadingMore && (
                <p className="text-sm text-[#8b6b4e] animate-pulse">Loading more books...</p>
              )}
              {!hasMore && !loadingMore && (
                <p className="text-xs text-[#b89a7a]">You've reached the end of the library ☕</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right panel */}
      {selected && (
        <div className="w-96 border-l border-[#e0c9b0] bg-[#faf7f2] fixed right-0 top-0 bottom-0 overflow-y-auto z-10 shadow-xl">
          <ExplorePanel
            book={selected}
            user={user}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}