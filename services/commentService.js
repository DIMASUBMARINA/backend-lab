const commentRepository = require('../repositories/commentRepository');
const postRepository = require('../repositories/postRepository');
const { validateCommentCreate } = require('../validators/commentValidator');

async function getCommentsByPost(postId) {
  return commentRepository.findByPost(parseInt(postId));
}

async function createComment(data) {
  const errors = validateCommentCreate(data);
  if (errors.length > 0) throw { status: 422, message: errors.join(', '), code: 'VALIDATION_ERROR' };

  const post = await postRepository.findById(parseInt(data.postId));
  if (!post) throw { status: 404, message: 'Post not found', code: 'POST_NOT_FOUND' };

  return commentRepository.create({
    content: data.content,
    userId: parseInt(data.userId),
    postId: parseInt(data.postId),
    parentId: data.parentId ? parseInt(data.parentId) : null,
    status: 'PENDING'
  });
}

async function moderateComment(id, status) {
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw { status: 422, message: 'Status must be APPROVED or REJECTED', code: 'VALIDATION_ERROR' };
  }

  const comment = await commentRepository.findById(parseInt(id));
  if (!comment) throw { status: 404, message: 'Comment not found', code: 'COMMENT_NOT_FOUND' };

  return commentRepository.update(parseInt(id), { status });
}

async function deleteComment(id) {
  const comment = await commentRepository.findById(parseInt(id));
  if (!comment) throw { status: 404, message: 'Comment not found', code: 'COMMENT_NOT_FOUND' };
  return commentRepository.softDelete(parseInt(id));
}

module.exports = { getCommentsByPost, createComment, moderateComment, deleteComment };