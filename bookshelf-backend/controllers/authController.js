const pool   = require('../db/pool');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// ==========================================
// REGISTER
// ==========================================
const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role, created_at`,
      [username, email, passwordHash]
    );
    const newUser = result.rows[0];

    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: newUser });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// ==========================================
// LOGIN
// ==========================================
const login = async (req, res) => {
  const { email, password } = req.body;  // "email" field carries either email or username

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// ==========================================
// GET CURRENT USER (GET /api/auth/me)
// ==========================================
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
};

// ==========================================
// GET USER STATS (GET /api/auth/stats)
// ==========================================
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const reviewsResult = await pool.query(
      'SELECT COUNT(*)::int AS review_count, AVG(rating)::numeric(10,2) AS avg_rating FROM reviews WHERE user_id = $1',
      [userId]
    );

    const shelfResult = await pool.query(
      'SELECT status, COUNT(*)::int AS count FROM user_books WHERE user_id = $1 GROUP BY status',
      [userId]
    );

    const shelfCounts = { want_to_read: 0, currently_reading: 0, finished: 0 };
    shelfResult.rows.forEach(row => { shelfCounts[row.status] = row.count; });

    res.json({
      review_count: reviewsResult.rows[0].review_count,
      avg_rating_given: reviewsResult.rows[0].avg_rating,
      shelf: shelfCounts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
};

// ==========================================
// CHANGE PASSWORD (PUT /api/auth/password)
// ==========================================
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  getStats,
  changePassword
};