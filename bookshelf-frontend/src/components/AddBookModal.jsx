import { useState } from 'react';
import api from '../api';

const GENRES = [
  'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Thriller',
  'Horror', 'Nonfiction', 'Memoir', 'History', 'Biography', 'Fiction', 'Other'
];

export default function AddBookModal({ onClose, onAdded, prefillBook = null, prefillTitle = '' }) {
  // if prefillBook comes from Google, we show a confirm screen first
  const [mode, setMode] = useState(prefillBook ? 'confirm' : 'manual');
  const [form, setForm] = useState({
    title: prefillBook?.title || prefillTitle || '',
    author: prefillBook?.author || '',
    genre: prefillBook?.genre || '',
    description: prefillBook?.description || '',
    published_year: prefillBook?.published_year || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author) {
      setError('Title and author are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/books', {
        ...form,
        published_year: form.published_year ? parseInt(form.published_year) : null,
      });
      onAdded(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-[#faf7f2] rounded-2xl shadow-xl border border-[#e8d5c0] w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#e8d5c0]">
          <h2 className="text-lg font-semibold text-[#3d2b1f]" style={{ fontFamily: 'Georgia, serif' }}>
            {mode === 'confirm' ? 'Add this book?' : 'Add a book manually'}
          </h2>
          <button onClick={onClose} className="text-[#8b6b4e] hover:text-[#3d2b1f] text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-5">
          {/* Confirm mode — from Google Books */}
          {mode === 'confirm' && prefillBook && (
            <div>
              <div className="bg-[#f5e6d3] rounded-xl p-4 mb-4">
                <p className="font-semibold text-[#3d2b1f] text-sm">{prefillBook.title}</p>
                <p className="text-xs text-[#8b6b4e] mt-0.5">{prefillBook.author}</p>
                {prefillBook.genre && (
                  <span className="inline-block mt-2 text-[10px] bg-[#e8d5c0] text-[#5c3d2e] px-2 py-0.5 rounded-full">
                    {prefillBook.genre}
                  </span>
                )}
                {prefillBook.description && (
                  <p className="text-xs text-[#8b6b4e] mt-2 line-clamp-3">{prefillBook.description}</p>
                )}
              </div>

              {error && (
                <p className="text-red-600 text-xs mb-3">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-[#5c3d2e] hover:bg-[#3d2b1f] text-[#faf7f2] text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Adding...' : 'Add to shelf ✓'}
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className="flex-1 border border-[#d6b896] text-[#5c3d2e] text-sm py-2.5 rounded-xl hover:bg-[#f5e6d3] transition-colors"
                >
                  Edit details
                </button>
              </div>
            </div>
          )}

          {/* Manual form mode */}
          {mode === 'manual' && (
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <p className="text-red-600 text-xs">{error}</p>
              )}

              {[
                { name: 'title', label: 'Title *', type: 'text', placeholder: 'e.g. The Night Circus' },
                { name: 'author', label: 'Author *', type: 'text', placeholder: 'e.g. Erin Morgenstern' },
                { name: 'published_year', label: 'Year', type: 'number', placeholder: '2011' },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-[#5c3d2e] mb-1">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 bg-white border border-[#d6b896] rounded-lg text-[#3d2b1f] placeholder-[#b89a7a] focus:outline-none focus:ring-2 focus:ring-[#c9956a] text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-[#5c3d2e] mb-1">Genre</label>
                <select
                  name="genre"
                  value={form.genre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-[#d6b896] rounded-lg text-[#3d2b1f] focus:outline-none focus:ring-2 focus:ring-[#c9956a] text-sm"
                >
                  <option value="">Select a genre</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5c3d2e] mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="A short description..."
                  className="w-full px-3 py-2 bg-white border border-[#d6b896] rounded-lg text-[#3d2b1f] placeholder-[#b89a7a] focus:outline-none focus:ring-2 focus:ring-[#c9956a] text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#5c3d2e] hover:bg-[#3d2b1f] text-[#faf7f2] text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60 mt-1"
              >
                {submitting ? 'Adding...' : 'Add to shelf ✓'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}