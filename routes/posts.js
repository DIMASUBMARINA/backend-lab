const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth');

router.get('/', postController.getAll);
router.get('/:slug', postController.getBySlug);
router.post('/', requireAuth, postController.create);
router.post('/publish', requireAuth, postController.publish);
router.delete('/:id', requireAuth, postController.remove);

module.exports = router;