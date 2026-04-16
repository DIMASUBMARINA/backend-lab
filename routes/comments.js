const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.get('/post/:postId', commentController.getByPost);
router.post('/', commentController.create);
router.patch('/:id/moderate', commentController.moderate);
router.delete('/:id', commentController.remove);

module.exports = router;