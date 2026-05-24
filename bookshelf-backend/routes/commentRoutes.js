const express  = require('express');
const router   = express.Router({ mergeParams: true });
const {
  getComments, createComment, updateComment, deleteComment
} = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

// Nested under /api/reviews/:reviewId/comments
router.get('/',  getComments);
router.post('/', authenticate, createComment);

// Direct comment access for edit/delete
router.put('/:id',    authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);

module.exports = router;