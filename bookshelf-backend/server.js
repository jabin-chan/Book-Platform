const express = require('express');
const cors    = require('cors');
require('dotenv').config();
console.log('auth:', require('./routes/authRoutes'));
console.log('books:', require('./routes/bookRoutes'));
console.log('reviews:', require('./routes/reviewRoutes'));
console.log('reviewDirect:', require('./routes/reviewDirectRoutes'));
console.log('comments:', require('./routes/commentRoutes'));

const authRoutes         = require('./routes/authRoutes');
const bookRoutes         = require('./routes/bookRoutes');
const reviewRoutes       = require('./routes/reviewRoutes');
const reviewDirectRoutes = require('./routes/reviewDirectRoutes');
const commentRoutes      = require('./routes/commentRoutes');

const app  = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/auth',                      authRoutes);
app.use('/api/books',                     bookRoutes);
app.use('/api/books/:bookId/reviews',     reviewRoutes);
app.use('/api/reviews',                   reviewDirectRoutes);
app.use('/api/reviews/:reviewId/comments', commentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'BookShelf API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});