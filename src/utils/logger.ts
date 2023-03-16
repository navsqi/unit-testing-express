import loggerPino from 'pino';
import dayjs from 'dayjs';

const logger = loggerPino({
  base: {},
  timestamp: () => `,"time":"${dayjs().format('YYYY/MM/DD HH:mm:ss')}"`,
});

export default logger;
