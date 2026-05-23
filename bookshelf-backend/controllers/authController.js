
const pool   = require('../db/pool');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

//  REGISTER 
const register = async (req, res) => {
  const { username, email, password } = req.body;

  // Basic input check
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    // To make sure email isn't already taken
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    //  Hash the password 
    const passwordHash = await bcrypt.hash(password, 10);

    // Save the user to the database
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role, created_at`,
      [username, email, passwordHash]
    );
    const newUser = result.rows[0];

    //  Create a JWT token so they're instantly logged in
    const token = jwt.sign(
      { userId: newUser.id },          // what we put inside the token
      process.env.JWT_SECRET,          // the secret key used to sign it
      { expiresIn: '7d' }             // token expires in 7 days
    );

    res.status(201).json({ token, user: newUser });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

//  LOGIN 
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    //  Find the user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    //  If no user found say "invalid credentials" for both wrong email AND wrong password.
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    //  Compare the typed password against the stored hash
    //    bcrypt.compare re-hashes the typed password and checks if it matches
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    //  Sign a new token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    //  Return token + user info (but NOT the password hash)
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = { register, login };