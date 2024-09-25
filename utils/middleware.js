import { info, error } from '../utils/logger.js';

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
  } else if (err.name === 'InvalidUsername') {
    return response.status(401).json({
      error: 'Username is not valid',
    });
  } else if (err.name === 'PasswordValidationFailed') {
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
  } else if (err.name === 'UsernamePasswordValidationError') {
    return response.status(422).json({
      error:
        'Username and password must provided and be at least 3 characters long',
    });
  }
  next(err);
};

export { requestLogger, unknownEndpoint, errorHandler };
