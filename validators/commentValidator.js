function validateCommentCreate(data) {
  const errors = [];

  if (!data.content) errors.push('Content is required');
  if (!data.userId) errors.push('userId is required');
  if (!data.postId) errors.push('postId is required');

  if (data.status && !['PENDING', 'APPROVED', 'REJECTED'].includes(data.status)) {
    errors.push('Status must be PENDING, APPROVED or REJECTED');
  }

  return errors;
}

module.exports = { validateCommentCreate };