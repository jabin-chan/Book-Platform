import { getGenreColor } from '../utils/genreColors';
import { useEffect, useState, useRef, useCallback } from 'react';
import { BookOpen, Search, Sparkles, Library, Coffee, SearchX, X } from 'lucide-react';
import api from '../api';
import ExplorePanel from '../components/ExplorePanel';

const GENRES = [
  'All', 'Fantasy', 'Sci-Fi', 'Science Fiction', 'Romance',
  'Mystery', 'Thriller', 'Nonfiction', 'Non-Fiction', 'Self-Help',
  'Memoir', 'History', 'Biography', 'Fiction', 'Literary Fiction',
  'Historical Fiction',
];

function BookTile({ book, onClick }) {
  const color = getGenreColor(book.genre);
  const stars = Math.round(parseFloat(book.avg_rating) || 0);
  const hasCover = !!(book.cover_url || book.cover);
  const coverSrc = book.cover_url || book.cover;

  return (
    <div onClick={() => onClick(book)} className="group cursor-pointer flex flex-col items-center">
      <div
        className="relative w-24 h-32 rounded-md transition-transform duration-200 group-hover:-translate-y-2 overflow-hidden"
        style={{
          backgroundColor: color.bg,
          boxShadow: `4px 4px 0 ${color.spine}`,
          border: `2.5px solid ${color.spine}`,
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
                <p className="text-[8px] text-[#4A3423]/70">{book.review_count} reviews</p>
              )}
            </div>
          </>
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

export default function Explore({ user }) {
  const [dbBooks, setDbBooks] = useState([]);
  const [googleBooks, setGoogleBooks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [genre, setGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [googlePage, setGooglePage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    api.get('/books').then(res => setDbBooks(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchResults !== null) return;
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

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (!val.trim()) {
      setSearchResults(null);
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
    <div className="flex min-h-screen bg-[#FBEDD1]">
      <div
        className="flex-1 px-6 py-6 overflow-y-auto"
        style={{ maxWidth: selected ? 'calc(100% - 384px)' : '100%' }}
      >
        {/* Header */}
        <div className="mb-5">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[#4A3423]" style={{ fontFamily: 'Georgia, serif' }}>
            <BookOpen size={24} strokeWidth={2.2} />
            Explore the Library
          </h1>
          <p className="text-sm text-[#4A3423]/60 mt-0.5">Discover what everyone's reading</p>
        </div>

        {/* Search + Genre row */}
        <div className="flex gap-3 mb-6 items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A3423]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search books, authors..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#FFFDF6] border-[2.5px] border-[#4A3423] rounded-2xl text-[#4A3423] placeholder-[#4A3423]/40 focus:outline-none focus:ring-4 focus:ring-[#A3B899]/30 text-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A3423]/50 hover:text-[#4A3423]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {!isSearching && (
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="px-3 py-2.5 bg-[#FFFDF6] border-[2.5px] border-[#4A3423] rounded-2xl text-[#4A3423] text-sm focus:outline-none focus:ring-4 focus:ring-[#A3B899]/30 cursor-pointer"
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
              <p className="text-sm text-[#4A3423]/60 animate-pulse">Searching the shelves...</p>
            ) : (
              <>
                {searchResults.db.length > 0 && (
                  <div className="mb-8">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#5C7A52] uppercase tracking-widest mb-4">
                      <Sparkles size={13} />
                      In your community library
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

                {searchResults.google.length > 0 && (
                  <div className="mb-8">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#5C7A52] uppercase tracking-widest mb-4">
                      <Library size={13} />
                      From the wider library
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
                    <SearchX size={36} className="mx-auto mb-3 text-[#4A3423]/40" strokeWidth={1.5} />
                    <p className="text-[#4A3423]/60 text-sm">No pages match "{searchQuery}"</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* BROWSE MODE */}
        {!isSearching && (
          <>
            {filteredDb.length > 0 && (
              <div className="mb-8">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#5C7A52] uppercase tracking-widest mb-4">
                  <Sparkles size={13} />
                  Community picks
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

            {filteredGoogle.length > 0 && (
              <div className="mb-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#5C7A52] uppercase tracking-widest mb-4">
                  <Library size={13} />
                  From the wider library
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

            <div ref={loaderRef} className="text-center py-6">
              {loadingMore && (
                <p className="flex items-center justify-center gap-1.5 text-sm text-[#4A3423]/60 animate-pulse">
                  <Coffee size={14} />
                  Brewing up more stories...
                </p>
              )}
              {!hasMore && !loadingMore && (
                <p className="flex items-center justify-center gap-1.5 text-xs text-[#4A3423]/50">
                  <Coffee size={13} />
                  You've reached the last shelf — time for a coffee break
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right panel */}
      {selected && (
        <div className="w-96 border-l-[3px] border-[#4A3423] bg-[#FFFDF6] fixed right-0 top-16 bottom-0 overflow-y-auto z-10 shadow-[-6px_0_0_rgba(74,52,35,0.08)]">
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