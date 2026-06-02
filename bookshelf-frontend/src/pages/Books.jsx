//main bookshelf page (grid + panel)
import { useEffect, useState } from 'react';
import api from '../api';
import BookCard     from '../components/BookCard';
import BookPanel    from '../components/BookPanel';
import AddBookModal from '../components/AddBookModal';

export default function Books() {
  const [books, setBooks]         = useState([]);
  const [selected, setSelected]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]     = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get('/books')
      .then(res => {
        setBooks(res.data);
        // auto-select the first book so the panel isn't empty
        if (res.data.length > 0) setSelected(res.data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleBookAdded = (newBook) => {
    setBooks(prev => [newBook, ...prev]);
    setSelected(newBook);   // select it immediately
  };

  return (
    <div className="flex h-[calc(100vh-48px)]">  {/* 48px = navbar height */}

      {/* ── LEFT: book grid ── */}
      <div className="flex-1 overflow-y-auto p-6 bg-coffee-50">

        {/* header row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-sans text-xs text-coffee-400 tracking-widest uppercase">
              The shelf
            </p>
            <p className="font-sans text-xs text-coffee-400 mt-0.5">
              {books.length} book{books.length !== 1 ? 's' : ''}
            </p>
          </div>

          {token && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-coffee-700 text-coffee-100 font-sans text-xs px-4 py-2 rounded hover:bg-coffee-800 transition"
            >
              + Add book
            </button>
          )}
        </div>

        {/* grid */}
        {loading ? (
          /* skeleton loader while fetching */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-coffee-100 rounded-lg h-36 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {books.map(book => (
              <BookCard
                key={book.id}
                book={book}
                isSelected={selected?.id === book.id}
                onClick={setSelected}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT: detail panel ── */}
      <div className="w-80 border-l border-coffee-200 bg-white p-5 overflow-y-auto flex-shrink-0">
        <BookPanel book={selected} />
      </div>

      {/* modal */}
      {showModal && (
        <AddBookModal
          onClose={() => setShowModal(false)}
          onBookAdded={handleBookAdded}
        />
      )}
    </div>
  );
}