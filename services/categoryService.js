const categoryRepository = require('../repositories/categoryRepository');
const { generateSlug } = require('../validators/postValidator');

async function getAllCategories() {
  return categoryRepository.findAll();
}

async function getCategoryById(id) {
  const category = await categoryRepository.findById(parseInt(id));
  if (!category) throw { status: 404, message: 'Category not found', code: 'CATEGORY_NOT_FOUND' };
  return category;
}

async function createCategory(data) {
  if (!data.name) throw { status: 422, message: 'Name is required', code: 'VALIDATION_ERROR' };

  const slug = generateSlug(data.name);
  const existing = await categoryRepository.findBySlug(slug);
  if (existing) throw { status: 409, message: 'Category already exists', code: 'CATEGORY_DUPLICATE' };

  return categoryRepository.create({
    name: data.name,
    slug,
    parentId: data.parentId ? parseInt(data.parentId) : null
  });
}

module.exports = { getAllCategories, getCategoryById, createCategory };