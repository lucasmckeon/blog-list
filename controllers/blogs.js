import express from 'express';
import { Blog } from '../models/blog.js';
import {
  getBlogNotFoundError,
  getDeleteBlogFailedError,
  getTokenInvalidError,
} from '../utils/errors.js';
import { userExtractor } from '../utils/middleware.js';
const blogsRouter = express.Router();

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', 'username name');
  response.json(blogs);
});

blogsRouter.post('/', userExtractor, async (request, response) => {
  if (!request.body.likes) request.body.likes = 0;
  const user = request.user;
  const blog = new Blog({ ...request.body, user: user.id });
  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user;
  const blogToDeleteId = request.params.id;
  console.log('ID:', blogToDeleteId);
  const blogToDelete = await Blog.findById(blogToDeleteId);
  if (!blogToDelete) {
    throw getBlogNotFoundError();
  }
  if (blogToDelete.user?.toString() !== user.id.toString()) {
    throw getTokenInvalidError();
  }
  const deletedDoc = await Blog.findByIdAndDelete(blogToDeleteId);
  if (!deletedDoc) {
    throw getDeleteBlogFailedError();
  }
  user.blogs = user.blogs.filter(
    (bId) => bId.toString() !== deletedDoc._id.toString()
  );
  await user.save();
  response.sendStatus(204);
});
//TODO update to user authorization
blogsRouter.put('/:id', async (request, response) => {
  const id = request.params.id;
  const body = request.body;
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };
  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true });
  response.json(updatedBlog);
});

export { blogsRouter };
