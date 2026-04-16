const postService = require('../services/postService');

async function getAll(req, res, next) {
  try {
    const posts = await postService.getAllPosts(req.query);
    res.json({ count: posts.length, data: posts });
  } catch (err) { next(err); }
}

async function getBySlug(req, res, next) {
  try {
    const post = await postService.getPostBySlug(req.params.slug);
    res.json(post);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const post = await postService.createPost(req.body);
    res.status(201).json(post);
  } catch (err) { next(err); }
}

async function publish(req, res, next) {
  try {
    const post = await postService.publishPost(req.body);
    res.status(201).json(post);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await postService.deletePost(parseInt(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { getAll, getBySlug, create, publish, remove };