import * as redis from 'redis';
import * as dotenv from 'dotenv';
import { promisify } from 'util';

// Initiate dotenv config
dotenv.config();
// Create redis client connection
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  auth_pass: process.env.REDIS_AUTH,
  retry_strategy: (options: redis.RetryStrategyOptions) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      console.log('[REDIS] The server refused the connection');
    }
    if (options.total_retry_time > 10000 * 60 * 60) {
      console.log('[REDIS] Retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt >= 100) {
      console.log('[REDIS] Retry attempt exhausted');
      return new Error('Retry time exhausted');
    }
    return Math.min(options.attempt * 100, 3000);
  },
});

export const redisCreateConnection = async (): Promise<void> => {
  redisClient.on('error', (err) => {
    console.log(`[REDIS] `, JSON.stringify(err));
  });
  redisClient.on('reconnecting', () => {
    console.log('[REDIS] Reconnecting...');
  });
  redisClient.on('ready', () => {
    console.log('[REDIS] Ready');
  });
};

// Wrapper redis get and set in Promise
const GetAsync = promisify(redisClient.get).bind(redisClient);
const SetAsync = promisify(redisClient.setex).bind(redisClient);
const DelAsync = promisify(redisClient.del).bind(redisClient);
const FlushAsync = promisify(redisClient.flushall).bind(redisClient);

// contoh penggunaan: const dataAllProfile = await redisGetAsync("allProfile");
export const redisGetAsync = GetAsync;
// contoh penggunaan: await redisSetAsync("allProfile", 300, JSON.stringify(dataAllProfile));
export const redisSetAsync = SetAsync;
export const redisDelAsync = DelAsync;
export const redisFlushAsync = FlushAsync;
