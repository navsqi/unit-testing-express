import cors from 'cors';
import express from 'express';
import actuator from 'express-actuator';
import morgan from 'morgan';
import 'reflect-metadata';
import globalError from './middlewares/globalError';
// import { redisCreateConnection } from './config/redis';
import routes from './routes';
import CustomError from './utils/customError';

const createServer = () => {
  const app = express();

  app.enable('trust proxy');
  app.use(cors());
  app.options('*', cors());

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    app.use(actuator());
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true, limit: '200mb' }));
  app.use('/', routes);

  app.all('/*', (req, res, next) => {
    next(new CustomError(`Not Found (${req.method} ${req.originalUrl})`, 404));
  });

  app.use(globalError);

  return app;
};

export default createServer;
