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
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const { sign } = jwt;
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

describe.only('when a user is signed in', async () => {
  let token = '';
  beforeEach(async () => {
    await User.find({}).deleteMany();
    //Create user
    const password = 'Password';
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      username: 'SignedInUser',
      name: 'Name',
      passwordHash,
    });
    const savedUser = await user.save();
    const userForToken = {
      username: savedUser.username,
      id: savedUser._id,
    };
    // @ts-ignore
    token = sign(userForToken, process.env.SECRET, {
      expiresIn: 60,
    });
  });

  test.only('Creates a new blog post', async () => {
    const title = 'Test Title';
    const newBlog = {
      title,
      author: 'Test Author',
      url: 'Test URL',
      likes: 12,
    };
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const blogs = await getBlogsInDB();
    assert(blogs.length === getInitialAmountOfBlogs() + 1);
    const titles = blogs.map((blog) => blog.title);
    assert(titles.includes(title));
  });

  test.only('Default likes property to 0 if likes property missing', async () => {
    const title = 'Test Title';
    const newBlog = {
      title,
      author: 'Test Author',
      url: 'Test URL',
    };
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const blogs = await getBlogsInDB();
    const newBlogFromDB = blogs.find((blog) => blog.title === title);
    assert(newBlogFromDB?.likes === 0);
  });

  test.only('Respond with 422 Unprocessable Content if title or url properties missing', async () => {
    const newBlog = {
      author: 'Test Author',
    };
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(422);
  });

  //TODO doesn't work,need to add a blog with signed in user before deleting
  test('Delete a single blog post', async () => {
    const blogsAtStart = await getBlogsInDB();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await getBlogsInDB();

    const titles = blogsAtEnd.map((r) => r.title);
    assert(!titles.includes(blogToDelete.title));

    assert.strictEqual(blogsAtEnd.length, getInitialAmountOfBlogs() - 1);
  });
});
//TODO doesn't work,need to add a blog with signed in user before updating
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
