import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const SPINE_COLORS = [
  'bg-coffee-100', 'bg-coffee-200', 'bg-amber-100',
  'bg-orange-100', 'bg-yellow-100', 'bg-stone-200',
];

export default function Home() {
  const [books, setBooks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/books')
      .then(res => setBooks(res.data.slice(0, 8)))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-20 px-6 bg-coffee-50">
        <p className="text-coffee-400 font-sans text-xs tracking-widest uppercase mb-3">
          Your reading corner
        </p>
        <h1 className="font-serif text-4xl text-coffee-700 mb-3">
          Books worth talking about
        </h1>
        <p className="font-sans text-coffee-500 text-sm mb-8 max-w-md mx-auto">
          Discover, review, and track books with a community of readers.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/signup"
            className="bg-coffee-700 text-coffee-100 font-sans text-sm px-6 py-2.5 rounded hover:bg-coffee-800 transition">
            Join free
          </Link>
          <Link to="/login"
            className="border border-coffee-300 text-coffee-600 font-sans text-sm px-6 py-2.5 rounded hover:bg-coffee-100 transition">
            Sign in
          </Link>
        </div>
      </section>

      {/* Book grid */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <p className="font-sans text-xs text-coffee-400 tracking-widest uppercase mb-5">
          Recently added
        </p>

        {loading ? (
          <p className="font-sans text-coffee-400 text-sm">Loading books...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {books.map((book, i) => (
              <div key={book.id}
                className="bg-white border border-coffee-200 rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer">
                {/* Book spine colour block */}
                <div className={`${SPINE_COLORS[i % SPINE_COLORS.length]} h-24 flex items-center justify-center text-3xl`}>
                  📚
                </div>
                <div className="p-3">
                  <p className="font-serif text-coffee-700 text-sm leading-snug line-clamp-2">
                    {book.title}
                  </p>
                  <p className="font-sans text-coffee-400 text-xs mt-1">
                    {book.author}
                  </p>
                  {book.avg_rating && (
                    <p className="text-amber-500 text-xs mt-1">
                      {'★'.repeat(Math.round(book.avg_rating))}
                      {'☆'.repeat(5 - Math.round(book.avg_rating))}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}