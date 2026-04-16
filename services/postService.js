const prisma = require('../lib/prisma');
const postRepository = require('../repositories/postRepository');
const userRepository = require('../repositories/userRepository');
const { generateSlug, validatePostCreate, validatePostPublish } = require('../validators/postValidator');

async function getAllPosts(filters) {
  return postRepository.findAll(filters);
}

async function getPostBySlug(slug) {
  const post = await postRepository.findBySlug(slug);
  if (!post) throw { status: 404, message: 'Post not found', code: 'POST_NOT_FOUND' };

  
  await postRepository.update(post.id, { viewCount: { increment: 1 } });

  return post;
}

async function createPost(data) {
  const errors = validatePostCreate(data);
  if (errors.length > 0) throw { status: 422, message: errors.join(', '), code: 'VALIDATION_ERROR' };

  const slug = generateSlug(data.title);
  return postRepository.create({
    title: data.title,
    slug,
    content: data.content,
    status: data.status || 'DRAFT',
    authorId: parseInt(data.authorId)
  });
}

async function publishPost(data) {
  const errors = validatePostPublish(data);
  if (errors.length > 0) throw { status: 422, message: errors.join(', '), code: 'VALIDATION_ERROR' };

  const slug = generateSlug(data.title);

  return prisma.$transaction(async (tx) => {
    
    const author = await tx.user.findUnique({ where: { id: parseInt(data.authorId) } });
    if (!author) throw { status: 404, message: 'Author not found', code: 'AUTHOR_NOT_FOUND' };

   
    const post = await tx.post.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: parseInt(data.authorId)
      }
    });


    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        const tag = await tx.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName }
        });
        await tx.postTag.create({
          data: { postId: post.id, tagId: tag.id }
        });
      }
    }


    if (data.categoryId) {
      await tx.postCategory.create({
        data: { postId: post.id, categoryId: parseInt(data.categoryId) }
      });
    }

    await tx.user.update({
      where: { id: parseInt(data.authorId) },
      data: { postCount: { increment: 1 } }
    });

    return post;
  });
}

async function deletePost(id) {
  const post = await postRepository.findById(id);
  if (!post) throw { status: 404, message: 'Post not found', code: 'POST_NOT_FOUND' };
  return postRepository.remove(id);
}

module.exports = { getAllPosts, getPostBySlug, createPost, publishPost, deletePost };