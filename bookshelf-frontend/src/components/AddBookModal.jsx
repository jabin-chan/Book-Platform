//modal to add a new book
import { useState } from 'react';
import api from '../api';

export default function AddBookModal({ onClose, onBookAdded }) {
  const [form, setForm] = useState({
    title: '', author: '', genre: '', description: '', published_year: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/books', form);
      onBookAdded(res.data);   // add the new book to the grid instantly
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* dark overlay */
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl border border-coffee-200 w-full max-w-md p-6">

        <div className="flex justify-between items-center mb-5">
          <h2 className="font-serif text-coffee-700 text-lg">Add a book</h2>
          <button
            onClick={onClose}
            className="font-sans text-coffee-400 hover:text-coffee-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {error && (
          <p className="bg-red-50 border border-red-200 text-red-600 font-sans text-xs px-3 py-2 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { name: 'title',          label: 'Title *',          placeholder: 'The Great Gatsby' },
            { name: 'author',         label: 'Author *',         placeholder: 'F. Scott Fitzgerald' },
            { name: 'genre',          label: 'Genre',            placeholder: 'Fiction' },
            { name: 'published_year', label: 'Published year',   placeholder: '1925', type: 'number' },
          ].map(field => (
            <div key={field.name}>
              <label className="block font-sans text-xs text-coffee-500 mb-1">
                {field.label}
              </label>
              <input
                type={field.type || 'text'}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.label.includes('*')}
                className="w-full border border-coffee-200 rounded px-3 py-2 font-sans text-sm text-coffee-700 bg-coffee-50 focus:outline-none focus:border-coffee-400"
              />
            </div>
          ))}

          <div>
            <label className="block font-sans text-xs text-coffee-500 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="A short summary..."
              rows={3}
              className="w-full border border-coffee-200 rounded px-3 py-2 font-sans text-sm text-coffee-700 bg-coffee-50 resize-none focus:outline-none focus:border-coffee-400"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-coffee-700 text-coffee-100 font-sans text-sm py-2 rounded hover:bg-coffee-800 transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add book'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-coffee-200 text-coffee-500 font-sans text-sm py-2 rounded hover:bg-coffee-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}