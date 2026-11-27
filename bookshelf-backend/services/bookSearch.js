// STRATEGY PATTERN (behavioral)
// Books can be searched in different places (our database, Google Books).
// Each place is its own strategy with the same method: search(q, options).
// The routes just say WHICH source they want; they don't know HOW it works.
// Adding a new source later = adding one new class, no route changes.

const axios = require('axios');
const pool = require('../db/pool');
const { adaptGoogleVolume } = require('./googleBookAdapter');

// Strategy 1: search books already saved in our database
class LocalSearchStrategy {
  async search(q) {
    if (!q || q.trim().length < 2) {
      return [];
    }

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

    return result.rows;
  }
}

// Strategy 2: search the Google Books API
class GoogleSearchStrategy {
  async search(q, options = {}) {
    if (!q) {
      return [];
    }

    const response = await axios.get(
      'https://www.googleapis.com/books/v1/volumes',
      {
        params: {
          q,
          key: process.env.GOOGLE_BOOKS_KEY,
          maxResults: 20,
          startIndex: parseInt(options.startIndex) || 0,
          printType: 'books',
        },
      }
    );

    return (response.data.items || []).map(adaptGoogleVolume);
  }
}

// Registry of available strategies
const strategies = {
  local: new LocalSearchStrategy(),
  google: new GoogleSearchStrategy(),
};

// Context: picks the strategy by name and runs it
const searchBooks = (source, q, options) => {
  const strategy = strategies[source];

  if (!strategy) {
    throw new Error(`Unknown search source: ${source}`);
  }

  return strategy.search(q, options);
};

module.exports = {
  searchBooks,
  LocalSearchStrategy,
  GoogleSearchStrategy,
};