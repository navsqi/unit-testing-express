import 'dotenv/config';
import express from 'express';
import actuator from 'express-actuator';
import morgan from 'morgan';
import 'reflect-metadata';
import cors from 'cors';
import globalError from './middlewares/globalError';
import { dbCreateConnection } from './orm/dbCreateConnection';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
// import { redisCreateConnection } from './config/redis';
import routes from './routes';
import CustomError from './utils/customError';
import './utils/customErrorValidation';
import './utils/customSuccess';
// import cronJob from './config/cron';

(async () => {
  await dbCreateConnection();

  // if (!cronJob.running) {
  //   cronJob.start();
  //   console.log('Cron is running...');
  // }
})();

export const app = express();

app.enable('trust proxy');
app.use(cors());
app.options('*', cors());

Sentry.init({
  dsn: `${process.env.NODE_ENV !== 'development' ? 'https' : 'http'}:${process.env.SENTRY_DSN}`,
  debug: false,
  integrations: [
    // Enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // Enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  tracesSampleRate: 1.0,
});

// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

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

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

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
