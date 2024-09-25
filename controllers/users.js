import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';

const usersRouter = express.Router();

usersRouter.get('/', async (request, response) => {
  const users = await User.find({});
  response.json(users);
});

usersRouter.post('/', async (request, response) => {
  const { username, password } = request.body;
  if (!username || username.length < 3 || !password || password.length < 3) {
    const error = new Error(
      'Username and password must provided and be at least 3 characters long'
    );
    error.name = 'UsernamePasswordValidationError';
    throw error;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({
    ...request.body,
    passwordHash,
  });
  const savedUser = await user.save();
  response.status(201).json(savedUser);
  return;
});

export { usersRouter };
