const commentService = require('../services/commentService');

async function getByPost(req, res, next) {
  try {
    const comments = await commentService.getCommentsByPost(req.params.postId);
    res.json({ count: comments.length, data: comments });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const comment = await commentService.createComment(req.body);
    res.status(201).json(comment);
  } catch (err) { next(err); }
}

async function moderate(req, res, next) {
  try {
    const comment = await commentService.moderateComment(req.params.id, req.body.status);
    res.json(comment);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await commentService.deleteComment(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { getByPost, create, moderate, remove };