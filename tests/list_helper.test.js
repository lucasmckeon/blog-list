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

test.only('blog list application returns the correct amount of blog posts in the JSON format', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
  const initialBlogCount = getInitialAmountOfBlogs();
  assert(initialBlogCount === response.body.length);
});

describe('verifying like utility methods', () => {
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
