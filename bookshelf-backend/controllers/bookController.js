const pool = require('../db/pool');

// GET all books 
// GET /api/books
const getBooks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        books.*,
        users.username  AS added_by_username,
        ROUND(AVG(reviews.rating), 1) AS avg_rating,
        COUNT(reviews.id)             AS review_count
      FROM books
      LEFT JOIN users   ON books.added_by = users.id
      LEFT JOIN reviews ON books.id = reviews.book_id
      GROUP BY books.id, users.username
      ORDER BY books.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

// ── GET one book ──────────────────────────────────────────
// GET /api/books/:id
const getBook = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT
        books.*,
        users.username  AS added_by_username,
        ROUND(AVG(reviews.rating), 1) AS avg_rating,
        COUNT(reviews.id)             AS review_count
      FROM books
      LEFT JOIN users   ON books.added_by = users.id
      LEFT JOIN reviews ON books.id = reviews.book_id
      WHERE books.id = $1
      GROUP BY books.id, users.username
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch book' });
  }
};

// ── CREATE a book ─
// POST /api/books  (login required)
const createBook = async (req, res) => {
  const { title, author, genre, description, published_year } = req.body;

  // Simple validation — check required fields
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }
  if (title.trim().length < 1 || title.length > 500) {
    return res.status(400).json({ error: 'Title must be between 1 and 500 characters' });
  }
  if (published_year && (published_year < 1000 || published_year > new Date().getFullYear())) {
    return res.status(400).json({ error: 'Invalid published year' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO books (title, author, genre, description, published_year, added_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title.trim(), author.trim(), genre, description, published_year, req.user.id]);
    // req.user.id comes from the authenticate middleware

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create book' });
  }
};

// ── DELETE a book ──
// DELETE /api/books/:id  (login required — only the person who added it)
const deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    // First check the book exists and belongs to this user
    const book = await pool.query(
      'SELECT * FROM books WHERE id = $1', [id]
    );
    if (book.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    if (book.rows[0].added_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete books you added' });
    }

    await pool.query('DELETE FROM books WHERE id = $1', [id]);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
};

module.exports = { getBooks, getBook, createBook, deleteBook };