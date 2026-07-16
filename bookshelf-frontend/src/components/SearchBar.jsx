import { useState, useEffect, useRef } from 'react';
import api from '../api';

export default function SearchBar({ onSelectBook, onAddManually }) {
  const [query, setQuery] = useState('');
  const [googleResults, setGoogleResults] = useState([]);
  const [dbResults, setDbResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // debounced search — waits 400ms after user stops typing
  useEffect(() => {
    if (query.trim().length < 2) {
      setGoogleResults([]);
      setDbResults([]);
      setOpen(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setOpen(true);
      try {
        const [googleRes, dbRes] = await Promise.all([
          api.get(`/books/google?q=${encodeURIComponent(query)}`),
          api.get(`/books/search?q=${encodeURIComponent(query)}`),
        ]);
        setGoogleResults(googleRes.data);
        setDbResults(dbRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  const handleSelect = (book, source) => {
    onSelectBook({ ...book, source });
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Search input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b89a7a]">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Search for a book to add..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#d6b896] rounded-xl text-[#3d2b1f] placeholder-[#b89a7a] focus:outline-none focus:ring-2 focus:ring-[#c9956a] text-sm"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b89a7a] text-xs animate-pulse">
            searching...
          </span>
        )}
      </div>

      {/* Dropdown results */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-[#faf7f2] border border-[#e8d5c0] rounded-xl shadow-lg overflow-hidden max-h-96 overflow-y-auto">

          {/* Your DB results — shown first as "Community Picks" */}
          {dbResults.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[10px] font-semibold text-[#8b6b4e] uppercase tracking-widest bg-[#f5e6d3]">
                ✨ Already in your library
              </p>
              {dbResults.map((book) => (
                <button
                  key={book.id}
                  onClick={() => handleSelect(book, 'db')}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#f5e6d3] transition-colors border-b border-[#eeddd0] last:border-0"
                >
                  <p className="text-sm font-medium text-[#3d2b1f]">{book.title}</p>
                  <p className="text-xs text-[#8b6b4e]">{book.author}
                    {book.genre && <span className="ml-2 text-[#b89a7a]">· {book.genre}</span>}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Google Books results */}
          {googleResults.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[10px] font-semibold text-[#8b6b4e] uppercase tracking-widest bg-[#f5e6d3]">
                📚 From Google Books
              </p>
              {googleResults.map((book) => (
                <button
                  key={book.google_id}
                  onClick={() => handleSelect(book, 'google')}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#f5e6d3] transition-colors border-b border-[#eeddd0] last:border-0"
                >
                  <p className="text-sm font-medium text-[#3d2b1f]">{book.title}</p>
                  <p className="text-xs text-[#8b6b4e]">{book.author}
                    {book.genre && <span className="ml-2 text-[#b89a7a]">· {book.genre}</span>}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Nothing found anywhere */}
          {!loading && googleResults.length === 0 && dbResults.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-[#8b6b4e] mb-2">No results for "{query}"</p>
              <button
                onClick={() => { onAddManually(query); setOpen(false); }}
                className="text-xs bg-[#5c3d2e] text-[#faf7f2] px-4 py-2 rounded-lg hover:bg-[#3d2b1f] transition-colors"
              >
                + Add "{query}" manually
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}