import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { getInvalidPasswordError } from '../utils/errors.js';

const usersRouter = express.Router();

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', 'title author url');
  response.json(users);
});

usersRouter.post('/', async (request, response) => {
  const { password } = request.body;
  if (!password || password.length < 3) {
    throw getInvalidPasswordError();
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
