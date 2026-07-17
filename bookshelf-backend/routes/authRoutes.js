const express    = require('express');
const router     = express.Router();
const { register, login, getStats, changePassword, getMe } = require('../controllers/authController');
const { authenticate }    = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/stats', authenticate, getStats);
router.put('/password', authenticate, changePassword);
router.get('/me', authenticate, getMe);

module.exports = router;