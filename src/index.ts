import 'dotenv/config';
import express from 'express';
import actuator from 'express-actuator';
import morgan from 'morgan';
import 'reflect-metadata';
import globalError from './middlewares/globalError';
import { dbCreateConnection } from './orm/dbCreateConnection';
// import { redisCreateConnection } from './config/redis';
import routes from './routes';
import CustomError from './utils/customError';
import './utils/customErrorValidation';
import './utils/customSuccess';

(async () => {
  // await redisCreateConnection();
  await dbCreateConnection();
})();

export const app = express();

app.use(morgan('dev'));
app.use(actuator());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use('/', routes);

app.all('/*', (req, res, next) => {
  next(new CustomError(`Not Found (${req.method} ${req.originalUrl})`, 404));
});

app.use(globalError);

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', (err: Error) => {
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated!');
  });
});
