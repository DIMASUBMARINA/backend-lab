const categoryService = require('../services/categoryService');

async function getAll(req, res, next) {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ count: categories.length, data: categories });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json(category);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create };