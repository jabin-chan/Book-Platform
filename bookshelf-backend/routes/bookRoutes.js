const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../db/pool');
const { adaptGoogleVolume } = require('../services/googleBookAdapter');
const { createBookData, BookValidationError } = require('../services/bookFactory');

const {
  getBooks,
  getBook,
  createBook,
  deleteBook
} = require('../controllers/bookController');

const { authenticate } = require('../middleware/auth');


// ======================================================
// Search local database
// GET /api/books/search?q=harry
// ======================================================
router.get('/search', async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json([]);
  }

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM books
      WHERE title ILIKE $1
         OR author ILIKE $1
      ORDER BY title ASC
      LIMIT 10
      `,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});


// ======================================================
// Google Books search
// GET /api/books/google?q=harry&startIndex=0
// ======================================================
router.get('/google', async (req, res) => {
  const { q, startIndex = 0 } = req.query;

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
          maxResults: 20,
          startIndex: parseInt(startIndex),
          printType: 'books',
        },
      }
    );

    // Adapter converts Google's format into our internal book shape
    const books = (response.data.items || []).map(adaptGoogleVolume);

    res.json(books);
  } catch (err) {
    console.error('Google Books error:', err.message);
    res.status(500).json({
      error: 'Google Books fetch failed',
    });
  }
});

// ======================================================
// Auto-save Google Book into database
// POST /api/books/save-from-google
// ======================================================
router.post('/save-from-google', authenticate, async (req, res) => {
  try {
    const book = createBookData('google', req.body);

    const existing = await pool.query(
      'SELECT * FROM books WHERE title ILIKE $1 AND author ILIKE $2',
      [book.title, book.author]
    );

    if (existing.rows.length > 0) {
      // If exists but has no cover, update it
      if (!existing.rows[0].cover_url && book.cover_url) {
        const updated = await pool.query(
          'UPDATE books SET cover_url = $1 WHERE id = $2 RETURNING *',
          [book.cover_url, existing.rows[0].id]
        );
        return res.json(updated.rows[0]);
      }
      return res.json(existing.rows[0]);
    }

    const result = await pool.query(
      `INSERT INTO books (title, author, genre, description, published_year, cover_url, added_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        book.title,
        book.author,
        book.genre,
        book.description,
        book.published_year,
        book.cover_url,
        book.added_by,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof BookValidationError) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to save book' });
  }
});

// ======================================================
// Get current user's shelf
// GET /api/books/shelf
// ======================================================
router.get('/shelf', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        ub.*,
        b.title,
        b.author,
        b.genre,
        b.description,
        b.cover_url,
        b.published_year
      FROM user_books ub
      JOIN books b
        ON ub.book_id = b.id
      WHERE ub.user_id = $1
      ORDER BY ub.created_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to fetch shelf',
    });
  }
});


// ======================================================
// Add/update shelf
// POST /api/books/shelf
// ======================================================
router.post('/shelf', authenticate, async (req, res) => {
  const { book_id, status } = req.body;

  if (!book_id || !status) {
    return res.status(400).json({
      error: 'book_id and status required',
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO user_books
      (user_id, book_id, status)
      VALUES ($1,$2,$3)
      ON CONFLICT (user_id, book_id)
      DO UPDATE
      SET status = EXCLUDED.status
      RETURNING *
      `,
      [
        req.user.id,
        book_id,
        status,
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to update shelf',
    });
  }
});


// ======================================================
// Remove from shelf
// DELETE /api/books/shelf/:bookId
// ======================================================
router.delete('/shelf/:bookId', authenticate, async (req, res) => {
  try {

    await pool.query(
      `
      DELETE FROM user_books
      WHERE user_id=$1
      AND book_id=$2
      `,
      [
        req.user.id,
        req.params.bookId,
      ]
    );

    res.json({
      success: true,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to remove from shelf',
    });
  }
});


// ======================================================
// Books CRUD
// ======================================================

router.get('/', getBooks);

router.get('/:id', getBook);

router.post('/', authenticate, createBook);

router.delete('/:id', authenticate, deleteBook);

module.exports = router;