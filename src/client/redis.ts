import Redis from 'ioredis';

let redisInstance: Redis | null = null;

export const getRedisClient = () => {
  if (!redisInstance) {
    redisInstance = new Redis({
      port: Number(process.env.NEXT_PUBLIC_REDIS_PORT),
      host: process.env.NEXT_PUBLIC_REDIS_HOST,
      username: process.env.NEXT_PUBLIC_REDIS_USER,
      password: process.env.NEXT_PUBLIC_REDIS_PWD,
      db: 0,
    });
  }
  return redisInstance;
};