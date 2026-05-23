
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app  = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());               // allow cross-origin requests from your React app
app.use(express.json());       // parse incoming JSON bodies

// Routes
app.use('/api/auth', authRoutes);

// Quick health check
app.get('/', (req, res) => {
  res.json({ message: 'BookShelf API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});