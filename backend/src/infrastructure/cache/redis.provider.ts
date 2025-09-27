import { FactoryProvider } from '@nestjs/common';
import { createClient } from 'redis';

export type AppRedisClient = ReturnType<typeof createClient>;

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider: FactoryProvider<AppRedisClient> = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    const redisUrl = `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
    const client = createClient({
      url: redisUrl,
    });

    client.on('error', (err) => console.error('Redis Client Error:', err));

    await client.connect();

    console.log('Redis client connected successfully.');

    return client;
  },
};
