
const express    = require('express');
const router     = express.Router();
const { register, login } = require('../controllers/authController');
const { authenticate }    = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);

// A protected test route — only works with a valid token
router.get('/me', authenticate, async (req, res) => {
  res.json({ message: 'Token valid!', user: req.user });
});

module.exports = router;