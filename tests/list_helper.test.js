import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import {
  totalLikes,
  favoriteBlog,
  getBlogsInDB,
  clearDB,
  populateDB,
  getInitialAmountOfBlogs,
} from '../utils/list_helper.js';
import supertest from 'supertest';
import { app } from '../app.js';
import mongoose from 'mongoose';

beforeEach(async () => {
  await clearDB();
  await populateDB();
});

const api = supertest(app);

describe('when blog posts retrieved', () => {
  test('blog list application returns the correct amount of blog posts in the JSON format', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const initialBlogCount = getInitialAmountOfBlogs();
    assert(initialBlogCount === response.body.length);
  });

  test('unique identifier property of the blog posts is named id', async () => {
    const blogs = await getBlogsInDB();
    blogs.forEach((blog) => {
      // @ts-ignore
      assert(blog.id && !blog._id);
    });
  });
});

describe('when HTTP POST requests to /api/blogs', () => {
  test('Creates a new blog post', async () => {
    const title = 'Test Title';
    const newBlog = {
      title,
      author: 'Test Author',
      url: 'Test URL',
      likes: 12,
    };
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const blogs = await getBlogsInDB();
    assert(blogs.length === getInitialAmountOfBlogs() + 1);
    const titles = blogs.map((blog) => blog.title);
    assert(titles.includes(title));
  });
  test('Default likes property to 0 if likes property missing', async () => {
    const title = 'Test Title';
    const newBlog = {
      title,
      author: 'Test Author',
      url: 'Test URL',
    };
    const blog = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const blogs = await getBlogsInDB();
    const newBlogFromDB = blogs.find((blog) => blog.title === title);
    assert(newBlogFromDB?.likes == 0);
  });
  test('Respond with 400 Bad Request if title or url properties missing', async () => {
    const newBlog = {
      author: 'Test Author',
    };
    await api.post('/api/blogs').send(newBlog).expect(422);
  });
});

test('Delete a single blog post', async () => {
  const blogsAtStart = await getBlogsInDB();
  const blogToDelete = blogsAtStart[0];

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

  const blogsAtEnd = await getBlogsInDB();

  const titles = blogsAtEnd.map((r) => r.title);
  assert(!titles.includes(blogToDelete.title));

  assert.strictEqual(blogsAtEnd.length, getInitialAmountOfBlogs() - 1);
});

test('Update blog post', async () => {
  const blogsAtStart = await getBlogsInDB();
  const blogToUpdate = blogsAtStart[0];
  const oldTitle = blogToUpdate.title;
  const updatedTitle = 'Updated Title';
  const updatedBlog = { ...blogToUpdate, title: updatedTitle };
  await api.put(`/api/blogs/${blogToUpdate.id}`).send(updatedBlog).expect(200);

  const blogsAtEnd = await getBlogsInDB();

  const titles = blogsAtEnd.map((r) => r.title);
  assert(!titles.includes(oldTitle));
  assert(titles.includes(updatedTitle));
  assert.strictEqual(blogsAtEnd.length, getInitialAmountOfBlogs());
});

describe('like utility methods', () => {
  test('total likes is 36', async () => {
    const blogs = await getBlogsInDB();
    assert.strictEqual(totalLikes(blogs), 36);
  });

  test('favorite blog has 12 likes', async () => {
    const blogs = await getBlogsInDB();
    assert.strictEqual(favoriteBlog(blogs).likes, 12);
  });
});

after(() => {
  mongoose.connection.close();
});
