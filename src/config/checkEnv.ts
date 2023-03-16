const envs = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASS',
  'DB_NAME',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_AUTH',
  'JWT_SECRET_KEY',
  'JWT_EXPIRATION_HOURS',
  'BASIC_USERNAME',
  'BASIC_PASSWORD',
];

for (const val of envs) {
  if (!process.env[val]) {
    throw new Error(`Environment ${val} is not set`);
  }
}
