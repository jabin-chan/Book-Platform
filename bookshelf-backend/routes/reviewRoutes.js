const express  = require('express');
const router   = express.Router({ mergeParams: true });
// mergeParams: true lets this router see :bookId from server.js

const { getReviews, createReview } = require('../controllers/reviewController');
const { authenticate }             = require('../middleware/auth');

router.get('/',  getReviews);
router.post('/', authenticate, createReview);

module.exports = router;