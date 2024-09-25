import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import { app } from '../app.js';
import mongoose from 'mongoose';
import { User } from '../models/user.js';

const api = supertest(app);

beforeEach(async () => {
  await User.find({}).deleteMany();
});

test('create new user', async () => {
  const user = {
    username: 'Tests',
    name: 'Test name',
    password: 'Password',
  };
  const response = await api.post('/api/users').send(user).expect(201);
  const savedUser = response.body;
  assert(
    !savedUser.password &&
      !savedUser.passwordHash &&
      savedUser.username === 'Tests' &&
      savedUser.name === 'Test name'
  );
});

test.only('username and password provided and at least 3 characters', async () => {
  const invalidUser1 = {
    username: 'aa',
    password: 'ddddd',
    name: 'Jkfkfk',
  };
  const invalidUser2 = {
    username: 'aaaaa',
    password: 'dd',
    name: 'Jkfkfk',
  };
  const invalidUser3 = {
    password: 'd',
    name: 'Jkfkfk',
  };
  const invalidUser4 = {
    username: 'aaaaa',
    name: 'Jkfkfk',
  };
  await api.post('/api/users').send(invalidUser1).expect(422);
  await api.post('/api/users').send(invalidUser2).expect(422);
  await api.post('/api/users').send(invalidUser3).expect(422);
  const result = await api.post('/api/users').send(invalidUser4).expect(422);
  assert(
    result.body.errorMessage ===
      'Username and password must provided and be at least 3 characters long'
  );

  const validUser = {
    username: 'aaa',
    password: 'ddd',
    name: 'Jkfkfk',
  };
  await api.post('/api/users').send(validUser).expect(201);
});

after(() => {
  mongoose.connection.close();
});
