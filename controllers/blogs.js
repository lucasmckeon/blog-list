import express from 'express';
import { Blog } from '../models/blog.js';
import { User } from '../models/user.js';
const blogsRouter = express.Router();

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', 'username name');
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  if (!request.body.title || !request.body.url) response.sendStatus(400);
  if (!request.body.likes) request.body.likes = 0;
  const user = await User.findOne({});
  if (user === null) {
    const error = new Error();
    error.name = 'UserNotFoundDuringSaveBlog';
    throw error;
  }
  const blog = new Blog({ ...request.body, user: user.id });
  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);
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
