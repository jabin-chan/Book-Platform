const express    = require('express');
const router     = express.Router();
const { getBooks, getBook, createBook, deleteBook } = require('../controllers/bookController');
const { authenticate } = require('../middleware/auth');

router.get('/',       getBooks);
router.get('/:id',    getBook);
router.post('/',      authenticate, createBook);
router.delete('/:id', authenticate, deleteBook);

module.exports = router;