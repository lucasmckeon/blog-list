import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import {
  getInvalidUsernameError,
  getIncorrectPasswordError,
} from '../utils/errors.js';
const { sign } = jwt;
const { compare } = bcrypt;
const loginRouter = express.Router();

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body;

  const user = await User.findOne({ username });
  if (!user) throw getInvalidUsernameError();

  const isPasswordCorrect = await compare(password, user.passwordHash);
  if (!isPasswordCorrect) throw getIncorrectPasswordError();

  //Generate and send token
  const userForToken = {
    username: user.username,
    id: user._id,
  };
  // @ts-ignore
  const token = sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 });
  response.json({ token, username: user.username, name: user.name });
});

export { loginRouter };
