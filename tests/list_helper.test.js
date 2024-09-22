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

test.only('POST request creates a new blog post', async () => {
  const title = 'Test Title';
  const newBlog = { title, author: 'Test Author', url: 'Test URL', likes: 12 };
  const blog = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);
  const blogs = await getBlogsInDB();
  assert(blogs.length === getInitialAmountOfBlogs() + 1);
  const titles = blogs.map((b) => b.title);
  assert(titles.includes(title));
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
