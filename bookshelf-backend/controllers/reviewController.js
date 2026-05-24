const pool = require('../db/pool');

//  GET reviews for a book 
const getReviews = async (req, res) => {
  const { bookId } = req.params;
  try {
    const result = await pool.query(`
      SELECT reviews.*, users.username
      FROM reviews
      JOIN users ON reviews.user_id = users.id
      WHERE reviews.book_id = $1
      ORDER BY reviews.created_at DESC
    `, [bookId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// CREATE a review 
const createReview = async (req, res) => {
  const { bookId } = req.params;
  const { rating, body } = req.body;

  if (!rating || !body)
    return res.status(400).json({ error: 'Rating and body are required' });
  if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Rating must be 1–5' });
  if (body.trim().length < 10)
    return res.status(400).json({ error: 'Review must be at least 10 characters' });

  try {
    const bookCheck = await pool.query('SELECT id FROM books WHERE id = $1', [bookId]);
    if (bookCheck.rows.length === 0)
      return res.status(404).json({ error: 'Book not found' });

    const result = await pool.query(`
      INSERT INTO reviews (user_id, book_id, rating, body)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [req.user.id, bookId, rating, body.trim()]);

    res.status(201).json({ ...result.rows[0], username: req.user.username });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'You have already reviewed this book' });
    res.status(500).json({ error: 'Failed to create review' });
  }
};

//  UPDATE a review 
const updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, body } = req.body;

  if (!rating || !body)
    return res.status(400).json({ error: 'Rating and body are required' });
  if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Rating must be 1–5' });
  if (body.trim().length < 10)
    return res.status(400).json({ error: 'Review must be at least 10 characters' });

  try {
    const existing = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: 'Review not found' });
    if (existing.rows[0].user_id !== req.user.id)
      return res.status(403).json({ error: 'You can only edit your own reviews' });

    const result = await pool.query(`
      UPDATE reviews SET rating = $1, body = $2 WHERE id = $3 RETURNING *
    `, [rating, body.trim(), id]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
};

//  DELETE a review 
const deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: 'Review not found' });
    if (existing.rows[0].user_id !== req.user.id)
      return res.status(403).json({ error: 'You can only delete your own reviews' });

    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};



// GET all comments for a review (as a nested tree)
// GET /api/reviews/:reviewId/comments
const getComments = async (req, res) => {
  const { reviewId } = req.params;
  try {
    // Fetch every comment for this review in one query,
    // oldest first so parent always appears before its children
    const result = await pool.query(`
      SELECT comments.*, users.username
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.review_id = $1
      ORDER BY comments.created_at ASC
    `, [reviewId]);

    // Build nested tree in JS 
    // Step 1: index every comment by id
    const map = {};
    result.rows.forEach(row => {
      map[row.id] = { ...row, replies: [] };
    });

    // Step 2: put each comment inside its parent's replies array
    const roots = [];
    result.rows.forEach(row => {
      if (row.parent_id === null) {
        // No parent = top-level comment on the review
        roots.push(map[row.id]);
      } else {
        // Has a parent = nest inside that comment's replies
        if (map[row.parent_id]) {
          map[row.parent_id].replies.push(map[row.id]);
        }
      }
    });

    res.json(roots);
    // Each root looks like:
    // { id, body, username, replies: [ { id, body, username, replies: [] } ] }

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// POST a comment on a review 
// POST /api/reviews/:reviewId/comments
// body: { body, parent_id? }
// parent_id is optional — omit it for a top-level reply
const createComment = async (req, res) => {
  const { reviewId } = req.params;
  const { body, parent_id } = req.body;

  if (!body || body.trim().length < 1)
    return res.status(400).json({ error: 'Comment body is required' });
  if (body.trim().length > 1000)
    return res.status(400).json({ error: 'Comment must be under 1000 characters' });

  try {
    // Make sure the review exists
    const reviewCheck = await pool.query(
      'SELECT id FROM reviews WHERE id = $1', [reviewId]
    );
    if (reviewCheck.rows.length === 0)
      return res.status(404).json({ error: 'Review not found' });

    // If a parent_id was given, make sure it belongs to the same review
    // (prevents someone nesting a reply under a comment from a different review)
    if (parent_id) {
      const parentCheck = await pool.query(
        'SELECT id FROM comments WHERE id = $1 AND review_id = $2',
        [parent_id, reviewId]
      );
      if (parentCheck.rows.length === 0)
        return res.status(400).json({ error: 'Parent comment not found in this review' });
    }

    const result = await pool.query(`
      INSERT INTO comments (review_id, user_id, parent_id, body)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [reviewId, req.user.id, parent_id || null, body.trim()]);

    res.status(201).json({ ...result.rows[0], username: req.user.username, replies: [] });

  } catch (err) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

// UPDATE a comment 
// PUT /api/comments/:id
const updateComment = async (req, res) => {
  const { id } = req.params;
  const { body } = req.body;

  if (!body || body.trim().length < 1)
    return res.status(400).json({ error: 'Comment body is required' });

  try {
    const existing = await pool.query(
      'SELECT * FROM comments WHERE id = $1', [id]
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ error: 'Comment not found' });
    if (existing.rows[0].user_id !== req.user.id)
      return res.status(403).json({ error: 'You can only edit your own comments' });

    const result = await pool.query(
      'UPDATE comments SET body = $1 WHERE id = $2 RETURNING *',
      [body.trim(), id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

// DELETE a comment 
// DELETE /api/comments/:id
// Deleting a parent also deletes all its child replies (ON DELETE CASCADE)
const deleteComment = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await pool.query(
      'SELECT * FROM comments WHERE id = $1', [id]
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ error: 'Comment not found' });
    if (existing.rows[0].user_id !== req.user.id)
      return res.status(403).json({ error: 'You can only delete your own comments' });

    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

module.exports = {
  getReviews, createReview, updateReview, deleteReview,
  getComments, createComment, updateComment, deleteComment,
};