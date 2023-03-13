import 'dotenv/config';
import 'reflect-metadata';
import '~/config/check-env';
import createServer from './createServer';
// import { redisCreateConnection } from './config/redis';
import connect from './utils/connect';
import './utils/customErrorValidation';
import './utils/customSuccess';
import logger from './utils/logger';

process.on('uncaughtException', (err) => {
  logger.error(err.name, 'UNCAUGHT_EXCEPTION');
  logger.error(err.message, 'UNCAUGHT_EXCEPTION');
  process.exit(1);
});

export const app = createServer();

const port = process.env.PORT || 4000;

const server = app.listen(port, async () => {
  logger.info('EXPRESS', `Server is running on port ${port}`);
  await connect();
});

process.on('unhandledRejection', (err: Error) => {
  logger.error(err, 'EXPRESS_UNHANDLED_ERR');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    logger.error('Process terminated!', 'EXPRESS_SIGTERM');
  });
});
