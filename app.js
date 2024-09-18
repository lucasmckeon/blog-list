import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { MONGODB_URI } from './utils/config.js';
import { blogsRouter } from './controllers/blogs.js';
import {
  requestLogger,
  unknownEndpoint,
  errorHandler,
} from './utils/middleware.js';
import { error, info } from './utils/logger.js';
const app = express();

const mongoUrl = MONGODB_URI;
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
app.use('/api/blogs', blogsRouter);
app.use(unknownEndpoint);
app.use(errorHandler);

export { app };
