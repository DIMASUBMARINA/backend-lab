function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function validatePostCreate(data) {
  const errors = [];

  if (!data.title) errors.push('Title is required');
  if (!data.content) errors.push('Content is required');
  if (!data.authorId) errors.push('authorId is required');

  if (data.status && !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(data.status)) {
    errors.push('Status must be DRAFT, PUBLISHED or ARCHIVED');
  }

  return errors;
}

function validatePostPublish(data) {
  const errors = [];

  if (!data.title) errors.push('Title is required');
  if (!data.content) errors.push('Content is required');
  if (!data.authorId) errors.push('authorId is required');
  if (!data.categoryId) errors.push('categoryId is required');

  return errors;
}

module.exports = { generateSlug, validatePostCreate, validatePostPublish };