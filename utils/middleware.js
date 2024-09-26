import { User } from '../models/user.js';
import { info, error } from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import {
  getNoTokenProvidedError,
  getTokenInvalidError,
  getUserNotFound,
} from './errors.js';

const userExtractor = async (request, response, next) => {
  const token = request.token;
  if (!token) {
    throw getNoTokenProvidedError();
  }
  const secret = process.env.SECRET;
  if (!secret) throw new Error('process.env.SECRET is undefined');
  const userFromToken = jwt.verify(token, secret);
  // @ts-ignore
  if (!userFromToken.id) {
    throw getTokenInvalidError();
  }
  // @ts-ignore
  const user = await User.findById(userFromToken.id);
  if (user === null) {
    throw getUserNotFound();
  }
  request.user = user;
  next();
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '');
  }
  next();
};

const requestLogger = (request, response, next) => {
  info('Method:', request.method);
  info('Path:  ', request.path);
  info('Body:  ', request.body);
  info('---');
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (err, request, response, next) => {
  error(err.message);
  if (err.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (err.name === 'UserNotFoundDuringSaveBlog') {
    return response.status(404).json({
      error:
        'Blog post unable to be saved because blogs creator cannot be found',
    });
  } else if (err.name === 'InvalidPassword') {
    return response.status(422).json({
      error: 'Password must be at least 3 characters long',
    });
  } else if (err.name === 'IncorrectPassword') {
    return response.status(401).json({
      error: 'Password is incorrect',
    });
  } else if (err.name === 'NoTokenProvided') {
    return response.status(401).json({
      error: 'No token provided',
    });
  } else if (err.name === 'InvalidToken') {
    return response.status(401).json({
      error: 'Invalid token',
    });
  } else if (err.name === 'ValidationError') {
    return response.status(422).send({ error: err.message });
  } else if (
    err.name === 'MongoServerError' &&
    err.message.includes('E11000 duplicate key error')
  ) {
    return response
      .status(422)
      .json({ error: 'expected `username` to be unique' });
  } else if (err.name === 'DeleteBlogFailed') {
    return response.status(404).json({
      error: 'Deletion of blog failed',
    });
  } else if (err.name === 'UserNotFound') {
    return response.status(404).json({
      error: 'User not found',
    });
  } else if (err.name === 'BlogNotFound') {
    return response.status(404).json({
      error: 'Blog not found',
    });
  }

  return response.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
};

export {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
