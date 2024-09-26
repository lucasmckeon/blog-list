import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import mongoose from 'mongoose';
import { MONGODB_URI } from './utils/config.js';
import { blogsRouter } from './controllers/blogs.js';
import { usersRouter } from './controllers/users.js';
import { loginRouter } from './controllers/login.js';
import {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
} from './utils/middleware.js';
import { error, info } from './utils/logger.js';
const app = express();

const mongoUrl = MONGODB_URI;
if (mongoUrl === undefined) throw new Error('Mongo URL undefined');
mongoose
  .connect(mongoUrl)
  .then(() => {
    info('Connected to MongoDB!');
  })
  .catch((e) => {
    error('Error connecting to database', e.message);
    throw e;
  });

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(tokenExtractor);
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use(unknownEndpoint);
app.use(errorHandler);

export { app };
