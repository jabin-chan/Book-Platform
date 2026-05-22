-- Users: stores everyone who signs up
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(10) DEFAULT 'user',
  contribution_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Books: the book catalogue
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  description TEXT,
  cover_url TEXT,
  published_year INT,
  added_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews: one review per user per book
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- User_books: a user's personal reading list
CREATE TABLE user_books (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL CHECK (status IN ('want_to_read', 'currently_reading', 'finished')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);