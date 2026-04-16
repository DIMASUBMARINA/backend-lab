const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', categoryController.create);

module.exports = router;