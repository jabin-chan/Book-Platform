const express  = require('express');
const router   = express.Router();

const { updateReview, deleteReview } = require('../controllers/reviewController');
const { authenticate }               = require('../middleware/auth');

router.put('/:id',    authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;