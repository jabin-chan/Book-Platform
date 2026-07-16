const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../db/pool');

const {
  getBooks,
  getBook,
  createBook,
  deleteBook
} = require('../controllers/bookController');

const { authenticate } = require('../middleware/auth');

// Search your own DB by title or author
router.get('/search', async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json([]);
  }

  try {
    const result = await pool.query(
      `SELECT * FROM books
       WHERE title ILIKE $1 OR author ILIKE $1
       ORDER BY title ASC
       LIMIT 10`,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Google Books proxy
router.get('/google', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.json([]);
  }

  try {
    const response = await axios.get(
      'https://www.googleapis.com/books/v1/volumes',
      {
        params: {
          q,
          key: process.env.GOOGLE_BOOKS_KEY,
          maxResults: 8,
          printType: 'books',
        },
      }
    );

    const books = (response.data.items || []).map((item) => {
      const info = item.volumeInfo;

      return {
        google_id: item.id,
        title: info.title || 'Unknown Title',
        author: (info.authors || []).join(', '),
        genre: (info.categories || [''])[0],
        description: info.description || '',
        published_year: info.publishedDate
          ? parseInt(info.publishedDate.substring(0, 4))
          : null,
        cover: info.imageLinks?.thumbnail || null,
        isbn:
          (info.industryIdentifiers || []).find(
            (i) => i.type === 'ISBN_13'
          )?.identifier || null,
      };
    });

    res.json(books);
  } catch (err) {
    console.error('Google Books error:', err.message);
    res.status(500).json({ error: 'Google Books fetch failed' });
  }
});

router.get('/', getBooks);
router.get('/:id', getBook);
router.post('/', authenticate, createBook);
router.delete('/:id', authenticate, deleteBook);

module.exports = router;