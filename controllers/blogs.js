import express from 'express';
import { Blog } from '../models/blog.js';
const blogsRouter = express.Router();

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  if (!request.body.title || !request.body.url) response.sendStatus(400);
  if (!request.body.likes) request.body.likes = 0;
  const blog = new Blog(request.body);
  const result = await blog.save();
  response.status(201).json(result);
});

blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id;
  const result = await Blog.findByIdAndDelete(id);
  response.sendStatus(204);
});

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
